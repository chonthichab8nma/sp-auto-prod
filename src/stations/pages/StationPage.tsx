import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import StationsFilters from "../components/StationsFilters";
import type { AlertFilterValue } from "../components/StationsFilters";
import StationsTable from "../components/StationsTable";
import { useStationAlertsQuery } from "../hooks/useStationAlertsQuery";
import { resolveAgingBand } from "../utils/aging";

import Pagination from "../../shared/components/ui/Pagination";

import type {
  JobsQuery,
  JobsListApiResponse,
} from "../../features/jobs/api/job.api";
import { getJobsApi } from "../../features/jobs/api/job.api";
import { useDashboardQuery } from "../../features/jobs/hooks/useDashboardQuery";
import type { JobApi } from "../../features/jobs/api/job.api";

function resolveTotalPages(
  res: JobsListApiResponse | null,
  pageSize: number,
): number {
  if (!res) return 1;

  if ("meta" in res) {
    const { totalItems, totalPages } = res.meta;
    if (typeof totalPages === "number") return Math.max(1, totalPages);
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }

  return Math.max(1, res.totalPages);
}

function resolveTotalItems(res: JobsListApiResponse | null): number {
  if (!res) return 0;
  if ("meta" in res) return res.meta.totalItems;
  return res.total;
}

type JobStatusApi = "CLAIM" | "REPAIR" | "BILLING" | "DONE";

function mapUiStatusToApi(s: string): JobStatusApi | undefined {
  switch (s) {
    case "เคลม":
      return "CLAIM";
    case "ซ่อม":
      return "REPAIR";
    case "ตั้งเบิก":
      return "BILLING";
    case "เสร็จสิ้น":
      return "DONE";
    default:
      return undefined;
  }
}

export default function StationsPage() {
  const navigate = useNavigate();
  const pageSize = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<AlertFilterValue>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [alertModeJobs, setAlertModeJobs] = useState<JobApi[]>([]);
  const [alertModeLoading, setAlertModeLoading] = useState(false);
  const [alertModeError, setAlertModeError] = useState("");
  const [summaryScopedJobs, setSummaryScopedJobs] = useState<JobApi[]>([]);
  const [summaryScopedLoading, setSummaryScopedLoading] = useState(false);

  const query: JobsQuery = useMemo(
    () => ({
      page: selectedAlert === "all" ? currentPage : 1,
      pageSize,
      search: searchTerm.trim() || undefined,
      status: mapUiStatusToApi(selectedStatus),
    }),
    [currentPage, pageSize, searchTerm, selectedAlert, selectedStatus],
  );

  const { data, error, loading } = useDashboardQuery(query, {
    enabled: selectedAlert === "all",
  });
  const { data: alertsData, error: alertsError } = useStationAlertsQuery();

  const apiJobs: JobApi[] = data?.data ?? [];
  const delayDaysByJobId = useMemo(() => {
    const map: Record<number, number> = {};
    for (const row of alertsData) {
      map[row.id] = row.daysInProcess;
    }
    return map;
  }, [alertsData]);

  useEffect(() => {
    if (selectedAlert === "all") {
      setAlertModeJobs([]);
      setAlertModeError("");
      setAlertModeLoading(false);
      return;
    }

    let alive = true;

    (async () => {
      setAlertModeLoading(true);
      setAlertModeError("");

      try {
        const merged: JobApi[] = [];
        const batchSize = 100;
        const baseParams = {
          pageSize: batchSize,
          search: searchTerm.trim() || undefined,
          status: mapUiStatusToApi(selectedStatus),
        };

        const firstPage = await getJobsApi({
          page: 1,
          ...baseParams,
        });
        if (!alive) return;

        merged.push(...(firstPage.data ?? []));

        const totalPages =
          "meta" in firstPage
            ? typeof firstPage.meta.totalPages === "number"
              ? Math.max(1, firstPage.meta.totalPages)
              : Math.max(1, Math.ceil(firstPage.meta.totalItems / batchSize))
            : Math.max(1, firstPage.totalPages);

        if (totalPages > 1) {
          const restPagePromises = Array.from(
            { length: totalPages - 1 },
            (_, index) =>
              getJobsApi({
                page: index + 2,
                ...baseParams,
              }),
          );
          const restPages = await Promise.all(restPagePromises);
          if (!alive) return;
          for (const pageRes of restPages) {
            merged.push(...(pageRes.data ?? []));
          }
        }

        if (!alive) return;
        setAlertModeJobs(merged);
      } catch (e: unknown) {
        if (!alive) return;
        setAlertModeError(
          e instanceof Error ? e.message : "โหลดข้อมูลแจ้งเตือนล่าช้าไม่สำเร็จ",
        );
      } finally {
        if (alive) setAlertModeLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [searchTerm, selectedAlert, selectedStatus]);

  useEffect(() => {
    const hasScopeFilter = Boolean(selectedStatus || searchTerm.trim());
    if (selectedAlert !== "all" || !hasScopeFilter) {
      setSummaryScopedJobs([]);
      setSummaryScopedLoading(false);
      return;
    }

    let alive = true;

    (async () => {
      setSummaryScopedLoading(true);
      try {
        const merged: JobApi[] = [];
        const batchSize = 100;
        const baseParams = {
          pageSize: batchSize,
          search: searchTerm.trim() || undefined,
          status: mapUiStatusToApi(selectedStatus),
        };

        const firstPage = await getJobsApi({
          page: 1,
          ...baseParams,
        });
        if (!alive) return;
        merged.push(...(firstPage.data ?? []));

        const totalPages =
          "meta" in firstPage
            ? typeof firstPage.meta.totalPages === "number"
              ? Math.max(1, firstPage.meta.totalPages)
              : Math.max(1, Math.ceil(firstPage.meta.totalItems / batchSize))
            : Math.max(1, firstPage.totalPages);

        if (totalPages > 1) {
          const restPagePromises = Array.from(
            { length: totalPages - 1 },
            (_, index) =>
              getJobsApi({
                page: index + 2,
                ...baseParams,
              }),
          );
          const restPages = await Promise.all(restPagePromises);
          if (!alive) return;
          for (const pageRes of restPages) {
            merged.push(...(pageRes.data ?? []));
          }
        }

        if (!alive) return;
        setSummaryScopedJobs(merged);
      } finally {
        if (alive) setSummaryScopedLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [searchTerm, selectedAlert, selectedStatus]);

  const filteredAlertJobs = useMemo(() => {
    if (selectedAlert === "all") return [];

    return alertModeJobs.filter((job) => {
      const days = delayDaysByJobId[job.id];
      if (typeof days !== "number") return false;
      return resolveAgingBand(days) === selectedAlert;
    });
  }, [alertModeJobs, delayDaysByJobId, selectedAlert]);

  const jobsForTable = useMemo(() => {
    if (selectedAlert === "all") return apiJobs;
    const start = (currentPage - 1) * pageSize;
    return filteredAlertJobs.slice(start, start + pageSize);
  }, [apiJobs, currentPage, filteredAlertJobs, pageSize, selectedAlert]);

  const totalPages = useMemo(() => {
    if (selectedAlert === "all") return resolveTotalPages(data, pageSize);
    return Math.max(1, Math.ceil(filteredAlertJobs.length / pageSize));
  }, [data, filteredAlertJobs.length, pageSize, selectedAlert]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const tableLoading = selectedAlert === "all" ? loading : alertModeLoading;
  const pageError = error || alertsError || alertModeError;

  const statusOptions = useMemo(() => ["เคลม", "ซ่อม", "ตั้งเบิก", "เสร็จสิ้น"], []);
  const summaryScopeJobs = useMemo(() => {
    if (selectedAlert !== "all") return alertModeJobs;
    if (selectedStatus || searchTerm.trim()) return summaryScopedJobs;
    return null;
  }, [alertModeJobs, searchTerm, selectedAlert, selectedStatus, summaryScopedJobs]);

  const summaryCounts = useMemo(
    () => ({
      all: summaryScopeJobs ? summaryScopeJobs.length : resolveTotalItems(data),
      warning: summaryScopeJobs
        ? (() => {
            const scopedIds = new Set(summaryScopeJobs.map((job) => job.id));
            return alertsData.filter(
              (row) =>
                scopedIds.has(row.id) &&
                resolveAgingBand(row.daysInProcess) === "warning",
            ).length;
          })()
        : alertsData.filter(
            (row) => resolveAgingBand(row.daysInProcess) === "warning",
          ).length,
      critical: summaryScopeJobs
        ? (() => {
            const scopedIds = new Set(summaryScopeJobs.map((job) => job.id));
            return alertsData.filter(
              (row) =>
                scopedIds.has(row.id) &&
                resolveAgingBand(row.daysInProcess) === "critical",
            ).length;
          })()
        : alertsData.filter(
            (row) => resolveAgingBand(row.daysInProcess) === "critical",
          ).length,
    }),
    [alertsData, data, summaryScopeJobs],
  );

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">สถานะ</h1>
        <p className="text-slate-500 text-sm">งานที่อยู่ในแต่ละสถานะ</p>
      </div>

      <StationsFilters
        searchTerm={searchTerm}
        selectedStatus={selectedStatus}
        selectedAlert={selectedAlert}
        summaryCounts={summaryCounts}
        statusOptions={statusOptions}
        onSearchTermChange={setSearchTerm}
        onStatusChange={(v) => {
          setSelectedStatus(v);
          setCurrentPage(1);
        }}
        onAlertChange={(v) => {
          setSelectedAlert(v);
          setCurrentPage(1);
        }}
        onSubmitSearch={() => setCurrentPage(1)}
      />

      {pageError && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-4">
          โหลดข้อมูลไม่สำเร็จ: {String(pageError)}
        </div>
      )}

      <div className="mt-4">
        <StationsTable
          jobs={jobsForTable}
          loading={tableLoading || summaryScopedLoading}
          delayDaysByJobId={delayDaysByJobId}
          onRowClick={(id) => navigate(`/stations/${id}`)}
        />
      </div>

      <div className="pt-6 border-t border-slate-100 mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onGoTo={(p) => setCurrentPage(p)}
          onFirst={() => setCurrentPage(1)}
          onPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          onNext={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          onLast={() => setCurrentPage(totalPages)}
        />
      </div>
    </div>
  );
}
