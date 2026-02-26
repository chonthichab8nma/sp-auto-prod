import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import type { StepStatus } from "../../Type";
import type {
  JobApi,
  JobStatusApi,
  JobStepStatusApi,
} from "../../features/jobs/api/job.api";
import {
  vehiclesService,
  type VehicleBrandApi,
} from "../../features/jobs/services/vehicles.service";
import { resolveBrandLogoUrl } from "../../features/jobs/lib/vehicleCatalog";
import { sortJobStages, sortJobSteps } from "../../features/jobs/lib/stage";
import type { EmployeeApi } from "../api/employees.api";
import { printWorkOrder } from "../pdf/workOrderPrint";
import { useStationProgressMutation } from "./useStationProgressMutation";
import type { StepVM } from "../components/StepTimeline";
import {
  deleteJobReceipt,
  uploadJobReceipt,
  type JobReceiptUploadResponse,
} from "../../features/jobs/api/receipt.api";
import { toThaiErrorMessage } from "../../shared/lib/errorMessage";
import { jobsService } from "../../features/jobs/services/jobs.service";

function isDone(status: StepStatus | JobStepStatusApi) {
  return status === "completed" || status === "skipped";
}

function toJobStatus(stageCode?: string | null): JobStatusApi | null {
  const code = (stageCode ?? "").trim().toUpperCase();
  if (code === "CLAIM" || code === "REPAIR" || code === "BILLING") return code;
  return null;
}

type Params = {
  job: JobApi;
  forcedEmployee?: EmployeeApi | null;
  onUpdateStep: (
    stageIdx: number,
    stepId: string,
    status: StepStatus,
    employeeId: number | null,
  ) => void;
};

export function useStationProgressViewModel({
  job,
  forcedEmployee = null,
  onUpdateStep,
}: Params) {
  const [jobState, setJobState] = useState<JobApi>(job);
  const [brands, setBrands] = useState<VehicleBrandApi[]>([]);
  const [logoLoadError, setLogoLoadError] = useState(false);
  const [checkpointIndex, setCheckpointIndex] = useState(0);
  const [followMode, setFollowMode] = useState(true);
  const [activeStepId, setActiveStepId] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeApi | null>(
    null,
  );
  const [selectedAction, setSelectedAction] = useState<StepStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBulkSkipConfirm, setShowBulkSkipConfirm] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadedReceipt, setUploadedReceipt] =
    useState<JobReceiptUploadResponse | null>(null);

  const { saveStep, saving, saveError } = useStationProgressMutation();

  useEffect(() => {
    setJobState(job);
  }, [job]);

  useEffect(() => {
    if (!forcedEmployee) return;
    if (selectedEmployee?.id === forcedEmployee.id) return;
    setSelectedEmployee(forcedEmployee);
  }, [forcedEmployee, selectedEmployee?.id]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await vehiclesService.listBrands();
        if (!alive) return;
        setBrands(data);
      } catch {
        if (!alive) return;
        setBrands([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (saveError) toast.error(`บันทึกไม่สำเร็จ: ${saveError}`);
  }, [saveError]);

  const stages = useMemo(
    () => sortJobStages(jobState.jobStages ?? []),
    [jobState.jobStages],
  );

  const stageIdx = useMemo(() => {
    if (stages.length === 0) return 0;
    const raw = jobState.currentStageIndex ?? 0;
    const clamped =
      typeof raw === "number"
        ? Math.min(Math.max(raw, 0), stages.length - 1)
        : null;

    const byStatusCode = stages.findIndex(
      (stage) =>
        (stage.stage.code ?? "").toLowerCase() === jobState.status.toLowerCase(),
    );
    if (byStatusCode >= 0) return byStatusCode;
    return clamped ?? 0;
  }, [stages, jobState.currentStageIndex, jobState.status]);

  useEffect(() => {
    setFollowMode(true);
  }, [jobState.id]);

  useEffect(() => {
    if (!followMode) return;
    setCheckpointIndex(stageIdx);
  }, [followMode, stageIdx]);

  const viewingStage = stages[checkpointIndex];
  const viewingStageSteps = useMemo(
    () => sortJobSteps(viewingStage?.jobSteps ?? []),
    [viewingStage?.jobSteps],
  );

  const isStageDone = useMemo(() => {
    if (!viewingStageSteps.length) return false;
    return viewingStageSteps.every((step) => isDone(step.status));
  }, [viewingStageSteps]);

  const stepsVm: StepVM[] = useMemo(() => {
    return viewingStageSteps.map((step) => ({
      ...step,
      id: String(step.id),
      name: step.stepTemplate?.name ?? "-",
      status: (step.status ?? "pending") as StepStatus,
      timestamp: step.completedAt,
      isSkippable: Boolean(step.stepTemplate?.isSkippable),
      employee: step.employee ? { name: step.employee.name } : undefined,
      hasImages: (step.images ?? []).some(
        (img) => !String(img.fileName ?? "").startsWith("__receipt__"),
      ),
      hasReceipts: (step.images ?? []).some((img) =>
        String(img.fileName ?? "").startsWith("__receipt__"),
      ),
    }));
  }, [viewingStageSteps]);

  useEffect(() => {
    if (!stepsVm.length) {
      setActiveStepId("");
      return;
    }
    const nextPending = stepsVm.find((step) => !isDone(step.status));
    setActiveStepId(nextPending?.id ?? stepsVm[stepsVm.length - 1]?.id ?? "");
  }, [checkpointIndex, stepsVm]);

  const activeStep = useMemo(
    () => stepsVm.find((step) => step.id === activeStepId),
    [activeStepId, stepsVm],
  );

  const isRepairStage = jobState.status === "REPAIR";
  const stepsToSkip = useMemo(() => {
    if (!isRepairStage) return [];
    const allSteps = stepsVm.slice(0, -2);
    return allSteps.filter((step) => !isDone(step.status));
  }, [isRepairStage, stepsVm]);

  const lastStepIdForViewingStage = useMemo(() => {
    if (!viewingStageSteps.length) return null;
    return String(viewingStageSteps[viewingStageSteps.length - 1].id);
  }, [viewingStageSteps]);

  const isSavingLastStepNow =
    lastStepIdForViewingStage != null &&
    String(activeStepId) === String(lastStepIdForViewingStage);

  const billingStageIndex = useMemo(
    () =>
      stages.findIndex(
        (stage) => (stage.stage.code ?? "").toUpperCase() === "BILLING",
      ),
    [stages],
  );

  const isRepairCustomerReceiveStep = useMemo(() => {
    if (jobState.status !== "REPAIR") return false;
    const rawName = activeStep?.name ?? "";
    const normalized = rawName.replace(/\s+/g, "");
    return normalized.includes("ลูกค้ารับรถ") || normalized.includes("ถูกค้ารับรถ");
  }, [activeStep?.name, jobState.status]);

  const isViewingBillingStage = useMemo(() => {
    const currentStageCode = stages[checkpointIndex]?.stage.code ?? "";
    return currentStageCode.toUpperCase() === "BILLING";
  }, [checkpointIndex, stages]);
  const isPaymentDateStep = useMemo(() => {
    const normalizedStepName = (activeStep?.name ?? "").replace(/\s+/g, "");
    return normalizedStepName.includes("วันจ่ายเงิน");
  }, [activeStep?.name]);

  const receiptSnapshot = useMemo(() => {
    const jobReceipt = jobState as JobApi & {
      receiptR2Key?: string;
      receiptFileName?: string;
      receiptMimeType?: string;
      receiptFileSize?: number;
      receiptUploadedAt?: string;
      receiptViewUrl?: string;
      receiptUrl?: string;
    };
    const photoReceipt = (
      jobState?.jobPhotos as Array<Record<string, unknown>> | undefined
    )?.find((img) => String(img?.fileName ?? "").startsWith("__receipt__"));

    const fallbackUrl =
      (jobReceipt.receiptViewUrl as string | undefined) ||
      (jobReceipt.receiptUrl as string | undefined) ||
      (photoReceipt?.viewUrl as string | undefined) ||
      (photoReceipt?.url as string | undefined) ||
      "";

    const hasReceiptHint = Boolean(
      jobReceipt.receiptFileName ||
        jobReceipt.receiptR2Key ||
        jobReceipt.receiptViewUrl ||
        jobReceipt.receiptUrl ||
        photoReceipt,
    );

    return {
      fallbackUrl,
      hasReceiptHint,
      receiptFileName:
        (jobReceipt.receiptFileName as string | undefined) ||
        (photoReceipt?.fileName as string | undefined) ||
        "receipt",
      receiptUrl:
        (jobReceipt.receiptUrl as string | undefined) ||
        (photoReceipt?.url as string | undefined) ||
        fallbackUrl,
      receiptMimeType:
        (jobReceipt.receiptMimeType as string | undefined) ||
        (photoReceipt?.mimeType as string | undefined) ||
        "application/octet-stream",
      receiptFileSize:
        (jobReceipt.receiptFileSize as number | undefined) ||
        (photoReceipt?.fileSize as number | undefined) ||
        0,
      receiptUploadedAt:
        (jobReceipt.receiptUploadedAt as string | undefined) ||
        new Date().toISOString(),
    };
  }, [jobState]);

  useEffect(() => {
    if (!isViewingBillingStage || !isPaymentDateStep) return;
    if (!receiptSnapshot.hasReceiptHint) {
      setUploadedReceipt(null);
      return;
    }

    if (receiptSnapshot.fallbackUrl) {
      setUploadedReceipt({
        jobId: jobState.id,
        receiptFileName: receiptSnapshot.receiptFileName,
        receiptUrl: receiptSnapshot.receiptUrl,
        receiptMimeType: receiptSnapshot.receiptMimeType,
        receiptFileSize: receiptSnapshot.receiptFileSize,
        receiptUploadedAt: receiptSnapshot.receiptUploadedAt,
        receiptViewUrl: receiptSnapshot.fallbackUrl,
      });
    } else {
      setUploadedReceipt(null);
    }
  }, [isViewingBillingStage, isPaymentDateStep, jobState.id, receiptSnapshot]);

  const brandLogoUrl = useMemo(
    () => resolveBrandLogoUrl(brands, jobState.vehicle?.brand),
    [brands, jobState.vehicle?.brand],
  );

  useEffect(() => {
    setLogoLoadError(false);
  }, [brandLogoUrl]);

  const canPrintBillingPdf = isViewingBillingStage && isSavingLastStepNow;
  const isDoneStatus = jobState.status === "DONE";

  const handleDownloadPdf = async () => {
    const toastId = toast.loading("กำลังสร้างไฟล์ PDF...");
    try {
      await printWorkOrder(jobState);
      toast.success("ดาวน์โหลด PDF เรียบร้อย", { id: toastId });
    } catch {
      toast.error("สร้าง PDF ไม่สำเร็จ", { id: toastId });
    }
  };

  const handleBulkSkip = async () => {
    if (stepsToSkip.length === 0) {
      toast.error("ไม่มีขั้นตอนที่ต้องข้าม");
      setShowBulkSkipConfirm(false);
      return;
    }

    const willBeStageDone =
      stepsVm.length > 0 &&
      stepsVm.every((step) => {
        if (String(step.id) === String(activeStepId)) {
          return selectedAction === "completed" || selectedAction === "skipped";
        }
        return isDone(step.status);
      });

    const tId = toast.loading("กำลังข้ามขั้นตอน...");
    try {
      for (const step of stepsToSkip) {
        await saveStep({ stepId: step.id, status: "skipped" });
      }

      onUpdateStep(checkpointIndex, stepsToSkip[0].id, "skipped", null);

      if (isSavingLastStepNow && willBeStageDone) {
        setCheckpointIndex((index) => Math.min(stages.length - 1, index + 1));
      }

      toast.dismiss(tId);
      toast.success(`ข้าม ${stepsToSkip.length} ขั้นตอนสำเร็จ`);
      setShowBulkSkipConfirm(false);

      const qcStep = stepsVm[stepsVm.length - 2];
      if (qcStep) setActiveStepId(qcStep.id);
    } catch {
      toast.dismiss(tId);
      toast.error("ข้ามขั้นตอนไม่สำเร็จ");
    }
  };

  const handleSave = async () => {
    setError(null);
    const employeeForSave = forcedEmployee ?? selectedEmployee;

    if (!selectedAction || selectedAction === "pending") {
      toast.error("กรุณาเลือกสถานะก่อนบันทึก");
      return;
    }

    const needEmployee =
      selectedAction === "completed" || selectedAction === "in_progress";
    if (needEmployee && employeeForSave == null) {
      setError("กรุณาระบุชื่อผู้ดำเนินการ");
      toast.error("กรุณาระบุชื่อผู้ดำเนินการ");
      return;
    }

    if (!activeStepId) {
      toast.error("กรุณาเลือกรายการก่อนบันทึก");
      return;
    }

    const tId = toast.loading("กำลังบันทึก...");
    const nowIso = new Date().toISOString();
    try {
      await saveStep({
        stepId: activeStepId,
        status: selectedAction,
        employeeId: employeeForSave?.id,
      });

      const shouldMarkInsuranceDisbursed =
        isViewingBillingStage &&
        isPaymentDateStep &&
        selectedAction === "completed" &&
        (jobState.paymentType ?? "").toLowerCase() === "insurance" &&
        Number(jobState.claimAmount ?? 0) > 0;

      if (shouldMarkInsuranceDisbursed) {
        const disbursedAmount = Number(jobState.claimAmount ?? 0);
        const res = await jobsService.update(jobState.id, {
          disbursedAmount,
          disbursementDate: nowIso,
        });

        if (!res.ok) {
          throw new Error(res.error || "อัปเดตข้อมูลรับเงินประกันไม่สำเร็จ");
        }

        setJobState((prev) => ({
          ...prev,
          disbursedAmount,
          disbursementDate: nowIso,
        }));
      }

      const shouldPromoteToBillingNow =
        isRepairCustomerReceiveStep &&
        selectedAction === "completed" &&
        billingStageIndex >= 0;

      if (shouldPromoteToBillingNow) {
        const moveToBillingRes = await jobsService.update(jobState.id, {
          status: "BILLING",
          currentStageIndex: billingStageIndex,
        });
        if (!moveToBillingRes.ok) {
          toast.error(
            toThaiErrorMessage(
              moveToBillingRes.error,
              "อัปเดตสถานะเป็นตั้งเบิกไม่สำเร็จ",
            ),
          );
        }
      }

      onUpdateStep(
        checkpointIndex,
        activeStepId,
        selectedAction,
        employeeForSave?.id ?? null,
      );

      const stageDoneNow =
        stepsVm.length > 0 &&
        stepsVm.every((step) => {
          if (String(step.id) === String(activeStepId)) {
            return selectedAction === "completed" || selectedAction === "skipped";
          }
          return isDone(step.status);
        });

      const shouldAutoAdvance =
        isSavingLastStepNow && stageDoneNow && checkpointIndex === stageIdx;
      const shouldJumpToBilling =
        isRepairCustomerReceiveStep &&
        selectedAction === "completed" &&
        billingStageIndex >= 0;

      setJobState((prev) => {
        const sortedStages = sortJobStages(prev.jobStages ?? []);
        const stage = sortedStages[checkpointIndex];
        if (!stage) return prev;

        const sortedSteps = sortJobSteps(stage.jobSteps ?? []);
        const lastStepId = sortedSteps[sortedSteps.length - 1]?.id
          ? String(sortedSteps[sortedSteps.length - 1].id)
          : null;

        const updatedSteps = (stage.jobSteps ?? []).map((step) =>
          String(step.id) === String(activeStepId)
            ? {
                ...step,
                status: selectedAction as JobStepStatusApi,
                employeeId: employeeForSave?.id ?? null,
                completedAt:
                  selectedAction === "completed" || selectedAction === "skipped"
                    ? new Date().toISOString()
                    : step.completedAt,
              }
            : step,
        );

        const stageDone =
          updatedSteps.length > 0 && updatedSteps.every((step) => isDone(step.status));
        const isSavingLastStep =
          lastStepId != null && String(activeStepId) === String(lastStepId);
        const newStages = sortedStages.map((item, index) =>
          index === checkpointIndex ? { ...item, jobSteps: updatedSteps } : item,
        );
        const prevIdx = prev.currentStageIndex ?? 0;
        const isLastStation = checkpointIndex >= newStages.length - 1;
        const movedNext = isSavingLastStep && stageDone;
        const nextIdx = movedNext
          ? Math.min(prevIdx + 1, newStages.length - 1)
          : prevIdx;
        const jumpBilling = shouldJumpToBilling && billingStageIndex >= 0;
        const nextStatus: JobStatusApi = jumpBilling
          ? (toJobStatus(newStages[billingStageIndex]?.stage.code) ?? "BILLING")
          : movedNext
            ? isLastStation
              ? "DONE"
              : (toJobStatus(newStages[nextIdx]?.stage.code) ?? prev.status)
            : prev.status;

        return {
          ...prev,
          jobStages: newStages,
          status: nextStatus,
          currentStageIndex: jumpBilling ? billingStageIndex : nextIdx,
          updatedAt: nowIso,
        };
      });

      if (shouldJumpToBilling) {
        setFollowMode(false);
        setCheckpointIndex(billingStageIndex);
      } else if (shouldAutoAdvance) {
        setCheckpointIndex((index) => Math.min(index + 1, stages.length - 1));
      }

      setSelectedEmployee(forcedEmployee ?? null);
      toast.dismiss(tId);
      toast.success("บันทึกสำเร็จ");
    } catch {
      toast.dismiss(tId);
    }
  };

  const validateReceiptFile = (file: File | null): string | null => {
    if (!file) return "กรุณาเลือกไฟล์ใบเสร็จ";
    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (file.size > maxSize) return "ไฟล์ใบเสร็จต้องไม่เกิน 10MB";
    if (!allowedTypes.includes(file.type)) {
      return "รองรับไฟล์ใบเสร็จเฉพาะ pdf, jpg, png, webp";
    }
    return null;
  };

  const handleUploadReceiptNow = async (fileOverride?: File | null) => {
    const targetFile = fileOverride ?? receiptFile;
    const errorMessage = validateReceiptFile(targetFile);
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    const tId = toast.loading("กำลังอัปโหลดใบเสร็จ...");
    try {
      const receipt = await uploadJobReceipt(jobState.id, targetFile as File);
      setUploadedReceipt(receipt);
      setReceiptFile(null);
      toast.success("อัปโหลดใบเสร็จสำเร็จ", { id: tId });
    } catch (err) {
      toast.error(toThaiErrorMessage(err, "อัปโหลดใบเสร็จไม่สำเร็จ"), { id: tId });
    }
  };

  const handleDeleteUploadedReceipt = async () => {
    if (!uploadedReceipt) return;
    const tId = toast.loading("กำลังลบใบเสร็จ...");
    try {
      await deleteJobReceipt(jobState.id);
      setUploadedReceipt(null);
      setReceiptFile(null);
      toast.success("ลบใบเสร็จเรียบร้อย", { id: tId });
    } catch (err) {
      toast.error(toThaiErrorMessage(err, "ลบใบเสร็จไม่สำเร็จ"), { id: tId });
    }
  };

  const handleSelectStep = (id: string) => {
    setActiveStepId(id);
    setSelectedAction(null);
    setError(null);
    setReceiptFile(null);
    setUploadedReceipt(null);

    if (window.innerWidth < 1280) {
      setTimeout(() => {
        document.getElementById("action-panel-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const handleRemarkSaved = (stepId: string, remark: string) => {
    setJobState((prev) => {
      const newStages = (prev.jobStages ?? []).map((stage) => ({
        ...stage,
        jobSteps: (stage.jobSteps ?? []).map((step) =>
          String(step.id) === String(stepId) ? { ...step, remark } : step,
        ),
      }));

      return {
        ...prev,
        jobStages: newStages,
      };
    });
  };

  return {
    jobState,
    setJobState,
    logoLoadError,
    setLogoLoadError,
    checkpointIndex,
    setCheckpointIndex,
    followMode,
    setFollowMode,
    stages,
    stageIdx,
    isStageDone,
    stepsVm,
    activeStepId,
    activeStep,
    selectedEmployee,
    setSelectedEmployee,
    selectedAction,
    setSelectedAction,
    error,
    receiptFile,
    setReceiptFile,
    uploadedReceipt,
    showReceiptUploader: isViewingBillingStage && isPaymentDateStep,
    handleUploadReceiptNow,
    handleDeleteUploadedReceipt,
    saving,
    showBulkSkipConfirm,
    setShowBulkSkipConfirm,
    isRepairStage,
    stepsToSkip,
    canPrintBillingPdf,
    brandLogoUrl,
    isDoneStatus,
    handleDownloadPdf,
    handleBulkSkip,
    handleSave,
    handleSelectStep,
    handleRemarkSaved,
  };
}
