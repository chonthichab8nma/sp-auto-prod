import type { ReactNode } from "react";
import {
  BriefcaseBusiness,
  Coins,
  Crown,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useDashboardSummaryQuery } from "../hooks/useDashboardSummaryQuery";

type StatCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: "blue" | "green" | "amber";
};

const amountFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const numberFormatter = new Intl.NumberFormat("th-TH");
const compactNumberFormatter = new Intl.NumberFormat("th-TH", {
  notation: "compact",
  maximumFractionDigits: 1,
});

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

function shortMonthLabel(value: string) {
  if (!value) return "-";
  return value.length > 4 ? value.slice(0, 3) : value;
}

function StatCard({ label, value, icon, tone = "blue" }: StatCardProps) {
  const toneClass =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700"
        : "bg-sky-50 text-sky-700";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 text-sm font-medium leading-tight text-slate-500">{label}</p>
        <div
          className={`shrink-0 rounded-lg p-2 [&>svg]:h-4 [&>svg]:w-4 md:rounded-xl md:p-2.5 md:[&>svg]:h-[18px] md:[&>svg]:w-[18px] ${toneClass}`}
        >
          {icon}
        </div>
      </div>
      <p
        title={value}
        className="mt-2 truncate text-[clamp(1.7rem,2.2vw,2.35rem)] leading-none font-semibold tracking-tight text-slate-900"
      >
        {value}
      </p>
    </article>
  );
}

function SummarySkeletonCard() {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
      <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-9 w-40 animate-pulse rounded bg-slate-200" />
    </article>
  );
}

export default function ReportSummaryPage() {
  const {
    data,
    financialSummary,
    insuranceFinancialSummary,
    insuranceStats,
    monthlyTrends,
    topInsurance,
    selectedYear,
    loading,
    error,
  } = useDashboardSummaryQuery();

  const insuranceRevenue =
    data?.totalClaimAmount ??
    insuranceFinancialSummary?.overall.totalClaim ??
    financialSummary?.totalClaimAmount ??
    0;
  const cashRevenue = financialSummary?.totalExcessFee ?? data?.totalExcessFee ?? 0;
  const totalRevenue = financialSummary?.totalCashAndClaim ?? data?.totalCashAndClaim ?? 0;
  const receivedInsurance =
    data?.totalDisbursedAmount ??
    insuranceFinancialSummary?.overall.totalReceived ??
    0;
  // Pending insurance must always be "total claim - total received", never negative.
  const pendingInsurance = Math.max(insuranceRevenue - receivedInsurance, 0);
  const processingAmount = pendingInsurance;

  const fallbackSortedCompanies = [...insuranceStats].sort(
    (a, b) => b.jobCount - a.jobCount,
  );
  const statsByCompanyId = new Map(
    insuranceStats.map((item) => [item.insuranceCompanyId, item]),
  );

  const rankedCompanies = (() => {
    if (!topInsurance.length) return fallbackSortedCompanies;

    const topIds = new Set(topInsurance.map((item) => item.insuranceCompanyId));
    const topWithAmounts = topInsurance
      .map((item) => {
        const stat = statsByCompanyId.get(item.insuranceCompanyId);
        return {
          insuranceCompanyId: item.insuranceCompanyId,
          insuranceCompanyName: item.insuranceCompanyName,
          jobCount: item.jobCount,
          totalClaimAmount: stat?.totalClaimAmount ?? 0,
          totalApprovedAmount: stat?.totalApprovedAmount ?? 0,
          totalDisbursedAmount: stat?.totalDisbursedAmount ?? 0,
        };
      })
      .sort((a, b) => b.jobCount - a.jobCount);

    const remaining = fallbackSortedCompanies.filter(
      (item) => !topIds.has(item.insuranceCompanyId),
    );
    return [...topWithAmounts, ...remaining];
  })();

  const topTotalJobs = rankedCompanies.reduce((sum, item) => sum + item.jobCount, 0);

  const monthlyRows = monthlyTrends?.data ?? [];
  const monthlyChartData = monthlyRows.map((month) => {
    const processing = Math.max(
      month.totalClaimAmount - month.totalApprovedAmount,
      0,
    );

    return {
      key: `${month.year}-${month.month}`,
      month: month.monthName || formatMonthName(month.month),
      total: month.totalClaimAmount,
      disbursed: month.totalDisbursedAmount,
      processing,
      jobCount: month.jobCount,
    };
  });
  const maxChartValue = Math.max(
    ...monthlyChartData.flatMap((item) => [
      item.total,
      item.disbursed,
      item.processing,
    ]),
    1,
  );
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 md:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">รายงานรายได้และบริษัทลูกค้า</h1>
            <p className="mt-2 text-sm text-slate-500">
              ภาพรวมรายได้จากประกัน ส่วนต่างเงินสด และบริษัทประกันที่มีจำนวนงานสูงสุด
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          โหลดข้อมูลไม่สำเร็จ: {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12 ">
        <div className="space-y-5 lg:col-span-8">
          <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">สรุปรายได้</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                อัปเดตล่าสุด
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {loading ? (
                <>
                  <SummarySkeletonCard />
                  <SummarySkeletonCard />
                  <SummarySkeletonCard />
                  <SummarySkeletonCard />
                  <SummarySkeletonCard />
                  <SummarySkeletonCard />
                </>
              ) : (
                <>
                  <StatCard
                    label="รายได้จากประกัน"
                    value={`฿${formatAmount(insuranceRevenue)}`}
                    icon={<BriefcaseBusiness size={18} />}
                    tone="blue"
                  />
                  <StatCard
                    label="เงินประกันที่เก็บได้แล้ว"
                    value={`฿${formatAmount(receivedInsurance)}`}
                    icon={<Coins size={18} />}
                    tone="green"
                  />
                  <StatCard
                    label="เงินประกันที่ยังเก็บไม่ได้"
                    value={`฿${formatAmount(pendingInsurance)}`}
                    icon={<RefreshCw size={18} />}
                    tone="amber"
                  />
                  <StatCard
                    label="รายได้จากเงินสด/ส่วนต่าง"
                    value={`฿${formatAmount(cashRevenue)}`}
                    icon={<Wallet size={18} />}
                    tone="amber"
                  />
                  <StatCard
                    label="รายได้รวมทั้งหมด"
                    value={`฿${formatAmount(totalRevenue)}`}
                    icon={<Coins size={18} />}
                    tone="green"
                  />
                  {/* <StatCard
                    label="ยอดคงค้างเคลม"
                    value={`฿${formatAmount(processingAmount)}`}
                    icon={<RefreshCw size={18} />}
                    tone="amber"
                  /> */}
                </>
              )}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">รายงานรายเดือน ปี {selectedYear}</h2>
              <p className="text-sm text-slate-500">
                เปรียบเทียบรายได้รวมและยอดคงค้างเคลมรายเดือน
              </p>
            </div>

            {monthlyRows.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                ยังไม่มีข้อมูลรายเดือนสำหรับปี {selectedYear}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                      รายได้รวม
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      ยอดคงค้างเคลม
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <div className="min-w-[720px]">
                      <div className="flex h-56 items-end gap-3">
                        {monthlyChartData.map((item) => {
                          const totalHeight = Math.max((item.total / maxChartValue) * 100, 3);
                          const processingHeight = Math.max(
                            (item.processing / maxChartValue) * 100,
                            3,
                          );

                          return (
                            <div key={item.key} className="flex w-14 flex-col items-center gap-2">
                              <div className="flex h-44 items-end gap-1">
                                <div
                                  className="w-3 rounded-t bg-sky-500"
                                  style={{ height: `${item.total > 0 ? totalHeight : 2}%` }}
                                  title={`${item.month} | รายได้รวม: ${formatAmount(item.total)} บาท`}
                                />
                                <div
                                  className="w-3 rounded-t bg-amber-500"
                                  style={{
                                    height: `${item.processing > 0 ? processingHeight : 2}%`,
                                  }}
                                  title={`${item.month} | รับเงินแล้วเรียบร้อย: ${formatAmount(item.processing)} บาท`}
                                />
                              </div>
                              <span className="text-xs text-slate-500">
                                {shortMonthLabel(item.month)}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {compactNumberFormatter.format(item.total)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <details className="rounded-xl border border-slate-200 bg-white">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700">
                    ดูตารางตัวเลขรายเดือน
                  </summary>
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
                            <tr key={`${month.year}-${month.month}`} className="hover:bg-slate-50/80">
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
                </details>
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-4">
          <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm md:p-6 lg:h-full h-[24rem]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Top บริษัทลูกค้า</h2>
                <p className="mt-1 text-sm text-slate-500">อันดับตามจำนวนงานในเดือนนี้</p>
              </div>
              <div className="rounded-lg bg-sky-50 p-2 text-sky-700 [&>svg]:h-4 [&>svg]:w-4 md:rounded-xl md:[&>svg]:h-[18px] md:[&>svg]:w-[18px]">
                <Crown size={18} />
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              รวม {numberFormatter.format(topTotalJobs)} งาน
            </div>

            {rankedCompanies.length === 0 ? (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                ยังไม่มีข้อมูลบริษัทประกัน
              </div>
            ) : (
              <div className="mt-4 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1">
                {rankedCompanies.map((item, index) => (
                  <article
                    key={item.insuranceCompanyId}
                    className="rounded-xl border border-slate-200 bg-white p-3 transition hover:border-sky-200 hover:bg-sky-50/30"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-sky-700">อันดับ {index + 1}</p>
                        <h3 className="text-[15px] font-semibold leading-tight text-slate-900">
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
    </div>
  );
}
