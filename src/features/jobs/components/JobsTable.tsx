import type { JobApi } from "../api/job.api";
import StatusBadge from "../../../shared/components/ui/StatusBadge";
import Skeleton from "../../../shared/components/ui/Skeleton";
import { formatThaiDate } from "../../../shared/lib/date";

const columns = [
  { key: "reg", label: "ทะเบียนรถ", width: 140, align: "left" },
  { key: "name", label: "ชื่อ-นามสกุล", width: 220, align: "left" },
  { key: "phone", label: "เบอร์โทรศัพท์", width: 160, align: "left" },
  { key: "brandModel", label: "ยี่ห้อ/รุ่น (ประเภท)", width: 240, align: "left" },
  { key: "status", label: "สถานะ", width: 120, align: "center" },
  { key: "start", label: "วันที่นำรถเข้าจอดซ่อม", width: 180, align: "left" },
  { key: "end", label: "วันที่นัดรับรถ", width: 250, align: "left" },
  // { key: "actions", label: "", width: 56, align: "right" },
] as const;

const tableWidth = columns.reduce((sum, c) => sum + c.width, 0);

const alignClass = (a: string) =>
  a === "center" ? "text-center" : a === "right" ? "text-right" : "text-left";

function SkeletonCell({ colKey }: { colKey: (typeof columns)[number]["key"] }) {

  // if (colKey === "actions") {
  //   return (
  //     <div className="flex justify-end">
  //       <Skeleton className="h-5 w-5 rounded" />
  //     </div>
  //   );
  // }

  if (colKey === "status") {
    return (
      <div className="flex justify-center">
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
    );
  }

  if (colKey === "brandModel") {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  // default
  return <Skeleton className="h-5 w-36" />;
}

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
            jobs.map((job) => (
              <tr
                key={job.id}
                className="h-15 hover:bg-slate-50/50 transition-colors cursor-pointer"
                onClick={() => onRowClick(job.id)}
              >
                <td className="box-border px-6 py-4 font-medium text-slate-700">
                  {job.vehicle.registration}
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
                  <div className="flex flex-col leading-tight">
                    {/* <span className="truncate" title={`${job.vehicle.brand} ${job.vehicle.model}`}>
                      {job.vehicle.brand} {job.vehicle.model}
                    </span> */}
                    <span className="truncate" title={`${job.vehicle.brand} ${job.vehicle.model}`}>
                      {job.vehicle.brand} {job.vehicle.model}
                    </span>
                    <span className="text-[12px] text-slate-400 truncate">
                      {job.vehicle.type || "-"}
                    </span>
                  </div>
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

                <td className="box-border px-6 py-4 text-right">
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

