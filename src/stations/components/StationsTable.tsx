import type { JobApi } from "../../features/jobs/api/job.api";
import StatusBadge from "../../shared/components/ui/StatusBadge";
import Skeleton from "../../shared/components/ui/Skeleton";
import { formatThaiDate } from "../../shared/lib/date";
import { resolveAgingBand } from "../utils/aging";

const columns = [
  { key: "reg", label: "ทะเบียนรถ", width: 190, align: "left" },
  { key: "name", label: "ชื่อ-นามสกุล", width: 220, align: "left" },
  { key: "phone", label: "เบอร์โทรศัพท์", width: 160, align: "left" },
  { key: "brandModel", label: "ยี่ห้อ/รุ่น", width: 220, align: "left" },
  { key: "status", label: "สถานะ", width: 120, align: "center" },
  { key: "start", label: "วันที่นำรถเข้าซ่อม", width: 170, align: "left" },
  { key: "end", label: "วันที่นัดรับรถ", width: 170, align: "left" },
] as const;

const tableWidth = columns.reduce((sum, c) => sum + c.width, 0);

const alignClass = (a: string) =>
  a === "center" ? "text-center" : a === "right" ? "text-right" : "text-left";

function SkeletonCell({ colKey }: { colKey: (typeof columns)[number]["key"] }) {
  if (colKey === "status") {
    return (
      <div className="flex justify-center">
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
    );
  }

  if (colKey === "reg") {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
    );
  }

  return <Skeleton className="h-5 w-32" />;
}

export default function StationsTable({
  jobs,
  loading,
  delayDaysByJobId,
  onRowClick,
}: {
  jobs: JobApi[];
  loading: boolean;
  delayDaysByJobId: Record<number, number>;
  onRowClick: (id: number) => void;
}) {
  return (
    <div className="w-full bg-white overflow-x-auto">
      <table
        className="inline-table table-fixed border-collapse"
        style={{ width: tableWidth }}
      >
        <colgroup>
          {columns.map((c) => (
            <col key={c.key} style={{ width: c.width }} />
          ))}
        </colgroup>

        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`box-border px-6 py-4 text-[13px] font-medium text-slate-500 whitespace-nowrap ${alignClass(
                  c.align,
                )}`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <tr key={`sk-${i}`} className="h-15">
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`box-border px-6 py-4 ${alignClass(c.align)}`}
                  >
                    <SkeletonCell colKey={c.key} />
                  </td>
                ))}
              </tr>
            ))
          ) : jobs.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-20 text-center text-slate-400"
              >
                ไม่มีข้อมูล
              </td>
            </tr>
          ) : (
            jobs.map((job) => {
              const delayDays = delayDaysByJobId[job.id];
              const delayBand =
                typeof delayDays === "number"
                  ? resolveAgingBand(delayDays)
                  : "normal";
              const hasAlert = delayBand !== "normal";
              const rowClass =
                delayBand === "critical"
                  ? "bg-red-50 hover:bg-red-100/70"
                  : delayBand === "warning"
                    ? "bg-amber-50 hover:bg-amber-100/70"
                    : "hover:bg-slate-50/50";
              const delayTextClass =
                delayBand === "critical" ? "text-red-700" : "text-amber-700";

              return (
                <tr
                  key={job.id}
                  className={`h-15 transition-colors cursor-pointer ${rowClass}`}
                  onClick={() => onRowClick(job.id)}
                >
                  <td className="box-border px-6 py-4">
                    <div className="font-medium text-slate-700">
                      {job.vehicle.registration}
                    </div>
                    {hasAlert ? (
                      <div className={`mt-1 text-xs font-medium ${delayTextClass}`}>
                        ล่าช้า {delayDays} วัน
                      </div>
                    ) : null}
                  </td>

                  <td
                    className="box-border px-6 py-4 text-slate-600 truncate"
                    title={job.customer?.name || "-"}
                  >
                    {job.customer?.name || "-"}
                  </td>

                  <td className="box-border px-6 py-4 text-slate-600">
                    {job.customer?.phone || "-"}
                  </td>

                  <td className="box-border px-6 py-4 text-slate-600">
                    <span className="truncate" title={`${job.vehicle.brand} ${job.vehicle.model}`}>
                      {job.vehicle.brand} {job.vehicle.model}
                    </span>
                  </td>

                  <td className="box-border px-6 py-4 text-center">
                    <StatusBadge job={job} />
                  </td>

                  <td className="box-border px-6 py-4 text-slate-600 whitespace-nowrap">
                    {formatThaiDate(job.startDate)}
                  </td>

                  <td className="box-border px-6 py-4 text-slate-600 whitespace-nowrap">
                    {formatThaiDate(job.estimatedEndDate)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
