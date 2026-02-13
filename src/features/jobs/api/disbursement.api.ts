import { http } from "../../../shared/lib/http";

export type DisbursementJob = {
  id: number;
  jobNumber: string;
  claimAmount: number | null;
  approvedAmount: number | null;
  disbursedAmount: number | null;
  disbursementDate: string | null;
  startDate: string;
  vehicle: {
    registration: string;
    brand: string;
    model: string;
  };
  customer: { name: string };
  insuranceCompany: { id: number; name: string } | null;
};

export type DisbursementSummaryResponse = {
  totalApproved: number;
  totalDisbursed: number;
  pendingDisbursement: number;
  pendingJobsCount: number;
  disbursedJobsCount: number;
  pendingJobs: DisbursementJob[];
  disbursedJobs: DisbursementJob[];
};

export type AgingAlert = {
  id: number;
  jobNumber: string;
  status: string;
  vehicle: {
    registration: string;
    brand: string;
    model: string;
  };
  customer: {
    name: string;
    phone: string;
  };
  insuranceCompany: { name: string } | null;
  receiver: { name: string } | null;
  startDate: string;
  daysInProcess: number;
  agingStatus: "warning" | "critical";
  agingColor: "yellow" | "red";
};

export type AgingAlertsResponse = {
  data: AgingAlert[];
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

export async function setDisbursement(
  jobId: number,
  amount: number,
  date?: string,
): Promise<unknown> {
  const { data } = await http.patch(`private/jobs/${jobId}/disbursement`, {
    amount,
    date,
  });
  return data;
}

export async function getDisbursementSummary(filters?: {
  insuranceCompanyId?: number;
  dateFrom?: string;
  dateTo?: string;
}): Promise<DisbursementSummaryResponse> {
  const { data } = await http.get<DisbursementSummaryResponse>(
    "private/jobs/disbursement/summary",
    { params: filters },
  );
  return data;
}

export async function getAgingAlerts(options?: {
  threshold?: "warning" | "critical" | "all";
  status?: string;
  page?: number;
  limit?: number;
}): Promise<AgingAlertsResponse> {
  const { data } = await http.get<AgingAlertsResponse>(
    "private/jobs/alerts",
    { params: options },
  );
  return data;
}

// ─── Alert Config API ────────────────────────────────────────

export type AlertConfigApi = {
  id: number;
  status: string;
  warningDays: number;
  criticalDays: number;
  updatedAt: string;
};

export async function getAlertConfigs(): Promise<AlertConfigApi[]> {
  const { data } = await http.get<AlertConfigApi[]>(
    "private/alert-configs",
  );
  return data;
}

export async function upsertAlertConfig(
  status: string,
  body: { warningDays: number; criticalDays: number },
): Promise<AlertConfigApi> {
  const { data } = await http.put<AlertConfigApi>(
    `private/alert-configs/${status}`,
    body,
  );
  return data;
}

export async function resetAlertConfigs(): Promise<AlertConfigApi[]> {
  const { data } = await http.post<AlertConfigApi[]>(
    "private/alert-configs/reset",
  );
  return data;
}
