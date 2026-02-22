import { useEffect, useState } from "react";
import {
  getJobAlertsApi,
  type JobAlertApi,
  type JobAlertsThreshold,
} from "../api/jobAlerts.api";
import { toThaiErrorMessage } from "../../shared/lib/errorMessage";

type Params = {
  threshold?: JobAlertsThreshold;
  page?: number;
  limit?: number;
};

export function useStationAlertsQuery(
  params?: Params,
  options?: { enabled?: boolean },
) {
  const [data, setData] = useState<JobAlertApi[]>([]);
  const [summary, setSummary] = useState({
    criticalCount: 0,
    warningCount: 0,
    totalAlerts: 0,
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setError("");
      setData([]);
      setTotal(0);
      setPage(1);
      setLimit(0);
      setTotalPages(1);
      return;
    }

    let alive = true;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getJobAlertsApi(params);
        if (!alive) return;
        setData(res.data ?? []);
        setTotal(res.total ?? 0);
        setPage(res.page ?? 1);
        setLimit(res.limit ?? 0);
        setTotalPages(res.totalPages ?? 1);
        setSummary(
          res.summary ?? {
            criticalCount: 0,
            warningCount: 0,
            totalAlerts: 0,
          },
        );
      } catch (e: unknown) {
        if (!alive) return;
        setError(toThaiErrorMessage(e, "โหลดข้อมูลแจ้งเตือนไม่สำเร็จ"));
        setSummary({
          criticalCount: 0,
          warningCount: 0,
          totalAlerts: 0,
        });
        setTotal(0);
        setPage(1);
        setLimit(0);
        setTotalPages(1);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [enabled, params?.limit, params?.page, params?.threshold]);

  return { data, summary, total, page, limit, totalPages, loading, error };
}
