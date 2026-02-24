import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import StationsFilters from "../components/StationsFilters";
import type { AlertFilterValue } from "../components/StationsFilters";
import StationsTable from "../components/StationsTable";
import { useStationAlertsQuery } from "../hooks/useStationAlertsQuery";
import { useAlertConfigsQuery } from "../hooks/useAlertConfigsQuery";
import { resolveAgingBand, type AgingThresholds } from "../utils/aging";
import { toThaiErrorMessage } from "../../shared/lib/errorMessage";

import Pagination from "../../shared/components/ui/Pagination";

import type { JobsQuery, JobStatusApi } from "../../features/jobs/api/job.api";
import { useDashboardQuery } from "../../features/jobs/hooks/useDashboardQuery";
import type { JobApi } from "../../features/jobs/api/job.api";
import {
  fetchAllJobsPages,
  mapUiStatusToApi,
  resolveTotalItems,
  resolveTotalPages,
} from "../../features/jobs/lib/query";

export default function StationsPage() {
  const navigate = useNavigate();
  const pageSize = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<AlertFilterValue>("vehicles");
  const [currentPage, setCurrentPage] = useState(1);
  const [scopedJobs, setScopedJobs] = useState<JobApi[] | null>(null);
  const [scopedJobsLoading, setScopedJobsLoading] = useState(false);
  const [scopedJobsError, setScopedJobsError] = useState("");
  const normalizedSearch = searchTerm.trim();
  const mappedStatus = mapUiStatusToApi(selectedStatus);
  const hasScopeFilter = Boolean(selectedStatus || normalizedSearch);
  const shouldUseAlertsEndpointTable =
    selectedAlert !== "vehicles" && !hasScopeFilter;

  const query: JobsQuery = useMemo(
    () => ({
      page: currentPage,
      pageSize,
      search: normalizedSearch || undefined,
      status: mappedStatus,
    }),
    [currentPage, mappedStatus, normalizedSearch, pageSize],
  );
  const totalVehiclesQuery: JobsQuery = useMemo(
    () => ({
      page: 1,
      pageSize: 1,
      search: normalizedSearch || undefined,
      status: mappedStatus,
    }),
    [mappedStatus, normalizedSearch],
  );

  const { data, error, loading } = useDashboardQuery(query, {
    enabled: !shouldUseAlertsEndpointTable,
  });
  const { data: totalVehiclesData } = useDashboardQuery(totalVehiclesQuery, {
    enabled: shouldUseAlertsEndpointTable,
  });
  const {
    summary: alertsSummary,
    error: alertsSummaryError,
  } = useStationAlertsQuery({ threshold: "all", page: 1, limit: 1 });
  const { data: alertConfigs, error: alertConfigsError } = useAlertConfigsQuery();
  const {
    data: alertsPageData,
    totalPages: alertsPageTotalPages,
    error: alertsPageError,
    loading: alertsPageLoading,
  } = useStationAlertsQuery(
    {
      threshold: selectedAlert === "vehicles" ? "all" : selectedAlert,
      page: currentPage,
      limit: pageSize,
    },
    { enabled: shouldUseAlertsEndpointTable },
  );

  const thresholdsByStatus = useMemo(() => {
    const defaults: Record<JobStatusApi, AgingThresholds> = {
      CLAIM: { warningDays: 15, criticalDays: 30 },
      REPAIR: { warningDays: 15, criticalDays: 30 },
      BILLING: { warningDays: 15, criticalDays: 30 },
      DONE: { warningDays: Number.MAX_SAFE_INTEGER, criticalDays: Number.MAX_SAFE_INTEGER },
    };

    for (const item of alertConfigs) {
      defaults[item.status] = {
        warningDays: Number(item.warningDays || 0),
        criticalDays: Number(item.criticalDays || 0),
      };
    }

    return defaults;
  }, [alertConfigs]);

  const selectedStatusThresholds = useMemo(() => {
    if (!mappedStatus) return { warningDays: 15, criticalDays: 30 };
    return thresholdsByStatus[mappedStatus];
  }, [mappedStatus, thresholdsByStatus]);

  useEffect(() => {
    if (!hasScopeFilter) {
      setScopedJobs(null);
      setScopedJobsLoading(false);
      setScopedJobsError("");
      return;
    }

    let alive = true;

    (async () => {
      setScopedJobsLoading(true);
      setScopedJobsError("");
      setScopedJobs(null);
      try {
        const jobs = await fetchAllJobsPages({
          pageSize,
          search: normalizedSearch || undefined,
          status: mappedStatus,
        });
        if (!alive) return;
        setScopedJobs(jobs);
      } catch (e: unknown) {
        if (!alive) return;
        setScopedJobsError(toThaiErrorMessage(e, "โหลดข้อมูลแจ้งเตือนไม่สำเร็จ"));
      } finally {
        if (alive) setScopedJobsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [hasScopeFilter, mappedStatus, normalizedSearch, pageSize]);

  const apiJobs = useMemo(() => data?.data ?? [], [data]);
  const scopedSummary = useMemo(() => {
    if (!hasScopeFilter) {
      const totalAlerts = alertsSummary.warningCount + alertsSummary.criticalCount;
      return {
        all: totalAlerts,
        warning: alertsSummary.warningCount,
        critical: alertsSummary.criticalCount,
      };
    }

    const source = scopedJobs ?? [];
    let warning = 0;
    let critical = 0;
    for (const job of source) {
      const days = job.daysInProcess;
      if (typeof days !== "number") continue;
      const band = resolveAgingBand(days, thresholdsByStatus[job.status]);
      if (band === "warning") warning += 1;
      if (band === "critical") critical += 1;
    }

    return {
      all: warning + critical,
      warning,
      critical,
    };
  }, [
    alertsSummary.criticalCount,
    alertsSummary.warningCount,
    hasScopeFilter,
    scopedJobs,
    thresholdsByStatus,
  ]);

  const scopedFilteredJobs = useMemo(() => {
    if (!hasScopeFilter || selectedAlert === "vehicles") return scopedJobs ?? [];
    if (selectedAlert === "all") {
      return (scopedJobs ?? []).filter((job) => {
        const days = job.daysInProcess;
        if (typeof days !== "number") return false;
        const band = resolveAgingBand(days, thresholdsByStatus[job.status]);
        return band === "warning" || band === "critical";
      });
    }
    return (scopedJobs ?? []).filter((job) => {
      const days = job.daysInProcess;
      if (typeof days !== "number") return false;
      return resolveAgingBand(days, thresholdsByStatus[job.status]) === selectedAlert;
    });
  }, [hasScopeFilter, scopedJobs, selectedAlert, thresholdsByStatus]);

  const isScopedAlertMode = hasScopeFilter && selectedAlert !== "vehicles";
  const scopedAlertPageData = useMemo(() => {
    if (!isScopedAlertMode) return [];
    const start = (currentPage - 1) * pageSize;
    return scopedFilteredJobs.slice(start, start + pageSize);
  }, [currentPage, isScopedAlertMode, pageSize, scopedFilteredJobs]);

  const displayedJobs = useMemo(() => {
    if (shouldUseAlertsEndpointTable) return alertsPageData;
    if (isScopedAlertMode) return scopedAlertPageData;
    return apiJobs;
  }, [
    alertsPageData,
    apiJobs,
    isScopedAlertMode,
    scopedAlertPageData,
    shouldUseAlertsEndpointTable,
  ]);

  const delayDaysByJobId = useMemo(() => {
    const map: Record<number, number> = {};
    for (const row of displayedJobs) {
      if (typeof row.daysInProcess === "number") {
        map[row.id] = row.daysInProcess;
      }
    }
    return map;
  }, [displayedJobs]);

  const agingBandByJobId = useMemo(() => {
    const map: Record<number, "normal" | "warning" | "critical"> = {};
    for (const row of displayedJobs) {
      if (row.agingStatus === "normal" || row.agingStatus === "warning" || row.agingStatus === "critical") {
        map[row.id] = row.agingStatus;
      } else if (typeof row.daysInProcess === "number") {
        map[row.id] = resolveAgingBand(row.daysInProcess, thresholdsByStatus[row.status]);
      }
    }
    return map;
  }, [displayedJobs, thresholdsByStatus]);

  const totalPages = useMemo(() => {
    if (shouldUseAlertsEndpointTable) {
      return Math.max(1, alertsPageTotalPages || 1);
    }
    if (isScopedAlertMode) {
      return Math.max(1, Math.ceil(scopedFilteredJobs.length / pageSize));
    }
    return resolveTotalPages(data, pageSize);
  }, [
    alertsPageTotalPages,
    data,
    isScopedAlertMode,
    pageSize,
    scopedFilteredJobs.length,
    shouldUseAlertsEndpointTable,
  ]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const tableLoading = shouldUseAlertsEndpointTable
    ? alertsPageLoading
    : isScopedAlertMode
      ? scopedJobsLoading
      : loading;
  const pageError =
    error ||
    alertsSummaryError ||
    alertsPageError ||
    alertConfigsError ||
    scopedJobsError;

  const statusOptions = useMemo(() => ["เคลม", "ซ่อม", "ตั้งเบิก", "เสร็จสิ้น"], []);

  const summaryCounts = useMemo(
    () => ({
      all: hasScopeFilter ? scopedSummary.all : alertsSummary.totalAlerts,
      warning: hasScopeFilter ? scopedSummary.warning : alertsSummary.warningCount,
      critical: hasScopeFilter ? scopedSummary.critical : alertsSummary.criticalCount,
    }),
    [
      alertsSummary.criticalCount,
      alertsSummary.totalAlerts,
      alertsSummary.warningCount,
      hasScopeFilter,
      scopedSummary.all,
      scopedSummary.critical,
      scopedSummary.warning,
    ],
  );
  const totalVehiclesCount = useMemo(() => {
    if (!shouldUseAlertsEndpointTable) return resolveTotalItems(data);
    return resolveTotalItems(totalVehiclesData);
  }, [data, shouldUseAlertsEndpointTable, totalVehiclesData]);

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="mb-6">
        <h1 className="mb-1 text-xl font-bold text-slate-800 md:text-2xl">สถานะ</h1>
        <p className="text-xs text-slate-500 md:text-sm">งานที่อยู่ในแต่ละสถานะ</p>
      </div>

      <StationsFilters
        searchTerm={searchTerm}
        selectedStatus={selectedStatus}
        selectedAlert={selectedAlert}
        summaryCounts={summaryCounts}
        totalVehiclesCount={totalVehiclesCount}
        warningDays={selectedStatusThresholds.warningDays}
        criticalDays={selectedStatusThresholds.criticalDays}
        isAllStatuses={!mappedStatus}
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
          jobs={displayedJobs}
          loading={tableLoading}
          delayDaysByJobId={delayDaysByJobId}
          agingBandByJobId={agingBandByJobId}
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
