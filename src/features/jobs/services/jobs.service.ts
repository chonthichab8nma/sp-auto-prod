import type { Job } from "../../../Type";
import type { CreateJobPayload } from "../types/jobForm";
import { http } from "../../../shared/lib/http"; 

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export const jobsService = {
  async create(payload: CreateJobPayload): Promise<ServiceResult<Job>> {
    try {
      const { data } = await http.post<Job>(
        "/private/jobs",
        payload
      );
      return { ok: true, data };
    } catch (e: unknown) {
      if (e instanceof Error) {
        return { ok: false, error: e.message };
      }
      return { ok: false, error: "สร้างงานไม่สำเร็จ" };
    }
  },
};