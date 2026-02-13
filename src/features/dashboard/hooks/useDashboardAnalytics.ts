import { useCallback, useEffect, useState } from "react";
import {
  getDashboardSummary,
  getInsuranceStats,
  getMonthlyTrends,
  getTopInsurance,
  type DashboardSummary,
  type InsuranceStatsResponse,
  type MonthlyTrendsResponse,
  type TopInsuranceResponse,
  type DashboardFilters,
} from "../api/dashboard.api";

export function useDashboardAnalytics(filters?: DashboardFilters) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [insuranceStats, setInsuranceStats] =
    useState<InsuranceStatsResponse | null>(null);
  const [monthlyTrends, setMonthlyTrends] =
    useState<MonthlyTrendsResponse | null>(null);
  const [topInsurance, setTopInsurance] =
    useState<TopInsuranceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [s, i, m, t] = await Promise.all([
        getDashboardSummary(filters),
        getInsuranceStats({ ...filters, limit: 10 }),
        getMonthlyTrends(),
        getTopInsurance(5),
      ]);
      setSummary(s);
      setInsuranceStats(i);
      setMonthlyTrends(m);
      setTopInsurance(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [filters?.dateFrom, filters?.dateTo]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    summary,
    insuranceStats,
    monthlyTrends,
    topInsurance,
    loading,
    error,
    refetch: fetchAll,
  };
}
