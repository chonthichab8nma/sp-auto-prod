import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Check } from "lucide-react";
import toast from "react-hot-toast";

import type { StepStatus } from "../../Type";
import type {
  JobApi,
  JobStageApi,
  JobStepStatusApi,
} from "../../features/jobs/api/job.api";

import StageStepper from "../components/StageStepper";
import StepTimeline, { type StepVM } from "../components/StepTimeline";
import StepActionPanel from "../components/StepActionPanel";
import { useStationProgressMutation } from "../hooks/useStationProgressMutation";
import ProgressHeader from "../components/ProgressHeader";
import { useEmployeesQuery } from "../hooks/useEmployeesQuery";
import type { EmployeeApi } from "../api/employees.api";

function sortStages(stages: JobStageApi[]) {
  return stages.slice().sort((a, b) => a.stage.orderIndex - b.stage.orderIndex);
}

export default function StationProgressPage({
  job,
  isRefetching = false,
  onUpdateStep,
}: {
  job: JobApi;
  isRefetching?: boolean;
  onUpdateStep: (
    stageIdx: number,
    stepId: string,
    status: StepStatus,
    employeeId: number | null,
  ) => void;
}) {
  const navigate = useNavigate();

  const [jobState, setJobState] = useState<JobApi>(job);

  useEffect(() => {
    setJobState(job);
  }, [job]);

  const stages = useMemo(
    () => sortStages(jobState.jobStages ?? []),
    [jobState.jobStages],
  );

  /**
   * ตำแหน่งสถานีจริง
   */

  //stageIdx = สถานีจริง (ในระบบนี้ status = CLAIM/REPAIR/BILLING/DONE 1:1 กับ stage.code)
  const stageIdx = useMemo(() => {
    if (stages.length === 0) return 0;
    const raw = jobState.currentStageIndex ?? 0;
    const clamped =
      typeof raw === "number"
        ? Math.min(Math.max(raw, 0), stages.length - 1)
        : null;

    const byStatusCode = stages.findIndex(
      (s) =>
        (s.stage.code ?? "").toLowerCase() === jobState.status.toLowerCase(),
    );

    if (byStatusCode >= 0) return byStatusCode;

    return clamped ?? 0;
  }, [stages, jobState.status, jobState.currentStageIndex]);

  /**
   * checkpointIndex = ตำแหน่งสเตชั่นที่ผู้ใช้กำลังเปิดดู
   */

  const [checkpointIndex, setCheckpointIndex] = useState(stageIdx);
  const [followMode, setFollowMode] = useState(true);

  useEffect(() => {
    setFollowMode(true);
  }, [jobState.id]);

  useEffect(() => {
    if (!followMode) return;
    setCheckpointIndex(stageIdx);
  }, [stageIdx, followMode]);

  const isStageDone = useMemo(() => {
    const st = stages[checkpointIndex];
    const steps = st?.jobSteps ?? [];
    if (steps.length === 0) return false;
    return steps.every(
      (s) => s.status === "completed" || s.status === "skipped",
    );
  }, [stages, checkpointIndex]);

  const stepsVm: StepVM[] = useMemo(() => {
    const viewingStage = stages[checkpointIndex];
    const steps = (viewingStage?.jobSteps ?? [])
      .slice()
      .sort((a, b) => a.stepTemplate.orderIndex - b.stepTemplate.orderIndex);

    return steps.map((s) => ({
      ...s,
      id: String(s.id),
      name: s.stepTemplate?.name ?? "-",
      status: (s.status ?? "pending") as StepStatus,
      timestamp: s.completedAt,
      isSkippable: Boolean(s.stepTemplate?.isSkippable),
      employee: s.employee ? { name: s.employee.name } : undefined,
    }));
  }, [stages, checkpointIndex]);

  const [activeStepId, setActiveStepId] = useState<string>("");

  useEffect(() => {
    if (!stepsVm.length) {
      setActiveStepId("");
      return;
    }

    const nextPending = stepsVm.find(
      (s) => s.status !== "completed" && s.status !== "skipped",
    );

    setActiveStepId(nextPending?.id ?? stepsVm[stepsVm.length - 1]?.id ?? "");
  }, [checkpointIndex, stepsVm]);

  const activeStep = stepsVm.find((s) => s.id === activeStepId);

  const [employeeQuery, setEmployeeQuery] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeApi | null>(
    null,
  );

  const { employees, loading: employeesLoading } =
    useEmployeesQuery(employeeQuery);

  const employeeOptions = useMemo(() => employees.slice(0, 8), [employees]);

  const [selectedAction, setSelectedAction] = useState<StepStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { saveStep, saving, saveError } = useStationProgressMutation();

  useEffect(() => {
    if (saveError) toast.error(`บันทึกไม่สำเร็จ: ${saveError}`);
  }, [saveError]);

  const [showBulkSkipConfirm, setShowBulkSkipConfirm] = useState(false);

  const isRepairStage = jobState.status === "REPAIR";

  const stepsToSkip = useMemo(() => {
    if (!isRepairStage) return [];
    const allSteps = stepsVm.slice(0, -2);
    return allSteps.filter(
      (s) => s.status !== "completed" && s.status !== "skipped",
    );
  }, [isRepairStage, stepsVm]);

  const lastStepIdForViewingStage = useMemo(() => {
    const viewingStage = stages[checkpointIndex];
    const sorted = (viewingStage?.jobSteps ?? [])
      .slice()
      .sort((a, b) => a.stepTemplate.orderIndex - b.stepTemplate.orderIndex);
    return sorted.length ? String(sorted[sorted.length - 1].id) : null;
  }, [stages, checkpointIndex]);

  const isSavingLastStepNow =
    lastStepIdForViewingStage != null &&
    String(activeStepId) === String(lastStepIdForViewingStage);

  const handleBulkSkip = async () => {
    if (stepsToSkip.length === 0) {
      toast.error("ไม่มีขั้นตอนที่ต้องข้าม");
      setShowBulkSkipConfirm(false);
      return;
    }

    const willBeStageDone =
      stepsVm.length > 0 &&
      stepsVm.every((s) => {
        if (String(s.id) === String(activeStepId)) {
          return selectedAction === "completed" || selectedAction === "skipped";
        }
        return s.status === "completed" || s.status === "skipped";
      });

    const tId = toast.loading("กำลังข้ามขั้นตอน...");

    try {
      for (const step of stepsToSkip) {
        await saveStep({
          stepId: step.id,
          status: "skipped",
        });
      }

      onUpdateStep(checkpointIndex, stepsToSkip[0].id, "skipped", null);

      if (isSavingLastStepNow && willBeStageDone) {
        setCheckpointIndex((i) => Math.min(stages.length - 1, i + 1));
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

    if (!selectedAction || selectedAction === "pending") {
      toast.error("กรุณาเลือกสถานะก่อนบันทึก");
      return;
    }

    const needEmployee =
      selectedAction === "completed" || selectedAction === "in_progress";

    if (needEmployee && selectedEmployee == null) {
      setError("กรุณาระบุชื่อผู้ดำเนินการ");
      toast.error("กรุณาระบุชื่อผู้ดำเนินการ");
      return;
    }

    if (!activeStepId) {
      toast.error("กรุณาเลือกรายการก่อนบันทึก");
      return;
    }

    const tId = toast.loading("กำลังบันทึก...");
    try {
      await saveStep({
        stepId: activeStepId,
        status: selectedAction,
        employeeId: selectedEmployee?.id,
      });

      onUpdateStep(
        checkpointIndex,
        activeStepId,
        selectedAction,
        selectedEmployee?.id ?? null,
      );

      const stageDoneNow =
        stepsVm.length > 0 &&
        stepsVm.every((s) => {
          if (String(s.id) === String(activeStepId)) {
            return (
              selectedAction === "completed" || selectedAction === "skipped"
            );
          }
          return s.status === "completed" || s.status === "skipped";
        });

      const shouldAutoAdvance =
        isSavingLastStepNow && stageDoneNow && checkpointIndex === stageIdx;

      setJobState((prev) => {
        const sortedStages = (prev.jobStages ?? [])
          .slice()
          .sort((a, b) => a.stage.orderIndex - b.stage.orderIndex);
        const st = sortedStages[checkpointIndex];
        if (!st) return prev;

        const sortedSteps = (st.jobSteps ?? [])
          .slice()
          .sort(
            (a, b) => a.stepTemplate.orderIndex - b.stepTemplate.orderIndex,
          );

        const lastStepId = sortedSteps[sortedSteps.length - 1]?.id
          ? String(sortedSteps[sortedSteps.length - 1].id)
          : null;

        const updatedSteps = (st.jobSteps ?? []).map((s) =>
          String(s.id) === String(activeStepId)
            ? {
                ...s,
                status: selectedAction as JobStepStatusApi,
                employeeId: selectedEmployee?.id ?? null,
                completedAt:
                  selectedAction === "completed" || selectedAction === "skipped"
                    ? new Date().toISOString()
                    : s.completedAt,
              }
            : s,
        );

        const stageDone =
          updatedSteps.length > 0 &&
          updatedSteps.every(
            (x) => x.status === "completed" || x.status === "skipped",
          );

        const isSavingLastStep =
          lastStepId != null && String(activeStepId) === String(lastStepId);

        const newStages = sortedStages.map((x, i) =>
          i === checkpointIndex ? { ...x, jobSteps: updatedSteps } : x,
        );
        const prevIdx = prev.currentStageIndex ?? 0;
        return {
          ...prev,
          jobStages: newStages,
          currentStageIndex:
            isSavingLastStep && stageDone
              ? Math.min(prevIdx + 1, newStages.length - 1)
              : prevIdx,
        };
      });
      if (shouldAutoAdvance) {
        setCheckpointIndex((i) => Math.min(i + 1, stages.length - 1));
      }

      setSelectedEmployee(null);
      setEmployeeQuery("");

      toast.dismiss(tId);
      toast.success("บันทึกสำเร็จ");
    } catch {
      toast.dismiss(tId);
    }
  };

  const handleSelectStep = (id: string) => {
    setActiveStepId(id);

    setSelectedAction(null);
    setError(null);

    if (window.innerWidth < 1280) {
      setTimeout(() => {
        document.getElementById("action-panel-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  return (
    <div className="w-full max-w-full min-h-screen bg-[#ebebeb] font-sans text-slate-800">
      <ProgressHeader
        registration={jobState.vehicle.registration}
        status={jobState.status}
        onBack={() => navigate(-1)}
      />
      {isRefetching && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-600">กำลังโหลด...</span>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 md:p-6 mb-6">
        <div className="flex flex-col xl:flex-row justify-between items-start gap-6">
          <div className="flex gap-4 w-full xl:w-auto min-w-0">
            <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center bg-white shrink-0">
              <Car size={24} className="text-slate-800" />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 leading-tight truncate">
                {jobState.vehicle.brand}
              </h2>
              <p className="text-slate-500 text-sm truncate">
                {jobState.vehicle.model}
              </p>

              <div className="mt-4 xl:mt-6 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar">
                <StageStepper
                  job={jobState}
                  checkpointIndex={checkpointIndex}
                />
              </div>
            </div>
          </div>

          <div className="w-full xl:w-auto xl:text-right border-t xl:border-t-0 border-slate-100 pt-4 xl:pt-0">
            <div className="flex justify-between xl:block items-center mb-4 xl:mb-0">
              <div className="text-xs text-black mb-1">ทะเบียนรถ</div>
              <div className="text-xl font-bold text-slate-900">
                {jobState.vehicle.registration}
              </div>
            </div>

            <div className="mt-4 xl:mt-8 flex gap-3 w-full xl:w-auto">
              <button
                onClick={() => {
                  setFollowMode(false);
                  setCheckpointIndex((i) => Math.max(0, i - 1));
                }}
                disabled={checkpointIndex <= 0}
                className="flex-1 xl:flex-none px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={() => {
                  if (!isStageDone) {
                    toast.error(
                      "ต้องทำขั้นตอนของสถานีนี้ให้เสร็จก่อน ถึงจะไปสถานีถัดไปได้",
                    );
                    return;
                  }
                  setCheckpointIndex((i) => Math.min(stages.length - 1, i + 1));
                }}
                disabled={checkpointIndex >= stages.length - 1 || !isStageDone}
                className="flex-1 xl:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg
      text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200
      transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
              {/* <button
  onClick={() => {
    setFollowMode(true);
    setCheckpointIndex(stageIdx);
  }}
  className="flex-1 xl:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
>
  กลับมาสถานีปัจจุบัน
</button> */}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <StepTimeline
            title={stages[checkpointIndex]?.stage.name ?? "รายการ"}
            steps={stepsVm}
            activeStepId={activeStepId}
            onSelectStep={handleSelectStep}
          />
        </div>

        <div
          id="action-panel-section"
          className="xl:col-span-1 xl:sticky xl:top-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {jobState.status === "DONE" ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-100">
                  <Check size={40} className="text-green-500" strokeWidth={3} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  ซ่อมเสร็จสมบูรณ์
                </h3>
                <p className="text-slate-500 text-sm max-w-60">
                  งานนี้ได้รับการบันทึกข้อมูลทุกขั้นตอนเรียบร้อยแล้ว
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-8 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
                >
                  กลับไปหน้าแดชบอร์ด
                </button>
              </div>
            ) : activeStep ? (
              <StepActionPanel
                stepName={activeStep.name}
                stepStatus={activeStep.status}
                employeeQuery={employeeQuery}
                onEmployeeQueryChange={(v) => {
                  setEmployeeQuery(v);
                  setSelectedEmployee(null);
                }}
                employeeOptions={employeeOptions}
                employeeLoading={employeesLoading}
                selectedEmployee={selectedEmployee}
                onSelectEmployee={(emp) => {
                  setSelectedEmployee(emp);
                  setEmployeeQuery(emp.name);
                }}
                selectedAction={selectedAction}
                onSelectAction={setSelectedAction}
                error={error}
                onSave={handleSave}
                saving={saving}
                canSkip={
                  activeStep.isSkippable &&
                  jobState.status !== "CLAIM" &&
                  jobState.status !== "BILLING"
                }
                skipLabel={
                  isRepairStage && stepsToSkip.length > 0 ? "ข้าม" : "ข้าม"
                }
                onBulkSkip={
                  isRepairStage && stepsToSkip.length > 0
                    ? () => setShowBulkSkipConfirm(true)
                    : undefined
                }
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 xl:h-100 text-slate-400 text-sm p-6 text-center bg-slate-50">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-slate-100">
                  <Car size={20} className="text-slate-300" />
                </div>
                <p>
                  เลือกรายการทางซ้ายมือ
                  <br />
                  เพื่ออัปเดตสถานะ
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {showBulkSkipConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              ยืนยันข้ามขั้นตอน
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              ระบบจะข้าม {stepsToSkip.length} ขั้นตอน และไปยังขั้นตอน QC โดยตรง
              <br />
              ขั้นตอนที่เสร็จสิ้นแล้วจะไม่ถูกเปลี่ยนแปลง
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkSkipConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleBulkSkip}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
