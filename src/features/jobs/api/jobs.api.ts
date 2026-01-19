import type { Job } from "../../../Type";
import type { CreateJobPayload } from "../types/jobForm";
import { MOCK_JOBS } from "../../../data";

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function createJobMockApi(
  payload: CreateJobPayload
): Promise<ApiResult<Job>> {
  await sleep(250);

  const newJob: Job = {
    id: String(Date.now()),
    ...payload,

    stages: MOCK_JOBS[0]?.stages ?? [],
  } as Job;

  return { ok: true, data: newJob };
}
