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

function sortStages(stages: JobStageApi[]) {
  return stages.slice().sort((a, b) => a.stage.orderIndex - b.stage.orderIndex);
}

function sortSteps(steps: JobStepApi[]) {
  return steps
    .slice()
    .sort((a, b) => a.stepTemplate.orderIndex - b.stepTemplate.orderIndex);
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
    employee: string
  ) => void;
}) {
  const navigate = useNavigate();

  const stages = useMemo(() => sortStages(job.jobStages ?? []), [job.jobStages]);

  const stageIdx = useMemo(() => {
    const raw = job.currentStageIndex ?? 0;
    if (stages.length === 0) return 0;
    return Math.min(Math.max(raw, 0), stages.length - 1);
  }, [job.currentStageIndex, stages.length]);

  const currentStage = stages[stageIdx];

  const stepsVm: StepVM[] = useMemo(() => {
    const steps = sortSteps(currentStage?.jobSteps ?? []);
    return steps.map((s) => ({
      id: String(s.id),
      name: s.stepTemplate?.name ?? "-",
      status: (s.status as StepStatus) ?? "pending",
      timestamp: s.completedAt,
      isSkippable: Boolean(s.stepTemplate?.isSkippable),
    }));
  }, [currentStage]);

  const [activeStepId, setActiveStepId] = useState<string>(() => {
    const first =
      stepsVm.find((s) => s.status !== "completed") ?? stepsVm[0];
    return first ? first.id : "";
  });

  useEffect(() => {
    // ถ้า stage/steps เปลี่ยน แล้ว activeStepId ไม่อยู่ในรายการ ให้รีเซ็ต
    if (!stepsVm.some((s) => s.id === activeStepId)) {
      const first =
        stepsVm.find((s) => s.status !== "completed") ?? stepsVm[0];
      setActiveStepId(first ? first.id : "");
    }
  }, [stepsVm, activeStepId]);

  const activeStep = stepsVm.find((s) => s.id === activeStepId);

  const [operatorName, setOperatorName] = useState("");
  const [selectedAction, setSelectedAction] = useState<StepStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { saveStep, saving, saveError } = useStationProgressMutation();

  useEffect(() => {
    if (saveError) toast.error(`บันทึกไม่สำเร็จ: ${saveError}`);
  }, [saveError]);

  const handleSave = async () => {
    setError(null);

    if (!selectedAction || selectedAction === "pending") {
      toast.error("กรุณาเลือกสถานะก่อนบันทึก");
      return;
    }
    if (!operatorName.trim()) {
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
      // หมายเหตุ: backend type ของ status อาจไม่มี "skipped"
      // ถ้า backend ไม่รับ skipped จริง ๆ ค่อยปรับใน hook mutation ให้ map ก่อนยิง
      await saveStep({
        jobId: String(job.id),
        stageIdx,
        stepId: activeStepId,
        status: selectedAction,
        employee: operatorName,
      });

      // update ฝั่ง store/UI ที่เดิมคุณทำไว้
      onUpdateStep(stageIdx, activeStepId, selectedAction, operatorName);

      toast.dismiss(tId);
      toast.success("บันทึกสำเร็จ");
    } catch {
      toast.dismiss(tId);
    }
  };

  const handleSelectStep = (id: string) => {
    setActiveStepId(id);
    if (window.innerWidth < 1280) {
      setTimeout(() => {
        document
          .getElementById("action-panel-section")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  return (
    <div className="w-full max-w-full min-h-screen bg-[#ebebeb] font-sans text-slate-800">
      <ProgressHeader
        registration={job.vehicle.registration}
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
              <div className="text-xs text-slate-400 mb-1">ทะเบียนรถ</div>
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
                  // ไป step ถัดไปแบบง่าย ๆ
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
            title={currentStage?.stage?.name ?? "รายละเอียดสถานะ"}
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
                operatorName={operatorName}
                onOperatorChange={setOperatorName}
                selectedAction={selectedAction}
                onSelectAction={setSelectedAction}
                error={error}
                onSave={handleSave}
                saving={saving}
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
    </div>
  );
}
