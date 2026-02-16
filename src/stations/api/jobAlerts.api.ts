import { http } from "../../shared/lib/http";

export type JobAlertApi = {
  id: number;
  jobNumber: string;
  daysInProcess: number;
  agingStatus: "normal" | "warning" | "critical";
  agingColor: "green" | "yellow" | "red";
};

export type JobAlertsApiResponse = {
  data: JobAlertApi[];
  summary: {
    criticalCount: number;
    warningCount: number;
    totalAlerts: number;
  };
};

export async function getJobAlertsApi(): Promise<JobAlertsApiResponse> {
  const { data } = await http.get<JobAlertsApiResponse>("private/jobs/alerts");
  return data;
}

