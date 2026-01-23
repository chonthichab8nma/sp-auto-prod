import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car } from "lucide-react";
import toast from "react-hot-toast";

import type { StepStatus } from "../../Type";
import type { JobApi, JobStageApi, JobStepApi } from "../../features/jobs/api/job.api";

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
function sortSteps(steps: JobStepApi[]) {
  return steps.slice().sort((a, b) => a.stepTemplate.orderIndex - b.stepTemplate.orderIndex);
}

type JobStatus = "CLAIM" | "REPAIR" | "BILLING" | "DONE";
function statusFromStageIndex(idx: number): JobStatus {
  if (idx <= 0) return "CLAIM";
  if (idx === 1) return "REPAIR";
  if (idx === 2) return "BILLING";
  return "DONE";
}

export default function StationProgressPage({
  job,
  onUpdateStep,
}: {
  job: JobApi;
  onUpdateStep: (
    stageIdx: number,
    stepId: string,
    status: StepStatus,
    employeeId: number | null,
  ) => void;
}) {
  const navigate = useNavigate();

  // =========================
  // 0) local state (optimistic UI)
  // =========================
  const [jobState, setJobState] = useState<JobApi>(job);
  useEffect(() => setJobState(job), [job]);

  const stages = useMemo(() => sortStages(jobState.jobStages ?? []), [jobState.jobStages]);

  // “สถานีปัจจุบันจริง” (ตาม backend)
  const currentStageIdx = useMemo(() => {
    const raw = jobState.currentStageIndex ?? 0;
    if (stages.length === 0) return 0;
    return Math.min(Math.max(raw, 0), stages.length - 1);
  }, [jobState.currentStageIndex, stages.length]);

  // “checkpoint ที่กำลังดู” (ย้อนดู station ใหญ่)
  const [viewStageIdx, setViewStageIdx] = useState<number>(currentStageIdx);

  // ถ้า backend ขยับ stage แล้ว และ user กำลังดู stage ปัจจุบันอยู่ → ให้ขยับตามอัตโนมัติ
  useEffect(() => {
    setViewStageIdx((prev) => (prev === currentStageIdx ? currentStageIdx : prev));
  }, [currentStageIdx]);

  const viewedStage = stages[viewStageIdx];

  // =========================
  // 1) Steps VM (ตาม station ที่กำลังดู)
  // =========================
  const stepsVm: StepVM[] = useMemo(() => {
    const raw = sortSteps(viewedStage?.jobSteps ?? []);
    return raw.map((s) => {
      const anyS = s as any; // เผื่อ API แนบ employee object
      return {
        id: String(s.id),
        name: s.stepTemplate?.name ?? "-",
        status: (s.status ?? "pending") as StepStatus,
        timestamp: s.completedAt ?? null,
        isSkippable: Boolean(s.stepTemplate?.isSkippable),
        employee: anyS.employee?.name ? { name: anyS.employee.name } : undefined,
      };
    });
  }, [viewedStage]);

  // =========================
  // 2) Active step
  // =========================
  const [activeStepId, setActiveStepId] = useState<string>("");

  // เมื่อเปลี่ยน station ที่กำลังดู -> เลือก step ที่ “ยังไม่เสร็จ” ตัวแรก (หรือ step แรก)
  useEffect(() => {
    if (!stepsVm.length) {
      setActiveStepId("");
      return;
    }
    const firstNotDone =
      stepsVm.find((s) => s.status !== "completed" && s.status !== "skipped") ?? stepsVm[0];
    setActiveStepId(firstNotDone?.id ?? "");
  }, [viewStageIdx, stepsVm]);

  const activeStep = stepsVm.find((s) => s.id === activeStepId);

  // =========================
  // 3) Editing rule:
  //    - ถ้าดูย้อนหลัง (viewStageIdx !== currentStageIdx) -> read-only
  // =========================
  const isViewingHistoryStage = viewStageIdx !== currentStageIdx;
  const canEditThisStage = !isViewingHistoryStage;

  // =========================
  // 4) Employees
  // =========================
  const [employeeQuery, setEmployeeQuery] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeApi | null>(null);
  const { employees, loading: employeesLoading } = useEmployeesQuery(employeeQuery);

  const employeeOptions = useMemo(() => employees.slice(0, 8), [employees]);

  // =========================
  // 5) Action panel state
  // =========================
  const [selectedAction, setSelectedAction] = useState<StepStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { saveStep, saving, saveError } = useStationProgressMutation();

  useEffect(() => {
    if (saveError) toast.error(`บันทึกไม่สำเร็จ: ${saveError}`);
  }, [saveError]);

  const handleSave = async () => {
    if (!canEditThisStage) {
      toast.error("กำลังดูสถานีย้อนหลัง — ไม่สามารถบันทึกได้");
      return;
    }

    setError(null);

    if (!selectedAction || selectedAction === "pending") {
      toast.error("กรุณาเลือกสถานะก่อนบันทึก");
      return;
    }

    const needEmployee = selectedAction === "completed" || selectedAction === "in_progress";
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

      // แจ้ง parent (ถ้า parent จะ refetch หรือ sync เพิ่มเติม)
      onUpdateStep(currentStageIdx, activeStepId, selectedAction, selectedEmployee?.id ?? null);

      // ใช้ตัดสินใจว่าจะ “ขยับ station” ตอนนี้ไหม (ต้องเป็นการบันทึก step ตัวสุดท้าย + stageDone)
      const shouldAdvanceNow = (() => {
        const sortedStages = sortStages(jobState.jobStages ?? []);
        const st = sortedStages[currentStageIdx];
        if (!st) return false;

        const sortedSteps = sortSteps(st.jobSteps ?? []);
        const lastStepId = sortedSteps.length
          ? String(sortedSteps[sortedSteps.length - 1].id)
          : "";

        const optimisticSteps = (st.jobSteps ?? []).map((s) =>
          String(s.id) === String(activeStepId)
            ? {
                ...s,
                status: selectedAction,
              }
            : s,
        );

        const stageDone =
          optimisticSteps.length > 0 &&
          optimisticSteps.every((x: any) => x.status === "completed" || x.status === "skipped");

        const isLastStepAction =
          String(activeStepId) === lastStepId &&
          (selectedAction === "completed" || selectedAction === "skipped");

        return stageDone && isLastStepAction;
      })();

      // ===== optimistic update (อัปเดต UI ทันที ไม่ต้องรีเฟรช) =====
      setJobState((prev) => {
        const sortedStages = sortStages(prev.jobStages ?? []);
        const st = sortedStages[currentStageIdx];
        if (!st) return prev;

        const sortedSteps = sortSteps(st.jobSteps ?? []);
        const lastStepId = sortedSteps.length
          ? String(sortedSteps[sortedSteps.length - 1].id)
          : "";

        const updatedSteps = (st.jobSteps ?? []).map((s) =>
          String(s.id) === String(activeStepId)
            ? {
                ...s,
                status: selectedAction,
                employeeId: selectedEmployee?.id ?? null,
                completedAt: new Date().toISOString(),
              }
            : s,
        );

        const newStages = sortedStages.map((x, i) =>
          i === currentStageIdx ? { ...x, jobSteps: updatedSteps } : x,
        );

        const stageDone =
          updatedSteps.length > 0 &&
          updatedSteps.every((x: any) => x.status === "completed" || x.status === "skipped");

        const isLastStepAction =
          String(activeStepId) === lastStepId &&
          (selectedAction === "completed" || selectedAction === "skipped");

        const shouldAdvanceStage = stageDone && isLastStepAction;

        const nextStageIdx = shouldAdvanceStage
          ? Math.min(currentStageIdx + 1, newStages.length - 1)
          : (prev.currentStageIndex ?? currentStageIdx);

        return {
          ...prev,
          jobStages: newStages,
          currentStageIndex: nextStageIdx,
          status: statusFromStageIndex(nextStageIdx),
        } as JobApi;
      });

      // ถ้าขยับ stage จริง -> ให้ checkpoint ที่กำลังดูขยับตามทันที
      if (shouldAdvanceNow) {
        setViewStageIdx((prev) => {
          if (prev !== currentStageIdx) return prev; // ถ้ากำลังดูย้อนหลังอยู่ อย่าดึงหน้าหนี
          return Math.min(currentStageIdx + 1, stages.length - 1);
        });
      }

      // reset panel state หลังบันทึก
      setSelectedEmployee(null);
      setEmployeeQuery("");
      setSelectedAction(null);

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

  // =========================
  // 6) Stage navigation buttons (checkpoint)
  // =========================
  const goPrevStage = () => setViewStageIdx((p) => Math.max(0, p - 1));
  const goNextStage = () => setViewStageIdx((p) => Math.min(stages.length - 1, p + 1));

  return (
    <div className="w-full max-w-full min-h-screen bg-[#ebebeb] font-sans text-slate-800">
      <ProgressHeader
        registration={jobState.vehicle.registration}
        status={jobState.status as any}
        onBack={() => navigate(-1)}
      />

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
              <p className="text-slate-500 text-sm truncate">{jobState.vehicle.model}</p>

              <div className="mt-4 xl:mt-6 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar">
                <StageStepper job={jobState} checkpointIndex={viewStageIdx} />
              </div>
            </div>
          </div>

          <div className="w-full xl:w-auto xl:text-right border-t xl:border-t-0 border-slate-100 pt-4 xl:pt-0">
            <div className="flex justify-between xl:block items-center mb-4 xl:mb-0">
              <div className="text-xs text-red-600 mb-1">ทะเบียนรถ</div>
              <div className="text-xl font-bold text-slate-900">{jobState.vehicle.registration}</div>
            </div>

            <div className="mt-4 xl:mt-8 flex gap-3 w-full xl:w-auto">
              <button
                onClick={goPrevStage}
                disabled={viewStageIdx === 0}
                className="flex-1 xl:flex-none px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm font-medium hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-slate-100 transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={goNextStage}
                disabled={viewStageIdx >= stages.length - 1}
                className="flex-1 xl:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 shadow-sm shadow-blue-200 transition-colors"
              >
                ถัดไป
              </button>
            </div>

            {isViewingHistoryStage && (
              <div className="mt-3 text-xs text-slate-500">
                {/* กำลังดูสถานีย้อนหลัง (อ่านอย่างเดียว) */}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <StepTimeline
            title={viewedStage?.stage?.name ?? "ไทม์ไลน์"}
            steps={stepsVm}
            activeStepId={activeStepId}
            onSelectStep={handleSelectStep}
          />
        </div>

        <div id="action-panel-section" className="xl:col-span-1 xl:sticky xl:top-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {activeStep ? (
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
                saving={saving || !canEditThisStage}
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

            {isViewingHistoryStage && (
              <div className="p-4 border-t border-slate-100 text-xs text-slate-500 bg-slate-50">
                ดูย้อนหลังได้ แต่ไม่สามารถบันทึกในสถานีนี้
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
