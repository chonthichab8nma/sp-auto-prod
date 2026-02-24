import { useEffect, useState } from "react";
import { getAlertConfigsApi, type AlertConfigApi } from "../api/alertConfigs.api";
import { toThaiErrorMessage } from "../../shared/lib/errorMessage";

export function useAlertConfigsQuery(options?: { enabled?: boolean }) {
  const [data, setData] = useState<AlertConfigApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled) {
      setData([]);
      setLoading(false);
      setError("");
      return;
    }

    let alive = true;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const res = await getAlertConfigsApi();
        if (!alive) return;
        setData(res ?? []);
      } catch (e: unknown) {
        if (!alive) return;
        setError(toThaiErrorMessage(e, "โหลดค่าระยะเวลาแจ้งเตือนไม่สำเร็จ"));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [enabled]);

  return { data, loading, error };
}
