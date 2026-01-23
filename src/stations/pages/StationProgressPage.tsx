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



// type JobOverallStatus = "CLAIM" | "REPAIR" | "BILLING" | "DONE";

// function deriveJobStatusFromStages(job: JobApi): JobOverallStatus {
//   const stages = (job.jobStages ?? [])
//     .slice()
//     .sort((a, b) => a.stage.orderIndex - b.stage.orderIndex);

//   // ถ้าไม่มี stage ใช้ status จาก backend
//   if (stages.length === 0) return (job.status as JobOverallStatus) ?? "CLAIM";

//   if (stages.every((s) => s.isCompleted)) return "DONE";

//   // หา stage แรกที่ยังไม่ completed แล้ว map เป็น status
//   const firstNotDoneIdx = stages.findIndex((s) => !s.isCompleted);

//   // สมมติ stage order: 0=CLAIM, 1=REPAIR, 2=BILLING
//   if (firstNotDoneIdx <= 0) return "CLAIM";
//   if (firstNotDoneIdx === 1) return "REPAIR";
//   return "BILLING";
// }

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

  // const overallStatus = useMemo(() => deriveJobStatusFromStages(job), [job]);

  // =========================
  // 1) Stage / Step timeline
  // =========================
  // const stages = useMemo(
  //   () => sortStages(job.jobStages ?? []),
  //   [job.jobStages],
  // );

  // const stageIdx = useMemo(() => {
  //   const raw = jobState.currentStageIndex ?? 0;
  //   if (stages.length === 0) return 0;
  //   return Math.min(Math.max(raw, 0), stages.length - 1);
  // }, [jobState.currentStageIndex, stages.length]);

  const stages = useMemo(
    () => sortStages(jobState.jobStages ?? []),
    [jobState.jobStages],
  );

  const stageIdx = useMemo(() => {
    const raw = jobState.currentStageIndex ?? 0;
    if (stages.length === 0) return 0;
    return Math.min(Math.max(raw, 0), stages.length - 1);
  }, [jobState.currentStageIndex, stages.length]);

  const stepsVm: StepVM[] = useMemo(() => {
    const jobStatusMap: Record<string, number> = {
      CLAIM: 1,
      REPAIR: 2,
      BILLING: 3,
      DONE: 3, // เมื่อ DONE ให้โชว์ด่านสุดท้าย (BILLING)
    };

    const currentStage = stages.find((s) => s.stageId === jobStatusMap[jobState.status]);
    const steps = currentStage?.jobSteps ?? [];

    console.log("memo", steps);

    return steps.map((s) => {
      return {
        ...s,
        id: String(s.id),
        name: s.stepTemplate?.name ?? "-",
        status: (s.status ?? "pending") as StepStatus,
        timestamp: s.completedAt,
        isSkippable: Boolean(s.stepTemplate?.isSkippable),
        employee: s.employee ? { name: s.employee.name } : undefined,
      };
    });
  }, [job.status, stages]);

  const [activeStepId, setActiveStepId] = useState<string>("");

  useEffect(() => {
    if (!stepsVm.length) {
      setActiveStepId("");
      return;
    }

    // หา step ปัจจุบัน
    const currentStep = stepsVm.find((s) => s.id === activeStepId);

    // ถ้า activeStepId ยังว่าง หรือ step เดิมหายไป หรือ step ปัจจุบันถูก completed/skipped แล้ว -> ตั้งค่าใหม่
    const shouldAdvance =
      !activeStepId ||
      !currentStep ||
      currentStep.status === "completed" ||
      currentStep.status === "skipped";

    if (shouldAdvance) {
      // หา step ถัดไปที่ยังไม่เสร็จ (status !== "completed" และ !== "skipped")
      const nextPending = stepsVm.find(
        (s) => s.status !== "completed" && s.status !== "skipped"
      );
      // ถ้าไม่มี pending step เหลือ ให้เลือก step สุดท้าย
      setActiveStepId(nextPending?.id ?? stepsVm[stepsVm.length - 1]?.id ?? "");
    }
  }, [stepsVm, activeStepId]);

  const activeStep = stepsVm.find((s) => s.id === activeStepId);

  // =========================
  // 2) Employee autocomplete (ใช้ useEmployeesQuery)
  // =========================
  const [employeeQuery, setEmployeeQuery] = useState<string>(""); // สิ่งที่ user พิมพ์
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeApi | null>(
    null,
  ); // คนที่เลือกแล้ว

  // เรียก hook ด้วยคำค้น
  const { employees, loading: employeesLoading } =
    useEmployeesQuery(employeeQuery);

  // ถ้าจะจำกัดจำนวนตัวเลือก ทำที่นี่ (hook ส่งมาเป็น list ที่ match แล้ว)
  const employeeOptions = useMemo(() => employees.slice(0, 8), [employees]);

  // =========================
  // 3) Action + save
  // =========================
  const [selectedAction, setSelectedAction] = useState<StepStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { saveStep, saving, saveError } = useStationProgressMutation();

  useEffect(() => {
    if (saveError) toast.error(`บันทึกไม่สำเร็จ: ${saveError}`);
  }, [saveError]);

  // =========================
  // 4) Bulk Skip (REPAIR stage only)
  // =========================
  const [showBulkSkipConfirm, setShowBulkSkipConfirm] = useState(false);

  const isRepairStage = jobState.status === "REPAIR";

  // ดึง step ที่ต้อง skip (ไม่รวม 2 step สุดท้าย และไม่รวมที่ completed/skipped แล้ว)
  const stepsToSkip = useMemo(() => {
    if (!isRepairStage) return [];
    const allSteps = stepsVm.slice(0, -2); // ไม่รวม 2 step สุดท้าย
    return allSteps.filter(
      (s) => s.status !== "completed" && s.status !== "skipped"
    );
  }, [isRepairStage, stepsVm]);

  const handleBulkSkip = async () => {
    if (stepsToSkip.length === 0) {
      toast.error("ไม่มีขั้นตอนที่ต้องข้าม");
      setShowBulkSkipConfirm(false);
      return;
    }

    const tId = toast.loading("กำลังข้ามขั้นตอน...");

    try {
      // Patch ทีละ step
      for (const step of stepsToSkip) {
        await saveStep({
          stepId: step.id,
          status: "skipped",
        });
      }

      // Refetch จะถูก trigger จาก Routes.tsx
      onUpdateStep(stageIdx, stepsToSkip[0].id, "skipped", null);

      toast.dismiss(tId);
      toast.success(`ข้าม ${stepsToSkip.length} ขั้นตอนสำเร็จ`);
      setShowBulkSkipConfirm(false);

      // เลื่อนไปที่ QC step (step แรกใน 2 step สุดท้าย)
      const qcStep = stepsVm[stepsVm.length - 2];
      if (qcStep) {
        setActiveStepId(qcStep.id);
      }
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
        //  ส่งเป็น number (id) เท่านั้น
        employeeId: selectedEmployee?.id,
      });

      onUpdateStep(
        stageIdx,
        activeStepId,
        selectedAction,
        selectedEmployee?.id ?? null,
      );

      setJobState((prev) => {
        const stages = (prev.jobStages ?? [])
          .slice()
          .sort((a, b) => a.stage.orderIndex - b.stage.orderIndex);
        const st = stages[stageIdx];
        if (!st) return prev;

        const updatedSteps = (st.jobSteps ?? []).map((s) =>
          String(s.id) === String(activeStepId)
            ? {
              ...s,
              status: selectedAction as JobStepStatusApi,
              employeeId: selectedEmployee?.id ?? null,
              completedAt: new Date().toISOString(),
            }
            : s,
        );

        const newStages = stages.map((x, i) =>
          i === stageIdx ? { ...x, jobSteps: updatedSteps } : x,
        );

        const stageDone =
          updatedSteps.length > 0 &&
          updatedSteps.every(
            (x) => x.status === "completed" || x.status === "skipped",
          );

        return {
          ...prev,
          jobStages: newStages,
          currentStageIndex: stageDone
            ? Math.min(stageIdx + 1, newStages.length - 1)
            : (prev.currentStageIndex ?? 0),
        };
      });

      // รีเซ็ทช่องชื่อพนักงานหลังบันทึก
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

    // เปลี่ยน step -> ล้างค่าฝั่ง action panel
    // setSelectedEmployee(null);
    // setEmployeeQuery("");
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
        registration={job.vehicle.registration}
        // status={overallStatus}
        status={job.status}
        onBack={() => navigate(-1)}
      />

      {/* Inline Refetching Indicator */}
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
                {job.vehicle.brand}
              </h2>
              <p className="text-slate-500 text-sm truncate">
                {job.vehicle.model}
              </p>

              <div className="mt-4 xl:mt-6 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar">
                <StageStepper job={job} />
              </div>
            </div>
          </div>

          <div className="w-full xl:w-auto xl:text-right border-t xl:border-t-0 border-slate-100 pt-4 xl:pt-0">
            <div className="flex justify-between xl:block items-center mb-4 xl:mb-0">
              <div className="text-xs text-black mb-1">ทะเบียนรถ</div>
              <div className="text-xl font-bold text-slate-900">
                {job.vehicle.registration}
              </div>
            </div>

            <div className="mt-4 xl:mt-8 flex gap-3 w-full xl:w-auto">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 xl:flex-none px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={() => {
                  const idx = stepsVm.findIndex((s) => s.id === activeStepId);
                  const next = stepsVm[idx + 1];
                  if (next) handleSelectStep(next.id);
                }}
                className="flex-1 xl:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors"
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <StepTimeline
            title={
              stages.find(
                (s) =>
                  s.stageId ===
                  ({
                    CLAIM: 1,
                    REPAIR: 2,
                    BILLING: 3,
                    DONE: 3,
                  }[jobState.status] ?? 1),
              )?.stage.name ?? "รายการ"
            }
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
                <p className="text-slate-500 text-sm max-w-[240px]">
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
                // ✅ ส่งของ autocomplete เข้า panel
                employeeQuery={employeeQuery}
                onEmployeeQueryChange={(v) => {
                  setEmployeeQuery(v);
                  setSelectedEmployee(null); // พิมพ์ใหม่ = ยังไม่เลือกคน
                }}
                employeeOptions={employeeOptions}
                employeeLoading={employeesLoading}
                selectedEmployee={selectedEmployee}
                onSelectEmployee={(emp) => {
                  setSelectedEmployee(emp);
                  setEmployeeQuery(emp.name); // เลือกแล้ว = โชว์ชื่อในช่อง
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
                skipLabel={isRepairStage && stepsToSkip.length > 0 ? "ข้าม" : "ข้าม"}
                onBulkSkip={isRepairStage && stepsToSkip.length > 0 ? () => setShowBulkSkipConfirm(true) : undefined}
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

      {/* Bulk Skip Confirmation Dialog */}
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