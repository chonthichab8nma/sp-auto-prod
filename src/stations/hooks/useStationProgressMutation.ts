import { useState } from "react";
import type { StepStatus } from "../../Type";
import { http } from "../../shared/lib/http";
import type { JobStepStatusApi } from "../../features/jobs/api/job.api";

type SaveStepPayload = {
  jobId: string;
  stageIdx: number;
  stepId: string;
  status: StepStatus;
  employee: string;
};

function mapStatusToApi(status: StepStatus): JobStepStatusApi {
  if (status === "skipped") {
    // backend ไม่รองรับ skipped
    return "pending";
  }
  return status;
}

export function useStationProgressMutation() {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveStep = async (payload: SaveStepPayload) => {
    setSaving(true);
    setSaveError(null);

    try {
      const apiStatus = mapStatusToApi(payload.status);

      await http.patch(
        `/private/jobs/${payload.jobId}/stages/${payload.stageIdx}/steps/${payload.stepId}`,
        {
          status: apiStatus,
          employee: payload.employee,
        }
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "บันทึกสถานะไม่สำเร็จ";
      setSaveError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return { saveStep, saving, saveError };
}