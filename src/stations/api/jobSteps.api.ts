import { http } from "../../shared/lib/http";
import type { StepStatus } from "../../Type";

export type UpdateJobStepPayload = {
  status: StepStatus;      // "completed" | "skipped"
  employeeId: number;
};

export async function updateJobStepProgress(
  jobStepId: number,
  payload: UpdateJobStepPayload,
) {
  const res = await http.post(
    `/job-steps/${jobStepId}/progress`,
    payload,
  );

  return res.data;
}
