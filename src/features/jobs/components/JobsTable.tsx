import { ArrowUpDown, MoreVertical } from "lucide-react";
import type { JobApi } from "../api/job.api";
import StatusBadge from "../../../shared/components/ui/StatusBadge";

export default function StationsTable({
  jobs,
  onRowClick,
}: {
  jobs: JobApi[];
  onRowClick: (id: number) => void;
}) {
  return (
    <div className="w-full bg-white overflow-hidden">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-[#F7f7f7] border-b border-slate-100">
            {[
              "ทะเบียนรถ",
              "ชื่อ-นามสกุล",
              "เบอร์โทรศัพท์",
              "ประเภทรถ",
              "สถานะ",
              "วันที่นำรถเข้าจอดซ่อม",
              "วันที่นัดรับรถ",
            ].map((head, idx) => (
              <th
                key={head}
                className="px-2 text-left text-[14px] font-medium text-slate-500"
              >
                <div className="flex items-center gap-1.5">
                  {head}
                  {(idx === 1 || idx === 5 || idx === 6) && (
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </div>
              </th>
            ))}
            <th className="px-6 py-4"></th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-50">
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-20 text-center text-slate-400">
                ไม่มีรายการรถในระบบ
              </td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr
                key={job.id}
                className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                onClick={() => onRowClick(job.id)}
              >
                <td className="px-6 py-5 text-[14px] text-slate-700 font-medium">
                  {job.vehicle.registration}
                </td>

                <td className="px-6 py-5 text-[14px] text-slate-600">
                  {job?.customer?.name || "-"}
                </td>

                <td className="px-6 py-5 text-[14px] text-slate-600">
                  {job?.customer?.phone || "-"}
                </td>

                <td className="px-6 py-5 text-[14px] text-slate-600">
                  {job.vehicle.type ||
                    `${job.vehicle.brand} ${job.vehicle.model}`}
                </td>

                <td className="px-6 py-5 text-[14px] text-slate-600">
                  <StatusBadge job={job} />
                </td>

                <td className="px-6 py-5 text-[14px] text-slate-600">
                  {job.startDate
                    ? new Date(job.startDate).toLocaleDateString("en-GB")
                    : "-"}
                </td>

                <td className="px-6 py-5 text-[14px] text-slate-600">
                  {job.estimatedEndDate
                    ? new Date(job.estimatedEndDate).toLocaleDateString("en-GB")
                    : "-"}
                </td>

                <td className="px-6 py-5 text-right">
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <MoreVertical className="h-4 w-4" />
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
