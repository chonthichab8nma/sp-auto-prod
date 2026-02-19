import { http } from "../../../shared/lib/http";

export type JobStatusSummary = {
  CLAIM: number;
  REPAIR: number;
  BILLING: number;
  DONE: number;
};

export type DashboardSummary = {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  pendingDisbursement: number;
  totalClaimAmount: number;
  totalApprovedAmount: number;
  totalDisbursedAmount: number;
  statusCounts: JobStatusSummary;
};

export async function getDashboardSummaryApi(): Promise<DashboardSummary> {
  const { data } = await http.get<DashboardSummary>("private/dashboard/summary");
  return data;
}
