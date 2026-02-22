import { http } from "../../shared/lib/http";
import type { JobApi } from "../../features/jobs/api/job.api";

export type JobAlertsThreshold = "warning" | "critical" | "all";
export type JobAlertAgingStatus = "normal" | "warning" | "critical";
export type JobAlertAgingColor = "green" | "yellow" | "red";

export type JobAlertApi = Pick<
  JobApi,
  | "id"
  | "jobNumber"
  | "status"
  | "isFinished"
  | "startDate"
  | "estimatedEndDate"
  | "repairDescription"
  | "notes"
  | "vehicle"
  | "customer"
> & {
  daysInProcess: number;
  agingStatus: JobAlertAgingStatus;
  agingColor: JobAlertAgingColor;
};

export type JobAlertsApiResponse = {
  data: JobAlertApi[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    criticalCount: number;
    warningCount: number;
    totalAlerts: number;
  };
};

export async function getJobAlertsApi(params?: {
  threshold?: JobAlertsThreshold;
  page?: number;
  limit?: number;
}): Promise<JobAlertsApiResponse> {
  const { data } = await http.get<JobAlertsApiResponse>("private/jobs/alerts", {
    params: {
      threshold: params?.threshold,
      page: params?.page,
      limit: params?.limit,
    },
  });
  return data;
}
