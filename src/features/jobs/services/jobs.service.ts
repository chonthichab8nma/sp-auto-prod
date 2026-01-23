import type { Job } from "../../../Type";
import type { CreateJobPayload } from "../types/jobForm";
import { http } from "../../../shared/lib/http";

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type JobCustomerApi = {
  id: number;
  name: string;
  phone?: string | null;
  address?: string | null;
};

export type JobVehicleApi = {
  id: number;
  registration: string;
  brand?: string | null;
  model?: string | null;
  type?: string | null;
  year?: string | null;
  color?: string | null;
  chassisNumber?: string | null;
};

export type JobLite = {
  id: number;
  customer?: JobCustomerApi | null;
  vehicle?: JobVehicleApi | null;
  createdAt?: string;
};

type JobsListResponse = {
  data: JobLite[];
};

export const jobsService = {
  async create(payload: CreateJobPayload): Promise<ServiceResult<Job>> {
    try {
      const { data } = await http.post<Job>("/private/jobs", payload);
      return { ok: true, data };
    } catch (e: unknown) {
      if (e instanceof Error) {
        return { ok: false, error: e.message };
      }
      return { ok: false, error: "สร้างงานไม่สำเร็จ" };
    }
  },

  async findLatestByRegistration(
    registration: string,
  ): Promise<JobLite | null> {
    const reg = registration.trim();
    if (!reg) return null;

    const { data } = await http.get<JobsListResponse>("/private/jobs", {
      params: {
        vehicleRegistration: reg,
        page: 1,
        limit: 1,
      },
    });

    return data.data[0] ?? null;
  },
};
