import { http } from "../../shared/lib/http";

export type AlertConfigStatus = "CLAIM" | "REPAIR" | "BILLING" | "DONE";

export type AlertConfigApi = {
  id: number;
  status: AlertConfigStatus;
  warningDays: number;
  criticalDays: number;
  updatedAt: string;
};

type AlertConfigsApiResponse =
  | AlertConfigApi[]
  | {
      data?: AlertConfigApi[];
    };

export async function getAlertConfigsApi(): Promise<AlertConfigApi[]> {
  const { data } = await http.get<AlertConfigsApiResponse>("private/alert-configs");

  if (Array.isArray(data)) return data;
  return data?.data ?? [];
}
