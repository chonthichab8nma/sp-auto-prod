import { useCallback, useState } from "react";
import type { StepStatus } from "../../Type";
import { patchJobStepStatus } from "../api/jobSteps.api";

export type SaveStepInput = {
  stepId: string;
  status: StepStatus;
  employeeId?: number;
};

type UseStationProgressMutationResult = {
  saveStep: (input: SaveStepInput) => Promise<void>;
  saving: boolean;
  saveError: string | null;
};

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

function requireEmployeeId(status: StepStatus): boolean {
  return status === "completed" || status === "in_progress";
}
export function useStationProgressMutation(): UseStationProgressMutationResult {
  const [saving, setSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveStep = useCallback(async (input: SaveStepInput) => {
    setSaving(true);
    setSaveError(null);

    try {
      const stepIdNum = Number(input.stepId);
      if (!Number.isFinite(stepIdNum) || stepIdNum <= 0) {
        throw new Error(`Invalid stepId: ${input.stepId}`);
      }

      if (requireEmployeeId(input.status) && input.employeeId == null) {
        throw new Error("employeeId is required when status is completed or in_progress");
      }

      await patchJobStepStatus(stepIdNum, {
        status: input.status,
        employeeId: input.employeeId,
      });
    } catch (err: unknown) {
      const msg = toErrorMessage(err);
      setSaveError(msg);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { saveStep, saving, saveError };
}
