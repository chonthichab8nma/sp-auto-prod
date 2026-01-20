import { useEffect, useState } from "react";
import type { JobApi } from "../api/job.api";
import { getJobByIdApi } from "../api/job.api";



export function useJobQuery(jobId: string | undefined) {
  const [data, setData] = useState<JobApi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jobId) return;

    const id = Number(jobId);
    if (!Number.isFinite(id)) {
      setError("jobId ไม่ถูกต้อง");
      return;
    }

    let alive = true;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const res = await getJobByIdApi(id);
        if (!alive) return;
        setData(res);
      } catch (e: unknown) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [jobId]);

  return { data, loading, error };
}
