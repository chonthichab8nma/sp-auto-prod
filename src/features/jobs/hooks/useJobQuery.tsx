import { useCallback, useEffect, useState, useRef } from "react";
import type { JobApi } from "../api/job.api";
import { getJobByIdApi } from "../api/job.api";
import { toThaiErrorMessage } from "../../../shared/lib/errorMessage";

export function useJobQuery(jobId: string | undefined) {
  const [data, setData] = useState<JobApi | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState("");
  const hasFetchedOnce = useRef(false);

  const fetchData = useCallback(async () => {
    if (!jobId) return;

    const id = Number(jobId);
    if (!Number.isFinite(id)) {
      setError("รหัสงานไม่ถูกต้อง");
      return;
    }

    if (hasFetchedOnce.current) {
      setIsRefetching(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const res = await getJobByIdApi(id);
      setData(res);
      hasFetchedOnce.current = true;
    } catch (e: unknown) {
      setError(toThaiErrorMessage(e, "โหลดข้อมูลไม่สำเร็จ"));
    } finally {
      setLoading(false);
      setIsRefetching(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      fetchData();
    }
  }, [jobId, fetchData]);

  return { data, loading, isRefetching, error, refetch: fetchData };
}
