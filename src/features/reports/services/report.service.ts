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
  totalExcessFee?: number;
  totalCashAndClaim?: number;
  pendingDisbursement: number;
  totalClaimAmount: number;
  totalApprovedAmount: number;
  totalDisbursedAmount: number;
  statusCounts: JobStatusSummary;
};

export type FinancialSummary = {
  totalExcessFee: number;
  totalClaimAmount: number;
  totalCashAndClaim: number;
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
  filters: Record<string, unknown>;
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
  insuranceCompanyId: number;
  data: MonthlyTrendItem[];
  yearTotals: {
    jobCount: number;
    totalClaimAmount: number;
    totalApprovedAmount: number;
    totalDisbursedAmount: number;
  };
};

export type TopInsuranceItem = {
  insuranceCompanyId: number;
  insuranceCompanyName: string;
  jobCount: number;
};

export type TopInsuranceResponse = {
  month: number;
  year: number;
  data: TopInsuranceItem[];
  count: number;
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

export async function getFinancialSummaryApi(): Promise<FinancialSummary> {
  const { data } = await http.get<FinancialSummary>(
    "private/dashboard/financial-summary",
  );
  return data;
}

export async function getMonthlyTrendsApi(
  year: number,
): Promise<MonthlyTrendsResponse> {
  const { data } = await http.get<MonthlyTrendsResponse>(
    "private/dashboard/monthly-trends",
    {
      params: { year },
    },
  );
  return data;
}

export async function getTopInsuranceApi(
  month?: number,
  year?: number,
): Promise<TopInsuranceResponse> {
  const params: Record<string, number> = {};
  if (typeof month === "number") params.month = month;
  if (typeof year === "number") params.year = year;

  const { data } = await http.get<TopInsuranceResponse>(
    "private/dashboard/top-insurance",
    {
      params,
    },
  );
  return data;
}
