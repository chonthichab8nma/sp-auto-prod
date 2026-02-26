import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardFilters from "../components/DashboardFilters";
import DashboardStats from "../components/DashboardStats";
import JobsTable from "../components/JobsTable";
import Pagination from "../../../shared/components/ui/Pagination";

import type { JobStatusApi, JobsQuery } from "../api/job.api";
import { getJobByIdApi } from "../api/job.api";
import { useDashboardQuery } from "../hooks/useDashboardQuery";
import DashboardSearchInput from "../components/DashboardSearchInput";
import {
  compactWhitespace,
  mapUiStatusToApi,
  resolveTotalPages,
} from "../lib/query";
import { getEffectiveJobStatus } from "../lib/stage";

export default function Dashboard() {
  const navigate = useNavigate();
  const pageSize = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ทั้งหมด");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusOverrides, setStatusOverrides] = useState<
    Record<number, JobStatusApi>
  >({});

  // Advanced Filters State
  const [advancedFilters, setAdvancedFilters] = useState({
    jobNumber: "",
    insuranceCompanyId: undefined as number | undefined,
    brand: "",
    model: "",
    color: "",
    type: "",
    typeId: undefined as number | undefined,
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
      search: compactWhitespace(searchTerm) || undefined,
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
      typeId: advancedFilters.typeId,
      year: advancedFilters.year?.trim() || undefined,
      vehicleRegistration:
        compactWhitespace(advancedFilters.vehicleRegistration) || undefined,
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

  const items = useMemo(() => data?.data ?? [], [data]);
  const totalPages = resolveTotalPages(data, pageSize);

  useEffect(() => {
    let alive = true;

    if (!items.length) {
      setStatusOverrides((prev) => (Object.keys(prev).length ? {} : prev));
      return;
    }

    (async () => {
      const next: Record<number, JobStatusApi> = {};

      await Promise.all(
        items.map(async (job) => {
          if (job.jobStages?.length) {
            next[job.id] = getEffectiveJobStatus(job);
            return;
          }
          try {
            const detail = await getJobByIdApi(job.id);
            if (!alive) return;
            next[job.id] = getEffectiveJobStatus(detail);
          } catch {
            // keep original status if detail fetch fails
          }
        }),
      );

      if (!alive) return;
      setStatusOverrides(next);
    })();

    return () => {
      alive = false;
    };
  }, [items]);

  const counts = data?.statusCounts ?? {
    all: 0,
    CLAIM: 0,
    REPAIR: 0,
    BILLING: 0,
    DONE: 0,
  };

  const effectiveItems = useMemo(
    () =>
      items.map((job) => {
        const effectiveStatus = statusOverrides[job.id] ?? job.status;
        return { ...job, status: effectiveStatus };
      }),
    [items, statusOverrides],
  );

  const adjustedCounts = useMemo(() => {
    const next = { ...counts };
    for (const job of items) {
      const original = job.status;
      const effective = statusOverrides[job.id];
      if (!effective || effective === original) continue;

      if (original in next) {
        const key = original as keyof typeof next;
        next[key] = Math.max(0, (next[key] as number) - 1);
      }
      if (effective in next) {
        const key = effective as keyof typeof next;
        next[key] = (next[key] as number) + 1;
      }
    }
    return next;
  }, [counts, items, statusOverrides]);

  const displayItems = useMemo(() => {
    const selectedApiStatus = mapUiStatusToApi(selectedStatus);
    if (!selectedApiStatus) return effectiveItems;
    return effectiveItems.filter((job) => job.status === selectedApiStatus);
  }, [effectiveItems, selectedStatus]);

  const statsValues = {
    total: adjustedCounts.all,
    claim: adjustedCounts.CLAIM,
    repair: adjustedCounts.REPAIR,
    billing: adjustedCounts.BILLING,
    finished: adjustedCounts.DONE,
  };

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-8 flex flex-col gap-4 md:gap-6">
        <div className="md:hidden">
          <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
            <DashboardSearchInput
              value={searchTerm}
              onChange={(v) => {
                setSearchTerm(v);
              }}
              onSubmit={() => setCurrentPage(1)}
              label="ค้นหาด่วน"
              placeholder="ค้นหาทะเบียนรถ / ชื่อลูกค้า"
            />

            <button
              type="button"
              onClick={() => navigate("/create")}
              className="h-11 bg-blue-600 text-white rounded-xl text-[13px] font-semibold inline-flex items-center justify-center px-3.5 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm whitespace-nowrap"
            >
              รับรถเข้า
            </button>
          </div>
        </div>

        <DashboardFilters
          searchTerm={searchTerm}
          onSearchChange={(v) => {
            setSearchTerm(v);
          }}
          onSearchSubmit={() => setCurrentPage(1)}
          startDate={startDate}
          endDate={endDate}
          advancedFilters={advancedFilters}
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
        <div className="hidden md:flex lg:hidden gap-3 items-end">
          <div className="flex-1">
            <DashboardSearchInput
              value={searchTerm}
              onChange={(v) => {
                setSearchTerm(v);
              }}
              onSubmit={() => setCurrentPage(1)}
            />
          </div>
          <button
            type="button"
            onClick={() => navigate("/create")}
            className="h-11 bg-blue-600 text-white rounded-xl text-sm font-semibold inline-flex items-center justify-center px-5 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm whitespace-nowrap"
          >
            รับรถเข้า
          </button>
        </div>

        <JobsTable
          jobs={displayItems}
          loading={loading}
          statusOverrides={statusOverrides}
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
