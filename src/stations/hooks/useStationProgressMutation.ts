import { useState } from "react";
import type { StepStatus } from "../../Type";
import { http } from "../../shared/lib/http";

type SaveStepPayload = {
  stepId: string;
  status: StepStatus;
  employeeId?: number;
};

type ApiBody = {
  status: "pending" | "in_progress" | "completed" | "skipped";
  employeeId?: number;
};

function assertEmployeeId(payload: SaveStepPayload) {
  if (
    (payload.status === "completed" || payload.status === "in_progress") &&
    !payload.employeeId
  ) {
    throw new Error(
      "employeeId is required when status is completed or in_progress",
    );
  }
}

export function useStationProgressMutation() {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveStep = async (payload: SaveStepPayload) => {
    setSaving(true);
    setSaveError("");

    try {
      assertEmployeeId(payload);
      const body: ApiBody = {
        status: payload.status,
        ...(payload.employeeId ? { employeeId: payload.employeeId } : {}),
      };

      await http.patch(`/private/jobs/steps/${payload.stepId}`, body);
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
