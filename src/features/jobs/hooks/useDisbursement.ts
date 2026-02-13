import { useCallback, useEffect, useState } from "react";
import {
  getDisbursementSummary,
  setDisbursement,
  type DisbursementSummaryResponse,
} from "../api/disbursement.api";

export function useDisbursement(filters?: {
  insuranceCompanyId?: number;
  dateFrom?: string;
  dateTo?: string;
}) {
  const [data, setData] = useState<DisbursementSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getDisbursementSummary(filters);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [filters?.insuranceCompanyId, filters?.dateFrom, filters?.dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const disburse = useCallback(
    async (jobId: number, amount: number, date?: string) => {
      await setDisbursement(jobId, amount, date);
      await fetchData();
    },
    [fetchData],
  );

  return { data, loading, error, refetch: fetchData, disburse };
}
