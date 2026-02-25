import { Loader2, Pencil } from "lucide-react";
import { SectionWrapper } from "./ManageShared";
import type { AlertConfigItem } from "../../services/superadmin.service";

const statusLabel: Record<AlertConfigItem["status"], string> = {
  CLAIM: "เคลม",
  REPAIR: "ซ่อม",
  BILLING: "วางบิล",
  DONE: "งานเสร็จ",
};

function formatBangkokDateTime(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Bangkok",
  }).format(d);
}

export function AlertConfigsSection({
  configs,
  editingAlertConfigId,
  onEdit,
}: {
  configs: AlertConfigItem[];
  editingAlertConfigId: number | null;
  onEdit: (item: AlertConfigItem) => void;
}) {
  return (
    <SectionWrapper
      title="ตั้งค่าระยะเวลาการแจ้งเตือน"
      description=""
    >
      <div className="mt-5 space-y-3 md:hidden">
        {configs.map((item) => {
          const isDone = item.status === "DONE";
          const disabled = isDone || editingAlertConfigId === item.id;

          return (
            <div key={item.status} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-500">สถานะ</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {statusLabel[item.status]}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  disabled={disabled}
                  aria-label={`แก้ไขสถานะ ${statusLabel[item.status]}`}
                  title="แก้ไข"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editingAlertConfigId === item.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Pencil className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500">วันเริ่มเตือน</div>
                  <div className="font-medium text-slate-800">{item.warningDays}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">เกินกำหนด</div>
                  <div className="font-medium text-slate-800">{item.criticalDays}</div>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-500">
                อัปเดตล่าสุด: {formatBangkokDateTime(item.updatedAt)}
              </div>
              {isDone ? (
                <div className="mt-2 text-xs font-medium text-emerald-700">
                  ไม่ต้องแจ้งเตือน
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full overflow-hidden rounded-xl border border-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-3 py-2 text-left font-medium">สถานะ</th>
              <th className="px-3 py-2 text-left font-medium">วันเริ่มเตือน</th>
              <th className="px-3 py-2 text-left font-medium">เกินกำหนด</th>
              <th className="px-3 py-2 text-left font-medium">อัปเดตล่าสุด</th>
              <th className="px-3 py-2 text-right font-medium">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {configs.map((item) => {
              const isDone = item.status === "DONE";
              const disabled = isDone || editingAlertConfigId === item.id;

              return (
                <tr key={item.status} className="border-t border-slate-200 bg-white">
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {statusLabel[item.status]}
                  </td>
                  <td className="px-3 py-2">{item.warningDays}</td>
                  <td className="px-3 py-2">{item.criticalDays}</td>
                  <td className="px-3 py-2">{formatBangkokDateTime(item.updatedAt)}</td>
                  <td className="px-3 py-2 text-right">
                    {isDone ? (
                      <span className="text-xs font-medium text-emerald-700">
                        ไม่ต้องแจ้งเตือน
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      disabled={disabled}
                      aria-label={`แก้ไขสถานะ ${statusLabel[item.status]}`}
                      title="แก้ไข"
                      className="ml-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {editingAlertConfigId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Pencil className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}

            {configs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                  ยังไม่มีข้อมูล SLA
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
