import { useState } from "react";
import type { StepStatus } from "../../Type";
import { updateStepMock } from "../api/stations.api";

export function useStationProgressMutation() {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveStep = async (req: {
    jobId: string;
    stageIdx: number;
    stepId: string;
    status: StepStatus;
    employee: string;
  }) => {
    setSaving(true);
    setSaveError(null);

    try {
      const res = await updateStepMock({
        jobId: req.jobId,
        stageIdx: req.stageIdx,
        stepId: req.stepId,
        status: req.status,
        employee: req.employee,
      });

      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setSaveError(msg);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  return { saveStep, saving, saveError };
}
