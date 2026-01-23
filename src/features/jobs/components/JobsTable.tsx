// import { ArrowUpDown, MoreVertical } from "lucide-react";
import type { JobApi } from "../api/job.api";
import StatusBadge from "../../../shared/components/ui/StatusBadge";
import Skeleton from "../../../shared/components/ui/Skeleton";
import { formatThaiDate } from "../../../shared/lib/date";

export default function StationsTable({
  jobs,
  loading,
  onRowClick,
}: {
  jobs: JobApi[];
  loading: boolean;
  onRowClick: (id: number) => void;
}) {
  return (
    <div className="w-full bg-white overflow-hidden overflow-x-auto">
      <table className="min-w-full border-collapse min-w-[1200px]">
        <thead>
          <tr className="bg-[#F7f7f7] border-b border-slate-100">
            {[
              { label: "ทะเบียนรถ", width: "w-[120px]" },
              { label: "ชื่อ-นามสกุล", width: "w-[220px]" },
              { label: "เบอร์โทรศัพท์", width: "w-[160px]" },
              { label: "ประเภทรถ", width: "w-[220px]" },
              { label: "สถานะ", width: "w-[120px]" },
              { label: "วันที่นำรถเข้าจอดซ่อม", width: "w-[180px]" },
              { label: "วันที่นัดรับรถ", width: "w-[180px]" },
            ].map((col) => (
              <th
                key={col.label}
                className={`px-6 py-4 text-left text-[14px] font-medium text-slate-500 ${col.width}`}
              >
                <div className="flex items-center gap-1.5">
                  {col.label}
                </div>
              </th>
            ))}
            <th className="px-6 py-4 w-[60px]"></th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-50">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <tr key={`skeleton-${i}`} className="border-b border-slate-50">
                <td className="px-6 py-5"><Skeleton className="h-5 w-20" /></td>
                <td className="px-6 py-5"><Skeleton className="h-5 w-32" /></td>
                <td className="px-6 py-5"><Skeleton className="h-5 w-28" /></td>
                <td className="px-6 py-5"><Skeleton className="h-5 w-32" /></td>
                <td className="px-6 py-5">
                  <div className="flex justify-center">
                    <Skeleton className="h-7 w-20 rounded-full" />
                  </div>
                </td>
                <td className="px-6 py-5"><Skeleton className="h-5 w-24" /></td>
                <td className="px-6 py-5"><Skeleton className="h-5 w-24" /></td>
                <td className="px-6 py-5 text-right"><Skeleton className="h-5 w-4 ml-auto" /></td>
              </tr>
            ))
          ) : jobs.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-20 text-center text-slate-400">
                ไม่มีข้อมูล
              </td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr
                key={job.id}
                className="hover:bg-slate-50/50 transition-colors cursor-pointer group whitespace-nowrap"
                onClick={() => onRowClick(job.id)}
              >
                <td className="px-6 py-5 text-[14px] text-slate-700 font-medium whitespace-nowrap">
                  {job.vehicle.registration}
                </td>

                <td className="px-6 py-5 text-[14px] text-slate-600 whitespace-nowrap">
                  {job?.customer?.name || "-"}
                </td>

                <td className="px-6 py-5 text-[14px] text-slate-600 whitespace-nowrap">
                  {job?.customer?.phone || "-"}
                </td>

                <td className="px-6 py-5 text-[14px] text-slate-600 whitespace-nowrap">
                  {job.vehicle.type ||
                    `${job.vehicle.brand} ${job.vehicle.model}`}
                </td>

                <td className="px-6 py-5 text-[14px] text-slate-600 whitespace-nowrap">
                  <StatusBadge job={job} />
                </td>

                <td className="px-6 py-5 text-[14px] text-slate-600 whitespace-nowrap">
                  {formatThaiDate(job.startDate)}
                </td>

                <td className="px-6 py-5 text-[14px] text-slate-600 whitespace-nowrap">
                  {formatThaiDate(job.estimatedEndDate)}
                </td>

                <td className="px-6 py-5 text-right whitespace-nowrap">
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    {/* <MoreVertical className="h-4 w-4" /> */}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
