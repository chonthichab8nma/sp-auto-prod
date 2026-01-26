import { http } from "../../shared/lib/http";
import type { StepStatus } from "../../Type";

export async function patchJobStepStatus(
  stepId: number,
  body: { status: StepStatus; employeeId?: number },
) {
  if (
    (body.status === "completed" || body.status === "in_progress") &&
    !body.employeeId
  ) {
    throw new Error(
      "employeeId is required when status is completed or in_progress",
    );
  }

  const res = await http.patch(`/private/jobs/steps/${stepId}`, body);
  return res.data;
}
