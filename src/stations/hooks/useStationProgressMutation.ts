import { useCallback, useState } from "react";
import type { StepStatus } from "../../Type";
import { patchJobStepStatus } from "../api/jobSteps.api";
import { toThaiErrorMessage } from "../../shared/lib/errorMessage";

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
  return toThaiErrorMessage(err, "บันทึกข้อมูลไม่สำเร็จ");
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
        throw new Error("รหัสขั้นตอนไม่ถูกต้อง");
      }

      if (requireEmployeeId(input.status) && input.employeeId == null) {
        throw new Error("กรุณาเลือกผู้ดำเนินการก่อนบันทึกสถานะ");
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
