import { useEffect, useState } from "react";
import type { JobsQuery, JobsListApiResponse } from "../api/job.api";
import { getJobsApi } from "../api/job.api";

export function useDashboardQuery(
  query: JobsQuery,
  options?: { enabled?: boolean },
) {
  const [data, setData] = useState<JobsListApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setError("");
      setData(null);
      return;
    }

    let alive = true;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const res = await getJobsApi(query);
        if (!alive) return;
        setData(res);
      } catch (e: unknown) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [enabled, query]);

  return { data, loading, error };
}
