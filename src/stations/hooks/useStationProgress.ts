// import { useMemo, useState } from "react";
// import type { Job, StepStatus } from "../../Type";

// export function useStationProgress(job: Job) {
//   const stageIdx = job.currentStageIndex;
//   const currentStage = job.stages[stageIdx];
//   const [error, setError] = useState<string | null>(null);

//   const initialActiveId =
//     currentStage.steps.find((s) => s.status === "pending")?.id ||
//     currentStage.steps[0]?.id ||
//     "";

//   const [activeStepId, setActiveStepId] = useState<string>(initialActiveId);
//   const [operatorName, setOperatorName] = useState("");
//   const [selectedAction, setSelectedAction] = useState<StepStatus | null>(null);
  

//   const currentIndex = useMemo(() => {
//     return currentStage.steps.findIndex((s) => s.id === activeStepId);
//   }, [currentStage.steps, activeStepId]);

//   const activeStep = currentStage.steps[currentIndex];

//   const isLastStage = stageIdx === job.stages.length - 1;
//   const isLastStep = currentIndex === currentStage.steps.length - 1;
//   const isFinalProcess = isLastStage && isLastStep;

//   const resetInputs = () => {
//     setSelectedAction(null);
//     setOperatorName("");
//   };

//   const validate = () => {
//     if (!selectedAction || selectedAction === "pending") return false;

//     if (selectedAction === "completed" && !operatorName) {
//       setError("กรุณาระบุชื่อผู้ดำเนินการก่อนบันทึก");
//       return false;
//     }

//     setError(null);
//     return true;
//   };

//   const handleSaveFlow = (
//     onUpdateStep: (
//       stageIdx: number,
//       stepId: string,
//       status: StepStatus,
//       employee: string
//     ) => void
//   ): { done: boolean; message?: string } => {
//     if (!validate()) return { done: false };

//     onUpdateStep(stageIdx, activeStepId, selectedAction!, operatorName);

//     if (isFinalProcess) {
//       return { done: true, message: "ดำเนินการตั้งเบิกเรียบร้อยแล้ว" };
//     }

//     if (currentIndex >= 0 && currentIndex < currentStage.steps.length - 1) {
//       const nextStepId = currentStage.steps[currentIndex + 1].id;
//       setActiveStepId(nextStepId);
//       resetInputs();
//       return { done: false };
//     }

//     return { done: true, message: "บันทึกข้อมูลเรียบร้อยแล้ว" };
//   };

//   return {
//     stageIdx,
//     currentStage,

//     activeStepId,
//     setActiveStepId,

//     operatorName,
//     setOperatorName: (v: string) => {
//       setOperatorName(v);
//       if (error) setError(null);
//     },

//     selectedAction,
//     setSelectedAction,

//     error,
//     activeStep,

//     isFinalProcess,

//     handleSaveFlow,
//   };
// }

import { useCallback, useEffect, useState } from "react";
import type { JobApi } from "../../features/jobs/api/job.api";
import { http } from "../../shared/lib/http";

export function useStationProgress(jobId: number | null) {
  const [job, setJob] = useState<JobApi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) return null;

    setLoading(true);
    setError(null);

    try {
      const { data } = await http.get<JobApi>(`/private/jobs/${jobId}`);
      setJob(data);
      return data;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "โหลดข้อมูลงานไม่สำเร็จ";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  return { job, loading, error, refetch: fetchJob };
}
