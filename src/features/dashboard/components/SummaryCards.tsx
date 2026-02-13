import {
  Briefcase,
  Activity,
  CheckCircle2,
  Receipt,
  Clock,
} from "lucide-react";
import type { DashboardSummary } from "../api/dashboard.api";

const fmt = (n: number) => n.toLocaleString("th-TH");
const fmtBaht = (n: number) =>
  `฿${n.toLocaleString("th-TH", { minimumFractionDigits: 0 })}`;

export default function SummaryCards({
  data,
}: {
  data: DashboardSummary | null;
}) {
  const cards = [
    {
      label: "งานทั้งหมด",
      value: data ? fmt(data.totalJobs) : "-",
      icon: Briefcase,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "กำลังดำเนินการ",
      value: data ? fmt(data.activeJobs) : "-",
      icon: Activity,
      color: "text-orange-600 bg-orange-50",
    },
    {
      label: "เสร็จสิ้น",
      value: data ? fmt(data.completedJobs) : "-",
      icon: CheckCircle2,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "ยอดเคลมรวม",
      value: data ? fmtBaht(data.totalClaimAmount) : "-",
      icon: Receipt,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "รอเบิกจ่าย",
      value: data ? fmtBaht(data.pendingDisbursement) : "-",
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.color}`}
            >
              <c.icon size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{c.value}</div>
          <div className="text-xs text-slate-500 mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
