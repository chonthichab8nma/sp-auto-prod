import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useDashboardAnalytics } from "../hooks/useDashboardAnalytics";
import SummaryCards from "../components/SummaryCards";
import MonthlyTrendsChart from "../components/MonthlyTrendsChart";
import InsuranceStatsTable from "../components/InsuranceStatsTable";
import TopInsuranceWidget from "../components/TopInsuranceWidget";
import type { DashboardFilters } from "../api/dashboard.api";
import Skeleton from "../../../shared/components/ui/Skeleton";

export default function AnalyticsDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({});
  const { summary, insuranceStats, monthlyTrends, topInsurance, loading, error, refetch } =
    useDashboardAnalytics(filters);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">รายงานภาพรวม</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            สรุปข้อมูลงานและยอดเคลม
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
            value={filters.dateFrom ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, dateFrom: e.target.value || undefined }))
            }
          />
          <span className="text-slate-400 text-sm">ถึง</span>
          <input
            type="date"
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
            value={filters.dateTo ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, dateTo: e.target.value || undefined }))
            }
          />
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors disabled:opacity-50"
            title="รีเฟรช"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading && !summary ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : (
        <>
          <SummaryCards data={summary} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MonthlyTrendsChart data={monthlyTrends} />
            </div>
            <div>
              <TopInsuranceWidget data={topInsurance} />
            </div>
          </div>

          <InsuranceStatsTable data={insuranceStats} />
        </>
      )}
    </div>
  );
}
