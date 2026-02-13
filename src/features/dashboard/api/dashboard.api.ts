import { http } from "../../../shared/lib/http";

export type DashboardSummary = {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalClaimAmount: number;
  totalApprovedAmount: number;
  totalDisbursedAmount: number;
  pendingDisbursement: number;
  statusCounts: {
    CLAIM: number;
    REPAIR: number;
    BILLING: number;
    DONE: number;
  };
};

export type InsuranceStat = {
  insuranceCompanyId: number;
  insuranceCompanyName: string;
  jobCount: number;
  totalClaimAmount: number;
  totalApprovedAmount: number;
  totalDisbursedAmount: number;
};

export type InsuranceStatsResponse = {
  data: InsuranceStat[];
  count: number;
  filters: {
    dateFrom: string | null;
    dateTo: string | null;
    sortBy: string;
    limit: number;
  };
};

export type MonthlyTrendItem = {
  year: number;
  month: number;
  monthName: string;
  jobCount: number;
  totalClaimAmount: number;
  totalApprovedAmount: number;
  totalDisbursedAmount: number;
};

export type MonthlyTrendsResponse = {
  year: number;
  insuranceCompanyId: number | null;
  data: MonthlyTrendItem[];
  yearTotals: {
    jobCount: number;
    totalClaimAmount: number;
    totalApprovedAmount: number;
    totalDisbursedAmount: number;
  };
};

export type TopInsuranceResponse = {
  month: number;
  year: number;
  data: InsuranceStat[];
  count: number;
};

export type DashboardFilters = {
  dateFrom?: string;
  dateTo?: string;
};

export async function getDashboardSummary(
  filters?: DashboardFilters,
): Promise<DashboardSummary> {
  const { data } = await http.get<DashboardSummary>(
    "private/dashboard/summary",
    { params: filters },
  );
  return data;
}

export async function getInsuranceStats(
  filters?: DashboardFilters & { sortBy?: string; limit?: number },
): Promise<InsuranceStatsResponse> {
  const { data } = await http.get<InsuranceStatsResponse>(
    "private/dashboard/insurance-stats",
    { params: filters },
  );
  return data;
}

export async function getMonthlyTrends(params?: {
  year?: number;
  insuranceCompanyId?: number;
}): Promise<MonthlyTrendsResponse> {
  const { data } = await http.get<MonthlyTrendsResponse>(
    "private/dashboard/monthly-trends",
    { params },
  );
  return data;
}

export async function getTopInsurance(
  limit?: number,
): Promise<TopInsuranceResponse> {
  const { data } = await http.get<TopInsuranceResponse>(
    "private/dashboard/top-insurance",
    { params: limit ? { limit } : undefined },
  );
  return data;
}
