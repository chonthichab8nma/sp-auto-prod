import type { StepStatus } from "../../Type";

export type UpdateStepRequest = {
  jobId: string;
  stageIdx: number;
  stepId: string;
  status: StepStatus;
  employee: string;
};

export type UpdateStepResponse = {
  ok: true;
  serverTimestamp: string;
};

function nowTimestamp() {
  return new Date().toISOString();
}

export async function updateStepMock(
  req: UpdateStepRequest
): Promise<UpdateStepResponse> {
  await new Promise((r) => setTimeout(r, 250));

  console.log("[mock api] update step", {
    jobId: req.jobId,
    stageIdx: req.stageIdx,
    stepId: req.stepId,
    status: req.status,
  });

  return { ok: true, serverTimestamp: nowTimestamp() };
}
