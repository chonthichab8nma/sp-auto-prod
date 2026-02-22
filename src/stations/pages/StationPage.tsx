import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import StationsFilters from "../components/StationsFilters";
import type { AlertFilterValue } from "../components/StationsFilters";
import StationsTable from "../components/StationsTable";
import { useStationAlertsQuery } from "../hooks/useStationAlertsQuery";
import { resolveAgingBand } from "../utils/aging";

import Pagination from "../../shared/components/ui/Pagination";

import type { JobsQuery } from "../../features/jobs/api/job.api";
import { useDashboardQuery } from "../../features/jobs/hooks/useDashboardQuery";
import type { JobApi } from "../../features/jobs/api/job.api";
import {
  mapUiStatusToApi,
  resolveTotalItems,
  resolveTotalPages,
} from "../../features/jobs/lib/query";

export default function StationsPage() {
  const navigate = useNavigate();
  const pageSize = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<AlertFilterValue>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const normalizedSearch = searchTerm.trim();
  const mappedStatus = mapUiStatusToApi(selectedStatus);
  const hasScopeFilter = Boolean(selectedStatus || normalizedSearch);
  const shouldUseAlertsEndpointTable =
    selectedAlert !== "all" && !hasScopeFilter;

  const query: JobsQuery = useMemo(
    () => ({
      page: currentPage,
      pageSize,
      search: normalizedSearch || undefined,
      status: mappedStatus,
    }),
    [currentPage, mappedStatus, normalizedSearch, pageSize],
  );

  const { data, error, loading } = useDashboardQuery(query, {
    enabled: !shouldUseAlertsEndpointTable,
  });
  const {
    summary: alertsSummary,
    error: alertsSummaryError,
  } = useStationAlertsQuery({ threshold: "all", page: 1, limit: 1 });
  const {
    data: alertsPageData,
    totalPages: alertsPageTotalPages,
    error: alertsPageError,
    loading: alertsPageLoading,
  } = useStationAlertsQuery(
    {
      threshold: selectedAlert,
      page: currentPage,
      limit: pageSize,
    },
    { enabled: shouldUseAlertsEndpointTable },
  );

  const apiJobs: JobApi[] = data?.data ?? [];
  const delayDaysByJobId = useMemo(() => {
    const map: Record<number, number> = {};
    const source = shouldUseAlertsEndpointTable ? alertsPageData : apiJobs;
    for (const row of source) {
      if (typeof row.daysInProcess === "number") {
        map[row.id] = row.daysInProcess;
      }
    }
    return map;
  }, [alertsPageData, apiJobs, shouldUseAlertsEndpointTable]);
  const agingBandByJobId = useMemo(() => {
    const map: Record<number, "normal" | "warning" | "critical"> = {};
    const source = shouldUseAlertsEndpointTable ? alertsPageData : apiJobs;
    for (const row of source) {
      if (row.agingStatus === "normal" || row.agingStatus === "warning" || row.agingStatus === "critical") {
        map[row.id] = row.agingStatus;
      } else if (typeof row.daysInProcess === "number") {
        map[row.id] = resolveAgingBand(row.daysInProcess);
      }
    }
    return map;
  }, [alertsPageData, apiJobs, shouldUseAlertsEndpointTable]);

  const filteredAlertJobs = useMemo(() => {
    if (selectedAlert === "all") return apiJobs;

    return apiJobs.filter((job) => {
      const days = job.daysInProcess;
      if (typeof days !== "number") return false;
      return resolveAgingBand(days) === selectedAlert;
    });
  }, [apiJobs, selectedAlert]);

  const displayedJobs = shouldUseAlertsEndpointTable
    ? alertsPageData
    : filteredAlertJobs;

  const totalPages = useMemo(() => {
    if (shouldUseAlertsEndpointTable) {
      return Math.max(1, alertsPageTotalPages || 1);
    }
    return resolveTotalPages(data, pageSize);
  }, [alertsPageTotalPages, data, pageSize, shouldUseAlertsEndpointTable]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const tableLoading = shouldUseAlertsEndpointTable ? alertsPageLoading : loading;
  const pageError = error || alertsSummaryError || alertsPageError;

  const statusOptions = useMemo(() => ["เคลม", "ซ่อม", "ตั้งเบิก", "เสร็จสิ้น"], []);

  const summaryCounts = useMemo(
    () => ({
      all: hasScopeFilter ? resolveTotalItems(data) : alertsSummary.totalAlerts,
      warning: alertsSummary.warningCount,
      critical: alertsSummary.criticalCount,
    }),
    [alertsSummary.criticalCount, alertsSummary.totalAlerts, alertsSummary.warningCount, data, hasScopeFilter],
  );

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
