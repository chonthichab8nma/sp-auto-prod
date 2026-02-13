import type { MonthlyTrendsResponse } from "../api/dashboard.api";

const fmtBaht = (n: number) =>
  `฿${n.toLocaleString("th-TH", { minimumFractionDigits: 0 })}`;

export default function MonthlyTrendsChart({
  data,
}: {
  data: MonthlyTrendsResponse | null;
}) {
  if (!data) return null;

  const items = data.data;
  const maxCount = Math.max(...items.map((i) => i.jobCount), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            แนวโน้มรายเดือน
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ปี {data.year} - รวม {data.yearTotals.jobCount} งาน (
            {fmtBaht(data.yearTotals.totalClaimAmount)})
          </p>
        </div>
      </div>

      <div className="flex items-end gap-2 h-48">
        {items.map((item) => {
          const pct = maxCount > 0 ? (item.jobCount / maxCount) * 100 : 0;
          return (
            <div
              key={`${item.year}-${item.month}`}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <span className="text-xs font-semibold text-slate-700">
                {item.jobCount || ""}
              </span>
              <div className="w-full flex justify-center">
                <div
                  className="w-full max-w-8 bg-blue-500 rounded-t-md transition-all hover:bg-blue-600"
                  style={{ height: `${Math.max(pct, 2)}%` }}
                  title={`${item.monthName}: ${item.jobCount} งาน, ${fmtBaht(item.totalClaimAmount)}`}
                />
              </div>
              <span className="text-[10px] text-slate-400">
                {item.monthName.slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
