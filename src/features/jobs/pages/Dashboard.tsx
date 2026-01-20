// import { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import DashboardFilters from "../components/DashboardFilters";
// import DashboardStats from "../components/DashboardStats";
// import JobsTable from "../components/JobsTable";
// import Pagination from "../../../shared/components/ui/Pagination";

// import type { JobsQuery, JobStatusFilter } from "../api/job.api";
// import { useDashboardQuery } from "../hooks/useDashboardQuery";

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const pageSize = 10;

//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCarType, setSelectedCarType] = useState("ทั้งหมด");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [selectedStatus, setSelectedStatus] =
//     useState<JobStatusFilter>("ทั้งหมด");
//   const [currentPage, setCurrentPage] = useState(1);

//   const query: JobsQuery = useMemo(
//     () => ({
//       search: searchTerm,
//       carType: selectedCarType,
//       from: startDate,
//       to: endDate,
//       status: selectedStatus,
//       page: currentPage,
//       pageSize,
//     }),
//     [
//       searchTerm,
//       selectedCarType,
//       startDate,
//       endDate,
//       selectedStatus,
//       currentPage,
//       pageSize,
//     ],
//   );

//   const { data, error } = useDashboardQuery(query);

//   const totalPages = Math.ceil((data?.totalItems ?? 0) / pageSize);

//   const handleSearchAction = () => {
//     setCurrentPage(1);
//     if (document.activeElement instanceof HTMLElement) {
//       document.activeElement.blur();
//     }
//   };

//   return (
//     <div className="flex flex-col gap-5">
//       <section className="bg-white rounded-xl shadow-sm border border-gray-100 px-8 py-6">
//         <h1 className="text-[22px] font-semibold text-slate-800">แดชบอร์ด</h1>
//       </section>

//       <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col gap-10">
//         <DashboardStats
//           selectedStatus={selectedStatus}
//           onSelectStatus={(s) => {
//             setSelectedStatus(s as JobStatusFilter);
//             setCurrentPage(1);
//           }}
//           values={{
//             total: data?.summary.total ?? 0,
//             claim: data?.summary.claim ?? 0,
//             repair: data?.summary.repair ?? 0,
//             billing: data?.summary.billing ?? 0,
//             finished: data?.summary.finished ?? 0,
//           }}
//         />
//         <DashboardFilters
//           searchTerm={searchTerm}
//           selectedCarType={selectedCarType}
//           startDate={startDate}
//           endDate={endDate}
//           onSearchTermChange={setSearchTerm}
//           onCarTypeChange={(v) => {
//             setSelectedCarType(v);
//             setCurrentPage(1);
//           }}
//           onStartDateChange={(v) => {
//             setStartDate(v);
//             setCurrentPage(1);
//           }}
//           onEndDateChange={(v) => {
//             setEndDate(v);
//             setCurrentPage(1);
//           }}
//           onSubmitSearch={handleSearchAction}
//         />

//         {error && (
//           <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-4">
//             โหลดข้อมูลไม่สำเร็จ: {error}
//           </div>
//         )}

//         <div>
//           {/* <h2 className="text-[17px] font-semibold text-slate-800 mb-5">
//             รายการรถในอู่
//           </h2> */}

//           <JobsTable
//             jobs={data?.items ?? []}
//             onRowClick={(id) => navigate(`/job/${id}`)}
//           />

//           {/* {loading && (
//             <div className="text-sm text-slate-400 mt-3">กำลังโหลดข้อมูล...</div>
//           )} */}
//         </div>

//         <div className="pt-6 border-t border-slate-100">
//           <Pagination
//             currentPage={currentPage}
//             totalPages={totalPages}
//             onGoTo={(p) => setCurrentPage(p)}
//             onFirst={() => setCurrentPage(1)}
//             onPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             onNext={() =>
//               setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//             }
//             onLast={() => setCurrentPage(totalPages)}
//           />
//         </div>
//       </section>
//     </div>
//   );
// }

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardFilters from "../components/DashboardFilters";
import DashboardStats from "../components/DashboardStats";
import JobsTable from "../components/JobsTable";
import Pagination from "../../../shared/components/ui/Pagination";

import type { JobsQuery, JobsListApiResponse } from "../api/job.api";
import { useDashboardQuery } from "../hooks/useDashboardQuery";


function resolveTotalPages(res: JobsListApiResponse | null, pageSize: number): number {
  if (!res) return 1;

  if ("meta" in res) {
 
    const { totalItems, totalPages } = res.meta;
    if (typeof totalPages === "number") return Math.max(1, totalPages);
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }

  return Math.max(1, res.totalPages);
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

  // ✅ query เหลือแค่ pagination
  const query: JobsQuery = useMemo(
    () => ({
      page: currentPage,
      pageSize,
    }),
    [currentPage]
  );

  const { data, error } = useDashboardQuery(query);

  const items = data?.data ?? [];
  const totalPages = resolveTotalPages(data, pageSize);

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white p-8 rounded-xl flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col gap-10">
        {/* ✅ ตอนนี้ไม่มี summary จาก backend → ส่ง 0 ไปก่อน */}
        <DashboardStats
          selectedStatus={selectedStatus}
          onSelectStatus={(s) => {
            setSelectedStatus(s);
            setCurrentPage(1);
          }}
          values={{ total: 0, claim: 0, repair: 0, billing: 0, finished: 0 }}
        />

        {/* ✅ Filters ยังใช้เป็น UI ได้ แต่ไม่ได้ส่งไป backend */}
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
          onSubmitSearch={() => setCurrentPage(1)}
        />

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-4">
            โหลดข้อมูลไม่สำเร็จ: {error}
          </div>
        )}

        {/* ✅ ส่งข้อมูลดิบจาก backend ให้ตาราง */}
        <JobsTable
          jobs={items}
          onRowClick={(id) => navigate(`/job/${id}`)}
        />

        <div className="pt-6 border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onGoTo={(p) => setCurrentPage(p)}
            onFirst={() => setCurrentPage(1)}
            onPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            onLast={() => setCurrentPage(totalPages)}
          />
        </div>
      </section>
    </div>
  );
}
