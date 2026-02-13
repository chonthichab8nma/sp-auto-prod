import type { InsuranceStatsResponse } from "../api/dashboard.api";

const fmtBaht = (n: number) =>
  `฿${n.toLocaleString("th-TH", { minimumFractionDigits: 0 })}`;

export default function InsuranceStatsTable({
  data,
}: {
  data: InsuranceStatsResponse | null;
}) {
  if (!data || data.data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          สถิติบริษัทประกัน
        </h3>
        <p className="text-sm text-slate-400 text-center py-8">ไม่มีข้อมูล</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 pb-4">
        <h3 className="text-base font-bold text-slate-900">
          สถิติบริษัทประกัน
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {data.count} บริษัท
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-200">
              <th className="text-left px-6 py-3 font-medium text-slate-500">
                บริษัทประกัน
              </th>
              <th className="text-right px-6 py-3 font-medium text-slate-500">
                จำนวนงาน
              </th>
              <th className="text-right px-6 py-3 font-medium text-slate-500">
                ยอดเคลม
              </th>
              <th className="text-right px-6 py-3 font-medium text-slate-500">
                อนุมัติ
              </th>
              <th className="text-right px-6 py-3 font-medium text-slate-500">
                เบิกจ่าย
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.data.map((row) => (
              <tr key={row.insuranceCompanyId} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-medium text-slate-800">
                  {row.insuranceCompanyName}
                </td>
                <td className="px-6 py-3 text-right text-slate-600">
                  {row.jobCount}
                </td>
                <td className="px-6 py-3 text-right text-slate-600">
                  {fmtBaht(row.totalClaimAmount)}
                </td>
                <td className="px-6 py-3 text-right text-slate-600">
                  {fmtBaht(row.totalApprovedAmount)}
                </td>
                <td className="px-6 py-3 text-right text-slate-600">
                  {fmtBaht(row.totalDisbursedAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
