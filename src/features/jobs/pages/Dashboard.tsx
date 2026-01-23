import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardFilters from "../components/DashboardFilters";
import DashboardStats from "../components/DashboardStats";
import JobsTable from "../components/JobsTable";
import Pagination from "../../../shared/components/ui/Pagination";

import type { JobsQuery, JobsListApiResponse } from "../api/job.api";
import { useDashboardQuery } from "../hooks/useDashboardQuery";

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
      return undefined; // "ทั้งหมด"
  }
}


export default function Dashboard() {
  const navigate = useNavigate();
  const pageSize = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCarType, setSelectedCarType] = useState("ทั้งหมด");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ทั้งหมด");
  const [currentPage, setCurrentPage] = useState(1);

  // Advanced Filters State
  const [advancedFilters, setAdvancedFilters] = useState({
    jobNumber: "",
    insuranceCompanyId: undefined as number | undefined,
    brand: "",
    model: "",
    color: "",
    type: "",
    year: "",
    vehicleRegistration: "",
    chassisNumber: "",
    vinNumber: "",
    customerName: "",
  });

  const query: JobsQuery = useMemo(
    () => ({
      page: currentPage,
      pageSize,
      search: searchTerm.trim() || undefined,
      status: mapUiStatusToApi(selectedStatus),
      startDateFrom: startDate || undefined,
      startDateTo: endDate || undefined,
      // Advanced Filters
      jobNumber: advancedFilters.jobNumber?.trim() || undefined,
      insuranceCompanyId: advancedFilters.insuranceCompanyId,
      brand: advancedFilters.brand?.trim() || undefined,
      model: advancedFilters.model?.trim() || undefined,
      color: advancedFilters.color?.trim() || undefined,
      type: advancedFilters.type?.trim() || undefined,
      year: advancedFilters.year?.trim() || undefined,
      vehicleRegistration: advancedFilters.vehicleRegistration?.trim() || undefined,
      chassisNumber: advancedFilters.chassisNumber?.trim() || undefined,
      vinNumber: advancedFilters.vinNumber?.trim() || undefined,
      customerName: advancedFilters.customerName?.trim() || undefined,
    }),
    [
      currentPage,
      pageSize,
      searchTerm,
      selectedStatus,
      startDate,
      endDate,
      advancedFilters,
    ],
  );

  const { data, loading, error } = useDashboardQuery(query);


  const items = data?.data ?? [];
  const totalPages = resolveTotalPages(data, pageSize);

  const counts = data?.statusCounts ?? {
    all: 0,
    CLAIM: 0,
    REPAIR: 0,
    BILLING: 0,
    DONE: 0,
  };

  const statsValues = {
    total: counts.all,
    claim: counts.CLAIM,
    repair: counts.REPAIR,
    billing: counts.BILLING,
    finished: counts.DONE,
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white p-8 rounded-xl flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col gap-10">
        <DashboardFilters
          searchTerm={searchTerm}
          selectedCarType={selectedCarType}
          startDate={startDate}
          endDate={endDate}
          advancedFilters={advancedFilters}
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
          onAdvancedFilterChange={(key, value) => {
            setAdvancedFilters((prev) => ({ ...prev, [key]: value }));
            setCurrentPage(1);
          }}
          onSubmitSearch={() => setCurrentPage(1)}
        />
        <DashboardStats
          selectedStatus={selectedStatus}
          onSelectStatus={(s) => {
            setSelectedStatus(s);
            setCurrentPage(1);
          }}
          values={statsValues}
        />



        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-4">
            โหลดข้อมูลไม่สำเร็จ: {String(error)}
          </div>
        )}

        <JobsTable
          jobs={items}
          loading={loading}
          onRowClick={(id) => navigate(`/job/${id}`)}
        />

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
