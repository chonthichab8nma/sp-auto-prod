import { Trophy } from "lucide-react";
import type { TopInsuranceResponse } from "../api/dashboard.api";

const fmtBaht = (n: number) =>
  `฿${n.toLocaleString("th-TH", { minimumFractionDigits: 0 })}`;

const MONTH_NAMES_TH = [
  "",
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export default function TopInsuranceWidget({
  data,
}: {
  data: TopInsuranceResponse | null;
}) {
  if (!data || data.data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={18} className="text-amber-500" />
        <h3 className="text-base font-bold text-slate-900">
          Top ประกันภัยเดือนนี้
        </h3>
        <span className="text-xs text-slate-400 ml-auto">
          {MONTH_NAMES_TH[data.month]} {data.year}
        </span>
      </div>

      <div className="space-y-3">
        {data.data.map((item, idx) => (
          <div
            key={item.insuranceCompanyId}
            className="flex items-center gap-3"
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                idx === 0
                  ? "bg-amber-100 text-amber-700"
                  : idx === 1
                    ? "bg-slate-100 text-slate-600"
                    : "bg-slate-50 text-slate-500"
              }`}
            >
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-800 truncate">
                {item.insuranceCompanyName}
              </div>
              <div className="text-xs text-slate-400">
                {item.jobCount} งาน | {fmtBaht(item.totalClaimAmount)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
