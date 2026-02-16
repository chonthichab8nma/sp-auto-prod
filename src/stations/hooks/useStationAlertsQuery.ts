import { useEffect, useState } from "react";
import { getJobAlertsApi, type JobAlertApi } from "../api/jobAlerts.api";

export function useStationAlertsQuery() {
  const [data, setData] = useState<JobAlertApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getJobAlertsApi();
        if (!alive) return;
        setData(res.data ?? []);
      } catch (e: unknown) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "โหลดข้อมูลแจ้งเตือนไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { data, loading, error };
}

