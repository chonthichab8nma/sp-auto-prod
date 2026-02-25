import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { JobApi } from "../../features/jobs/api/job.api";
import type { JobAlertApi } from "../api/jobAlerts.api";
import StatusBadge from "../../shared/components/ui/StatusBadge";
import Skeleton from "../../shared/components/ui/Skeleton";
import { formatThaiDate } from "../../shared/lib/date";
import { resolveAgingBand } from "../utils/aging";

const columns = [
  { key: "reg", label: "ทะเบียนรถ", width: 220, align: "left" },
  { key: "brandModel", label: "ยี่ห้อ/รุ่น", width: 240, align: "left" },
  { key: "status", label: "สถานะ", width: 120, align: "center" },
  { key: "start", label: "วันที่นำรถเข้าซ่อม", width: 170, align: "left" },
  { key: "end", label: "วันที่นัดรับรถ", width: 170, align: "left" },
  { key: "name", label: "ชื่อลูกค้า", width: 220, align: "left" },
  { key: "phone", label: "เบอร์โทรศัพท์", width: 170, align: "left" },
] as const;

const tableWidth = columns.reduce((sum, c) => sum + c.width, 0);
const columnPercents = columns.map((c) => (c.width / tableWidth) * 100);

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
  agingBandByJobId,
  onRowClick,
}: {
  jobs: Array<JobApi | JobAlertApi>;
  loading: boolean;
  delayDaysByJobId: Record<number, number>;
  agingBandByJobId?: Record<number, "normal" | "warning" | "critical">;
  onRowClick: (id: number) => void;
}) {
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);

  const renderMobileCards = () => {
    if (loading) {
      return (
        <div className="space-y-3 md:hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={`mobile-sk-${i}`}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <Skeleton className="h-5 w-36" />
              <Skeleton className="mt-3 h-4 w-24" />
              <Skeleton className="mt-2 h-4 w-32" />
              <Skeleton className="mt-2 h-4 w-40" />
            </div>
          ))}
        </div>
      );
    }

    if (jobs.length === 0) {
      return (
        <div className="px-4 py-12 text-center text-slate-400 md:hidden">
          ไม่มีข้อมูล
        </div>
      );
    }

    return (
      <div className="space-y-3 md:hidden">
        {jobs.map((job) => {
          const delayDays =
            delayDaysByJobId[job.id] ?? job.daysInProcess;
          const delayBand =
            agingBandByJobId?.[job.id] ??
            (typeof delayDays === "number" ? resolveAgingBand(delayDays) : "normal");
          const hasAlert = delayBand !== "normal";
          const isExpanded = expandedJobId === job.id;
          const repairDescription = job.repairDescription?.trim() || "";
          const notes = job.notes?.trim() || "";
          const cardClass =
            delayBand === "critical"
              ? "bg-rose-50/60 border-slate-200"
              : delayBand === "warning"
                ? "bg-amber-50/55 border-slate-200"
                : "bg-white border-slate-200";
          const delayTextClass =
            delayBand === "critical" ? "text-red-700" : "text-amber-700";

          return (
            <div
              key={job.id}
              onClick={() => onRowClick(job.id)}
              className={`w-full rounded-2xl border p-4 text-left shadow-sm transition ${cardClass}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-500">ทะเบียนรถ</div>
                  <div className="truncate text-[15px] font-bold text-slate-800">
                    {job.vehicle.registration}
                  </div>
                  {hasAlert ? (
                    <div className={`mt-1 text-xs font-semibold ${delayTextClass}`}>
                      ล่าช้า {delayDays} วัน
                    </div>
                  ) : null}
                </div>
                <StatusBadge job={job} forceWhiteBackground={hasAlert} />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedJobId((prev) => (prev === job.id ? null : job.id));
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-200"
                >
                  {isExpanded ? "ซ่อนข้อมูล" : "แสดงรายละเอียด"}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
                  />
                </button>
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${isExpanded ? "mt-3 max-h-[520px] opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[13px]">
                  <div>
                    <div className="text-xs font-medium text-slate-500">ชื่อลูกค้า</div>
                    <div className="truncate font-medium text-slate-700">
                      {job.customer?.name || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">ยี่ห้อ/รุ่น</div>
                    <div className="truncate font-medium text-slate-700">
                      {job.vehicle.brand || "-"} {job.vehicle.model || "-"}
                    </div>
                  </div>
                </div>

                {repairDescription || notes ? (
                  <div className="mt-3 space-y-2">
                    {repairDescription ? (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                        <div className="text-[11px] font-medium text-slate-600">รายละเอียดการซ่อม</div>
                        <div className="mt-1 text-[13px] text-slate-700 break-words overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                          {repairDescription}
                        </div>
                      </div>
                    ) : null}
                    {notes ? (
                      <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-2.5">
                        <div className="text-[11px] font-medium text-blue-700/80">หมายเหตุ</div>
                        <div className="mt-1 text-[13px] text-slate-700 break-words overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                          {notes}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3">
                  <div>
                    <div className="text-xs font-medium text-slate-500">วันที่นำรถเข้าซ่อม</div>
                    <div className="text-[13px] font-medium text-slate-700">
                      {formatThaiDate(job.startDate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">วันที่นัดรับรถ</div>
                    <div className="text-[13px] font-medium text-slate-700">
                      {formatThaiDate(job.estimatedEndDate)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full bg-white">
      {renderMobileCards()}

      <div className="hidden overflow-x-auto md:block">
        <table
          className="w-full table-fixed border-collapse"
          style={{ minWidth: tableWidth }}
        >
          <colgroup>
            {columns.map((c, idx) => (
              <col key={c.key} style={{ width: `${columnPercents[idx]}%` }} />
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
                const delayDays =
                  delayDaysByJobId[job.id] ?? job.daysInProcess;
                const delayBand =
                  agingBandByJobId?.[job.id] ??
                  (typeof delayDays === "number"
                    ? resolveAgingBand(delayDays)
                    : "normal");
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
                      <div className="text-[16px] font-semibold leading-tight text-slate-800">
                        {job.vehicle.registration}
                      </div>
                      {hasAlert ? (
                        <div className={`mt-1 text-xs font-medium ${delayTextClass}`}>
                          ล่าช้า {delayDays} วัน
                        </div>
                      ) : null}
                    </td>

                    <td className="box-border px-6 py-4 text-slate-600">
                      <span
                        className="truncate"
                        title={`${job.vehicle.brand} ${job.vehicle.model}`}
                      >
                        {job.vehicle.brand} {job.vehicle.model}
                      </span>
                    </td>

                    <td className="box-border px-6 py-4 text-center">
                      <StatusBadge job={job} forceWhiteBackground={hasAlert} />
                    </td>

                    <td className="box-border px-6 py-4 text-slate-600 whitespace-nowrap">
                      {formatThaiDate(job.startDate)}
                    </td>

                    <td className="box-border px-6 py-4 text-slate-600 whitespace-nowrap">
                      {formatThaiDate(job.estimatedEndDate)}
                    </td>

                    <td
                      className="box-border px-6 py-4 text-slate-600 truncate"
                      title={job.customer?.name || "-"}
                    >
                      {job.customer?.name || "-"}
                    </td>

                    <td className="box-border px-6 py-4 text-slate-600 whitespace-nowrap">
                      {job.customer?.phone || "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
