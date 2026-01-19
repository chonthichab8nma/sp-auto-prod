import { useEffect, useRef, useState } from "react";
import type { Job } from "../../../Type";
import type { JobsQuery, JobsResponse } from "../api/job.api";
import { getJobsDashboardMock } from "../api/job.api";

export function useDashboardQuery(allJobs: Job[], query: JobsQuery) {
  const [data, setData] = useState<JobsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const reqIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const reqId = ++reqIdRef.current;

    async function run() {
      setLoading(true);
      setError("");

      try {
        const res = await getJobsDashboardMock(allJobs, query);

        if (cancelled) return;
        if (reqId !== reqIdRef.current) return;

        setData(res);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [allJobs, query]);

  return { data, loading, error };
}
