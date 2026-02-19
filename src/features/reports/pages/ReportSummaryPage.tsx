import type { ReactNode } from "react";
import { Activity, CircleCheck, Clock3, FileText, RefreshCw } from "lucide-react";
import { useDashboardSummaryQuery } from "../hooks/useDashboardSummaryQuery";

type SummaryCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
};

const numberFormatter = new Intl.NumberFormat("th-TH");
const amountFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function SummaryCard({ label, value, hint, icon }: SummaryCardProps) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">{icon}</div>
      </div>
    </article>
  );
}

export default function ReportSummaryPage() {
  const { data, insuranceStats, loading, error, refetch } =
    useDashboardSummaryQuery();

  const totalJobs = data?.totalJobs ?? 0;
  const completedJobs = data?.completedJobs ?? 0;
  const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
  const maxInsuranceJobCount = Math.max(
    ...insuranceStats.map((item) => item.jobCount),
    1,
  );
  const topInsurance = insuranceStats[0];
  const insuranceJobsTotal = insuranceStats.reduce(
    (sum, item) => sum + item.jobCount,
    0,
  );
  const insuranceCompaniesCount = insuranceStats.length;

  const statusCounts = data?.statusCounts ?? {
    CLAIM: 0,
    REPAIR: 0,
    BILLING: 0,
    DONE: 0,
  };

  const statusItems = [
    { key: "CLAIM", label: "CLAIM", value: statusCounts.CLAIM, color: "bg-amber-500" },
    { key: "REPAIR", label: "REPAIR", value: statusCounts.REPAIR, color: "bg-cyan-500" },
    { key: "BILLING", label: "BILLING", value: statusCounts.BILLING, color: "bg-violet-500" },
    { key: "DONE", label: "DONE", value: statusCounts.DONE, color: "bg-emerald-500" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl bg-white p-5 md:p-8 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">รายงานภาพรวม</h1>
            <p className="mt-1 text-sm text-slate-500">สรุปสถานะงานและยอดการเคลมจากระบบล่าสุด</p>
          </div>

          <button
            type="button"
            onClick={refetch}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            รีเฟรช
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          โหลดข้อมูลไม่สำเร็จ: {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="งานทั้งหมด"
          value={numberFormatter.format(data?.totalJobs ?? 0)}
          icon={<FileText size={18} />}
        />
        <SummaryCard
          label="งานที่กำลังดำเนินการ"
          value={numberFormatter.format(data?.activeJobs ?? 0)}
          icon={<Activity size={18} />}
        />
        <SummaryCard
          label="งานที่เสร็จแล้ว"
          value={numberFormatter.format(data?.completedJobs ?? 0)}
          hint={`คิดเป็น ${completionRate.toFixed(1)}% ของงานทั้งหมด`}
          icon={<CircleCheck size={18} />}
        />
        <SummaryCard
          label="รอเบิกจ่าย"
          value={numberFormatter.format(data?.pendingDisbursement ?? 0)}
          icon={<Clock3 size={18} />}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SummaryCard
          label="ยอดเคลมรวม (บาท)"
          value={amountFormatter.format(data?.totalClaimAmount ?? 0)}
          icon={<FileText size={18} />}
        />
        <SummaryCard
          label="ยอดอนุมัติรวม (บาท)"
          value={amountFormatter.format(data?.totalApprovedAmount ?? 0)}
          icon={<CircleCheck size={18} />}
        />
        <SummaryCard
          label="ยอดจ่ายจริงรวม (บาท)"
          value={amountFormatter.format(data?.totalDisbursedAmount ?? 0)}
          icon={<Activity size={18} />}
        />
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 md:p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">จำนวนงานตามสถานะ</h2>
        <p className="mt-1 text-sm text-slate-500">เปรียบเทียบสัดส่วนงานแต่ละสถานะจากงานทั้งหมด</p>

        <div className="mt-5 space-y-4">
          {statusItems.map((item) => {
            const percent = totalJobs > 0 ? (item.value / totalJobs) * 100 : 0;

            return (
              <div key={item.key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="text-slate-500">
                    {numberFormatter.format(item.value)} งาน ({percent.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={["h-full rounded-full transition-all", item.color].join(" ")}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              อันดับบริษัทประกัน (Top 10)
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              จาก API insurance-stats จัดเรียงตามจำนวนงาน
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 text-right sm:grid-cols-3 sm:gap-4">
            <div>
              <div className="text-xs text-slate-500">บริษัทสูงสุด</div>
              <div className="text-sm font-semibold text-slate-900">
                {topInsurance?.insuranceCompanyName ?? "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">จำนวนบริษัท</div>
              <div className="text-sm font-semibold text-slate-900">
                {numberFormatter.format(insuranceCompaniesCount)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">รวมจำนวนงาน</div>
              <div className="text-sm font-semibold text-slate-900">
                {numberFormatter.format(insuranceJobsTotal)}
              </div>
            </div>
          </div>
        </div>

        {insuranceStats.length === 0 ? (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
            ยังไม่มีข้อมูลบริษัทประกัน
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3">อันดับ</th>
                  <th className="px-3 py-3">บริษัทประกัน</th>
                  <th className="px-3 py-3">จำนวนงาน</th>
                  <th className="px-3 py-3">สัดส่วน</th>
                  <th className="px-3 py-3 text-right">ยอดเคลม (บาท)</th>
                  <th className="px-3 py-3 text-right">ยอดอนุมัติ (บาท)</th>
                  <th className="px-3 py-3 text-right">ยอดจ่ายจริง (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {insuranceStats.map((item, idx) => {
                  const percent = (item.jobCount / maxInsuranceJobCount) * 100;
                  return (
                    <tr key={item.insuranceCompanyId} className="hover:bg-slate-50/70">
                      <td className="px-3 py-3 text-sm text-slate-700">{idx + 1}</td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-slate-900">
                          {item.insuranceCompanyName}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm font-semibold text-slate-900">
                        {numberFormatter.format(item.jobCount)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right text-sm text-slate-700">
                        {amountFormatter.format(item.totalClaimAmount)}
                      </td>
                      <td className="px-3 py-3 text-right text-sm text-slate-700">
                        {amountFormatter.format(item.totalApprovedAmount)}
                      </td>
                      <td className="px-3 py-3 text-right text-sm text-slate-700">
                        {amountFormatter.format(item.totalDisbursedAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
