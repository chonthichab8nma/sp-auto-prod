import { http } from "../../shared/lib/http";
import type { StepStatus } from "../../Type";

export type PatchJobStepStatusBody = {
  status: StepStatus;
  employeeId?: number;
  remark?: string; 
};

export async function patchJobStepStatus(
  stepId: number,
  body: PatchJobStepStatusBody,
) {
  if (
    (body.status === "completed" || body.status === "in_progress") &&
    !body.employeeId
  ) {
    throw new Error("กรุณาเลือกผู้ดำเนินการก่อนบันทึกสถานะ");
  }

  const res = await http.patch(`/private/jobs/steps/${stepId}`, body);
  return res.data;
}
