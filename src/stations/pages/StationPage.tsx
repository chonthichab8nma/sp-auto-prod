import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import StationsFilters from "../components/StationsFilters";
import StationsTable from "../components/StationsTable";
import Pagination from "../../shared/components/ui/Pagination";

import type {
  JobsQuery,
  JobsListApiResponse,
} from "../../features/jobs/api/job.api";
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
  const [selectedStatus, setSelectedStatus] = useState("สถานะ");
  const [currentPage, setCurrentPage] = useState(1);

  const query: JobsQuery = useMemo(
    () => ({
      page: currentPage,
      pageSize,
      search: searchTerm.trim() || undefined,
      status: mapUiStatusToApi(selectedStatus),
    }),
    [currentPage, pageSize, searchTerm, selectedStatus],
  );

  const { data, error } = useDashboardQuery(query);

  const apiJobs: JobApi[] = data?.data ?? [];
  const totalPages = resolveTotalPages(data, pageSize);

  const statusOptions = useMemo(
    () => ["สถานะ", "เคลม", "ซ่อม", "ตั้งเบิก", "เสร็จสิ้น"],
    [],
  );

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">สเตชั่น</h1>
        <p className="text-slate-500 text-sm">งานที่อยู่ในแต่ละสถานะ</p>
      </div>

      <StationsFilters
        searchTerm={searchTerm}
        selectedStatus={selectedStatus}
        statusOptions={statusOptions}
        onSearchTermChange={setSearchTerm}
        onStatusChange={(v) => {
          setSelectedStatus(v);
          setCurrentPage(1);
        }}
        onSubmitSearch={() => setCurrentPage(1)}
      />

      {error && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-4">
          โหลดข้อมูลไม่สำเร็จ: {String(error)}
        </div>
      )}

      <div className="mt-4">
        <StationsTable
          station="ALL"
          jobs={apiJobs}
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
