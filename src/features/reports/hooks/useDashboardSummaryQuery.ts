import { useCallback, useEffect, useState } from "react";
import { toThaiErrorMessage } from "../../../shared/lib/errorMessage";
import {
  getDashboardSummaryApi,
  getInsuranceStatsApi,
  type DashboardSummary,
  type InsuranceStatItem,
} from "../services/report.service";

export function useDashboardSummaryQuery() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [insuranceStats, setInsuranceStats] = useState<InsuranceStatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryRes, insuranceRes] = await Promise.all([
        getDashboardSummaryApi(),
        getInsuranceStatsApi(10),
      ]);
      setData(summaryRes);
      setInsuranceStats(insuranceRes?.data ?? []);
    } catch (e: unknown) {
      setError(toThaiErrorMessage(e, "โหลดข้อมูลสรุปรายงานไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, insuranceStats, loading, error, refetch: fetchSummary };
}
