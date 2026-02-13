import { useCallback, useEffect, useState } from "react";
import {
  getAgingAlerts,
  type AgingAlertsResponse,
} from "../api/disbursement.api";

export function useAgingAlerts(
  threshold: "warning" | "critical" | "all" = "all",
  status?: string,
) {
  const [data, setData] = useState<AgingAlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAgingAlerts({
        threshold,
        status: status || undefined,
        limit: 50,
      });
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [threshold, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
