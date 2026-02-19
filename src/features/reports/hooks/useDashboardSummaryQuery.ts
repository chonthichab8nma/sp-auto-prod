import { useCallback, useEffect, useState } from "react";
import { toThaiErrorMessage } from "../../../shared/lib/errorMessage";
import {
  getDashboardSummaryApi,
  type DashboardSummary,
} from "../services/report.service";

export function useDashboardSummaryQuery() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getDashboardSummaryApi();
      setData(res);
    } catch (e: unknown) {
      setError(toThaiErrorMessage(e, "โหลดข้อมูลสรุปรายงานไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, loading, error, refetch: fetchSummary };
}
