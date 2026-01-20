import type { Job } from "../../../Type";
import type { CreateJobPayload } from "../types/jobForm";
import { createJobMockApi } from "../api/mock.jobs.api";

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export const jobsService = {
  async create(payload: CreateJobPayload): Promise<ServiceResult<Job>> {
    const res = await createJobMockApi(payload);
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, data: res.data };
  },
};
