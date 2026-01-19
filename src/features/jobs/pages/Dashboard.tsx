import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Job } from "../../../Type";

import DashboardFilters from "../components/DashboardFilters";
import DashboardStats from "../components/DashboardStats";
import JobsTable from "../components/JobsTable";
import Pagination from "../../../shared/components/ui/Pagination";

import type { JobStatusFilter, JobsQuery } from "../api/job.api";
import { useDashboardQuery } from "../hooks/useDashboardQuery";

export default function Dashboard({ jobs }: { jobs: Job[] }) {
  const navigate = useNavigate();
  const pageSize = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCarType, setSelectedCarType] = useState("ทั้งหมด");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<JobStatusFilter>("ทั้งหมด");
  const [currentPage, setCurrentPage] = useState(1);

  const query: JobsQuery = useMemo(
    () => ({
      search: searchTerm,
      carType: selectedCarType,
      from: startDate,
      to: endDate,
      status: selectedStatus,
      page: currentPage,
      pageSize,
    }),
    [
      searchTerm,
      selectedCarType,
      startDate,
      endDate,
      selectedStatus,
      currentPage,
    ]
  );

  const { data, loading, error } = useDashboardQuery(jobs, query);

  const totalPages = Math.ceil((data?.totalItems ?? 0) / pageSize);

  const handleSearchAction = () => {
    setCurrentPage(1);
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 px-8 py-6">
        <h1 className="text-[22px] font-semibold text-slate-800">แดชบอร์ด</h1>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col gap-10">
        <DashboardFilters
          searchTerm={searchTerm}
          selectedCarType={selectedCarType}
          startDate={startDate}
          endDate={endDate}
          onSearchTermChange={setSearchTerm}
          onCarTypeChange={(v) => {
            setSelectedCarType(v);
            setCurrentPage(1);
          }}
          onStartDateChange={(v) => {
            setStartDate(v);
            setCurrentPage(1);
          }}
          onEndDateChange={(v) => {
            setEndDate(v);
            setCurrentPage(1);
          }}
          onSubmitSearch={handleSearchAction}
        />

        <DashboardStats
          selectedStatus={selectedStatus}
          onSelectStatus={(s) => {
            setSelectedStatus(s as JobStatusFilter);
            setCurrentPage(1);
          }}
          values={{
            total: data?.summary.total ?? 0,
            claim: data?.summary.claim ?? 0,
            repair: data?.summary.repair ?? 0,
            billing: data?.summary.billing ?? 0,
            finished: data?.summary.finished ?? 0,
          }}
        />

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-4">
            โหลดข้อมูลไม่สำเร็จ: {error}
          </div>
        )}

        <div>
          <h2 className="text-[17px] font-semibold text-slate-800 mb-5">
            รายการรถในอู่
          </h2>

          <JobsTable
            jobs={data?.items ?? []}
            onRowClick={(id) => navigate(`/job/${id}`)}
          />

          {loading && (
            <div className="text-sm text-slate-400 mt-3">
              กำลังโหลดข้อมูล...
            </div>
          )}
        </div>
        <div className="pt-6 border-t border-slate-100">
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
      </section>
    </div>
  );
}
