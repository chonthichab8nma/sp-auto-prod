import type { ReactNode } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { BriefcaseBusiness, Coins, RefreshCw, Wallet } from "lucide-react";
import { Bar } from "react-chartjs-2";
import FormSelect from "../../../shared/components/form/FormSelect";
import { useDashboardSummaryQuery } from "../hooks/useDashboardSummaryQuery";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type StatCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: "blue" | "green" | "amber";
  className?: string;
};

const amountFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const numberFormatter = new Intl.NumberFormat("th-TH");
const monthNameFormatter = new Intl.DateTimeFormat("th-TH", { month: "long" });

function formatMonthName(monthNumber: number) {
  if (!Number.isFinite(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    return "-";
  }
  const date = new Date(2026, monthNumber - 1, 1);
  return monthNameFormatter.format(date);
}

function formatAmount(value: number) {
  return amountFormatter.format(value || 0);
}

function StatCard({
  label,
  value,
  icon,
  tone = "blue",
  className,
}: StatCardProps) {
  const toneClass =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700"
        : "bg-sky-50 text-sky-700";

  return (
    <article
      className={`overflow-hidden rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 text-sm font-medium leading-tight text-slate-500">
          {label}
        </p>
        <div
          className={`shrink-0 rounded-lg p-2 [&>svg]:h-4 [&>svg]:w-4 md:rounded-xl md:p-2.5 md:[&>svg]:h-[18px] md:[&>svg]:w-[18px] ${toneClass}`}
        >
          {icon}
        </div>
      </div>
      <p
        title={value}
        className="mt-2 truncate text-[clamp(1.3rem,1.45vw,2.2rem)] leading-none font-semibold tracking-tight text-slate-900"
      >
        {value}
      </p>
    </article>
  );
}

function SummarySkeletonCard() {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
      <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-9 w-40 animate-pulse rounded bg-slate-200" />
    </article>
  );
}

function ReportPageSkeleton() {
  return (
    <div className="flex w-full flex-col gap-5">
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-12">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
            <SummarySkeletonCard />
            <SummarySkeletonCard />
            <SummarySkeletonCard />
            <SummarySkeletonCard />
            <SummarySkeletonCard />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch">
        <div className="lg:col-span-8">
          <div className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 h-8 w-64 animate-pulse rounded bg-slate-200" />
            <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 h-7 w-52 animate-pulse rounded bg-slate-200" />
            <div className="space-y-3">
              <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 h-7 w-56 animate-pulse rounded bg-slate-200" />
        <div className="space-y-3">
          <div className="h-10 animate-pulse rounded bg-slate-100" />
          <div className="h-10 animate-pulse rounded bg-slate-100" />
          <div className="h-10 animate-pulse rounded bg-slate-100" />
          <div className="h-10 animate-pulse rounded bg-slate-100" />
          <div className="h-10 animate-pulse rounded bg-slate-100" />
        </div>
      </section>
    </div>
  );
}

export default function ReportSummaryPage() {
  const {
    data,
    financialSummary,
    insuranceFinancialSummary,
    insuranceStats,
    monthlyTrends,
    selectedYear,
    setSelectedYear,
    loading,
    error,
  } = useDashboardSummaryQuery();
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, index) => {
    const year = currentYear - index;
    return { value: String(year), label: `ปี ${year}` };
  });

  if (loading) {
    return <ReportPageSkeleton />;
  }

  const insuranceRevenue =
    data?.totalClaimAmount ??
    insuranceFinancialSummary?.overall.totalClaim ??
    financialSummary?.totalClaimAmount ??
    0;
  const cashRevenue =
    financialSummary?.totalExcessFee ?? data?.totalExcessFee ?? 0;
  const totalRevenue =
    financialSummary?.totalCashAndClaim ?? data?.totalCashAndClaim ?? 0;
  const receivedInsurance =
    data?.totalDisbursedAmount ??
    insuranceFinancialSummary?.overall.totalReceived ??
    0;
  // Pending insurance must always be "total claim - total received", never negative.
  const pendingInsurance = Math.max(insuranceRevenue - receivedInsurance, 0);

  const rankedCompanies = [...insuranceStats].sort((a, b) => {
    const byJobCount = b.jobCount - a.jobCount;
    if (byJobCount !== 0) return byJobCount;
    return a.insuranceCompanyName.localeCompare(
      b.insuranceCompanyName,
      "th-TH",
    );
  });

  // const topFiveCompanies = rankedCompanies.slice(0, 5);
  // const remainingCompanies = rankedCompanies.slice(5);
  const topTotalJobs = rankedCompanies.reduce(
    (sum, item) => sum + item.jobCount,
    0,
  );

  const monthlyRows = monthlyTrends?.data ?? [];
  const monthlyChartData = monthlyRows.map((month) => ({
    key: `${month.year}-${month.month}`,
    month: month.monthName || formatMonthName(month.month),
    total: month.totalClaimAmount,
  }));
  const monthlyBarData = {
    labels: monthlyChartData.map((item) => item.month),
    datasets: [
      {
        label: "รายได้รวม",
        data: monthlyChartData.map((item) => item.total),
        backgroundColor: "#0ea5e9",
        borderRadius: 6,
        maxBarThickness: 28,
      },
    ],
  };
  const monthlyBarOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${formatAmount(Number(context.raw) || 0)} บาท`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#64748b",
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#e2e8f0" },
        ticks: {
          color: "#64748b",
          callback: (value) =>
            typeof value === "number"
              ? `${numberFormatter.format(value)}`
              : `${value}`,
        },
      },
    },
  };

  return (
    <div className="flex w-full flex-col gap-5">
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          โหลดข้อมูลไม่สำเร็จ: {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12 ">
        <div className="space-y-5 lg:col-span-12">
          <section className="">
            <div className="flex items-center justify-between gap-3">
              {/* <h2 className="text-lg font-semibold text-slate-900">
                สรุปรายได้
              </h2> */}
              {/* <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                อัปเดตล่าสุด
              </span> */}
            </div>
            <div className=" grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard
                label="รายได้จากบริษัทประกัน"
                value={`฿${formatAmount(insuranceRevenue)}`}
                icon={<BriefcaseBusiness size={18} />}
                tone="blue"
              />
              <StatCard
                label="ยอดเงินประกันที่รับชำระแล้ว"
                value={`฿${formatAmount(receivedInsurance)}`}
                icon={<Coins size={18} />}
                tone="green"
              />
              <StatCard
                label="ยอดเงินประกันที่ยังไม่ได้รับ"
                value={`฿${formatAmount(pendingInsurance)}`}
                icon={<RefreshCw size={18} />}
                tone="amber"
              />
              <StatCard
                label="รายได้จากเงินสด"
                value={`฿${formatAmount(cashRevenue)}`}
                icon={<Wallet size={18} />}
                tone="amber"
              />
              <StatCard
                label="ยอดรายได้รวม"
                value={`฿${formatAmount(totalRevenue)}`}
                icon={<Coins size={18} />}
                tone="green"
              />
            </div>
          </section>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch">
        <div className="lg:col-span-8">
          <section className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">
                รายงานรายเดือน ปี {selectedYear}
              </h2>
              <div className="w-[150px]">
                <FormSelect
                  value={String(selectedYear)}
                  options={yearOptions}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  placeholder="เลือกปี"
                />
              </div>
            </div>

            {monthlyRows.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                ยังไม่มีข้อมูลรายเดือนสำหรับปี {selectedYear}
              </div>
            ) : (
              <div className="flex flex-1 min-h-0 flex-col space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                      รายได้รวม
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <div
                      className="h-64 min-w-[720px]"
                      style={{ width: Math.max(720, monthlyChartData.length * 90) }}
                    >
                      <Bar
                        data={monthlyBarData}
                        options={monthlyBarOptions}
                        aria-label="กราฟแท่งรายได้รายเดือน"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-4">
          <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm md:p-6 lg:max-h-[424px]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900 leading-tight">
                บริษัทที่ใช้บริการสูงสุด
              </h2>

              <div className="text-sm text-slate-700 leading-tight">
                รวม {numberFormatter.format(topTotalJobs)} งาน
              </div>
            </div>

            {rankedCompanies.length === 0 ? (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                ยังไม่มีข้อมูลบริษัทประกัน
              </div>
            ) : (
              <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1 space-y-2.5">
                {rankedCompanies.map((item, index) => (
                  <article
                    key={item.insuranceCompanyId}
                    className="rounded-xl border border-slate-200 bg-white p-3 transition hover:border-sky-200 hover:bg-sky-50/30"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-sky-700">
                          อันดับ {index + 1}
                        </p>
                        <h3 className="truncate text-[15px] font-semibold leading-tight text-slate-900">
                          {item.insuranceCompanyName}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">งาน</p>
                        <p className="text-xl font-semibold leading-none text-slate-900">
                          {numberFormatter.format(item.jobCount)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm md:p-6 lg:max-h-[520px] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3">
          <div className="text-lg font-semibold text-slate-900">ตารางตัวเลขรายเดือน</div>
          <div className="w-[150px]">
            <FormSelect
              value={String(selectedYear)}
              options={yearOptions}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              placeholder="เลือกปี"
            />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-t border-slate-100 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3">เดือน</th>
                  <th className="px-3 py-3">จำนวนงาน</th>
                  <th className="px-3 py-3 text-right">รายได้รวม (บาท)</th>
                  <th className="px-3 py-3 text-right">รับเงินแล้วเรียบร้อย</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyRows.map((month) => {
                  const monthProcessing = Math.max(
                    month.totalClaimAmount - month.totalApprovedAmount,
                    0,
                  );
                  return (
                    <tr
                      key={`${month.year}-${month.month}`}
                      className="hover:bg-slate-50/80"
                    >
                      <td className="px-3 py-3 text-sm font-medium text-slate-900">
                        {month.monthName || formatMonthName(month.month)}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {numberFormatter.format(month.jobCount)} งาน
                      </td>
                      <td className="px-3 py-3 text-right text-sm font-medium text-slate-900">
                        {formatAmount(month.totalClaimAmount)} บาท
                      </td>
                      <td className="px-3 py-3 text-right text-sm text-amber-700">
                        {formatAmount(monthProcessing)} บาท
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
