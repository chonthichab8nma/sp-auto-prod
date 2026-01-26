import { useCallback, useEffect, useState } from "react";
import type { JobApi } from "../../features/jobs/api/job.api";
import { http } from "../../shared/lib/http";

export function useStationProgress(jobId: number | null) {
  const [job, setJob] = useState<JobApi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) return null;

    setLoading(true);
    setError(null);

    try {
      const { data } = await http.get<JobApi>(`/private/jobs/${jobId}`);
      setJob(data);
      return data;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "โหลดข้อมูลงานไม่สำเร็จ";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  return { job, loading, error, refetch: fetchJob };
}
