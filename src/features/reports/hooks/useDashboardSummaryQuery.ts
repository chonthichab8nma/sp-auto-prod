import { useCallback, useEffect, useState } from "react";
import { toThaiErrorMessage } from "../../../shared/lib/errorMessage";
import {
  getFinancialSummaryApi,
  getInsuranceFinancialSummaryApi,
  getMonthlyTrendsApi,
  getDashboardSummaryApi,
  getInsuranceStatsApi,
  getTopInsuranceApi,
  type DashboardSummary,
  type FinancialSummary,
  type InsuranceFinancialSummary,
  type InsuranceStatItem,
  type MonthlyTrendsResponse,
  type TopInsuranceItem,
} from "../services/report.service";

export function useDashboardSummaryQuery() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(
    null,
  );
  const [insuranceFinancialSummary, setInsuranceFinancialSummary] =
    useState<InsuranceFinancialSummary | null>(null);
  const [insuranceStats, setInsuranceStats] = useState<InsuranceStatItem[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrendsResponse | null>(
    null,
  );
  const [topInsurance, setTopInsurance] = useState<TopInsuranceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        summaryRes,
        financialRes,
        insuranceFinancialRes,
        insuranceRes,
        trendsRes,
        topInsuranceRes,
      ] =
        await Promise.all([
        getDashboardSummaryApi(),
        getFinancialSummaryApi(),
        getInsuranceFinancialSummaryApi().catch(() => null),
        getInsuranceStatsApi(100),
        getMonthlyTrendsApi(selectedYear),
        getTopInsuranceApi(currentMonth, currentYear),
      ]);
      setData(summaryRes);
      setFinancialSummary(financialRes);
      setInsuranceFinancialSummary(insuranceFinancialRes);
      setInsuranceStats(insuranceRes?.data ?? []);
      setMonthlyTrends(trendsRes);
      setTopInsurance(topInsuranceRes?.data ?? []);
    } catch (e: unknown) {
      setError(toThaiErrorMessage(e, "โหลดข้อมูลสรุปรายงานไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear, selectedYear]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    data,
    financialSummary,
    insuranceFinancialSummary,
    insuranceStats,
    monthlyTrends,
    topInsurance,
    selectedYear,
    setSelectedYear,
    loading,
    error,
    refetch: fetchSummary,
  };
}
