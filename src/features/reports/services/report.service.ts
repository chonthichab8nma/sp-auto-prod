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

export type InsuranceStatItem = {
  insuranceCompanyId: number;
  insuranceCompanyName: string;
  jobCount: number;
  totalClaimAmount: number;
  totalApprovedAmount: number;
  totalDisbursedAmount: number;
};

export type InsuranceStatsResponse = {
  data: InsuranceStatItem[];
  count: number;
  filters: {
    sortBy: string;
    limit: number;
  };
};

export async function getDashboardSummaryApi(): Promise<DashboardSummary> {
  const { data } = await http.get<DashboardSummary>("private/dashboard/summary");
  return data;
}

export async function getInsuranceStatsApi(
  limit = 10,
): Promise<InsuranceStatsResponse> {
  const { data } = await http.get<InsuranceStatsResponse>(
    "private/dashboard/insurance-stats",
    {
      params: { limit },
    },
  );
  return data;
}
