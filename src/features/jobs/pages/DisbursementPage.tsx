import { useState } from "react";
import { Banknote, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useDisbursement } from "../hooks/useDisbursement";
import DisbursementModal from "../components/DisbursementModal";
import { formatThaiDate } from "../../../shared/lib/date";
import Skeleton from "../../../shared/components/ui/Skeleton";
import type { DisbursementJob } from "../api/disbursement.api";

const fmtBaht = (n: number | null) =>
  n != null ? `฿${n.toLocaleString("th-TH")}` : "-";

export default function DisbursementPage() {
  const [filters, setFilters] = useState<{
    dateFrom?: string;
    dateTo?: string;
  }>({});
  const { data, loading, error, refetch, disburse } = useDisbursement(filters);
  const [modalJob, setModalJob] = useState<DisbursementJob | null>(null);
  const [saving, setSaving] = useState(false);

  const handleDisbursement = async (amount: number, date: string) => {
    if (!modalJob) return;
    setSaving(true);
    try {
      await disburse(modalJob.id, amount, date);
      toast.success("เบิกจ่ายสำเร็จ");
      setModalJob(null);
    } catch {
      toast.error("เบิกจ่ายไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">การเบิกจ่าย</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            จัดการเบิกจ่ายตามยอดอนุมัติ
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

      {/* Summary cards */}
      {loading && !data ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="text-2xl font-bold text-slate-900">
                {fmtBaht(data.totalApproved)}
              </div>
              <div className="text-xs text-slate-500 mt-1">ยอดอนุมัติรวม</div>
            </div>
            <div className="bg-green-50 rounded-xl border border-green-200 p-5 shadow-sm">
              <div className="text-2xl font-bold text-green-700">
                {fmtBaht(data.totalDisbursed)}
              </div>
              <div className="text-xs text-green-600 mt-1">เบิกจ่ายแล้ว</div>
            </div>
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 shadow-sm">
              <div className="text-2xl font-bold text-amber-700">
                {fmtBaht(data.pendingDisbursement)}
              </div>
              <div className="text-xs text-amber-600 mt-1">
                รอเบิกจ่าย ({data.pendingJobsCount} งาน)
              </div>
            </div>
          </div>

          {/* Pending jobs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                รอเบิกจ่าย ({data.pendingJobsCount})
              </h3>
            </div>
            {data.pendingJobs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <Banknote size={32} className="mx-auto mb-2 text-slate-300" />
                ไม่มีรายการรอเบิกจ่าย
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-6 py-3 font-medium text-slate-500">
                        เลขงาน
                      </th>
                      <th className="text-left px-6 py-3 font-medium text-slate-500">
                        ทะเบียนรถ
                      </th>
                      <th className="text-left px-6 py-3 font-medium text-slate-500">
                        ลูกค้า
                      </th>
                      <th className="text-left px-6 py-3 font-medium text-slate-500">
                        บริษัทประกัน
                      </th>
                      <th className="text-right px-6 py-3 font-medium text-slate-500">
                        ยอดอนุมัติ
                      </th>
                      <th className="text-right px-6 py-3 font-medium text-slate-500">
                        เบิกแล้ว
                      </th>
                      <th className="text-right px-6 py-3 font-medium text-slate-500">
                        คงเหลือ
                      </th>
                      <th className="text-center px-6 py-3 font-medium text-slate-500">
                        ดำเนินการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.pendingJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-medium text-slate-800">
                          {job.jobNumber}
                        </td>
                        <td className="px-6 py-3 text-slate-700">
                          {job.vehicle.registration}
                        </td>
                        <td className="px-6 py-3 text-slate-600">
                          {job.customer.name}
                        </td>
                        <td className="px-6 py-3 text-slate-600">
                          {job.insuranceCompany?.name ?? "-"}
                        </td>
                        <td className="px-6 py-3 text-right text-slate-700">
                          {fmtBaht(job.approvedAmount)}
                        </td>
                        <td className="px-6 py-3 text-right text-slate-700">
                          {fmtBaht(job.disbursedAmount)}
                        </td>
                        <td className="px-6 py-3 text-right font-medium text-blue-600">
                          {fmtBaht(
                            (job.approvedAmount ?? 0) -
                              (job.disbursedAmount ?? 0),
                          )}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <button
                            onClick={() => setModalJob(job)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                          >
                            เบิกจ่าย
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Disbursed jobs */}
          {data.disbursedJobs.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  เบิกจ่ายแล้ว ({data.disbursedJobsCount})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-6 py-3 font-medium text-slate-500">
                        เลขงาน
                      </th>
                      <th className="text-left px-6 py-3 font-medium text-slate-500">
                        ทะเบียนรถ
                      </th>
                      <th className="text-left px-6 py-3 font-medium text-slate-500">
                        ลูกค้า
                      </th>
                      <th className="text-right px-6 py-3 font-medium text-slate-500">
                        ยอดอนุมัติ
                      </th>
                      <th className="text-right px-6 py-3 font-medium text-slate-500">
                        เบิกจ่าย
                      </th>
                      <th className="text-left px-6 py-3 font-medium text-slate-500">
                        วันที่เบิก
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.disbursedJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-medium text-slate-800">
                          {job.jobNumber}
                        </td>
                        <td className="px-6 py-3 text-slate-700">
                          {job.vehicle.registration}
                        </td>
                        <td className="px-6 py-3 text-slate-600">
                          {job.customer.name}
                        </td>
                        <td className="px-6 py-3 text-right text-slate-700">
                          {fmtBaht(job.approvedAmount)}
                        </td>
                        <td className="px-6 py-3 text-right text-green-600 font-medium">
                          {fmtBaht(job.disbursedAmount)}
                        </td>
                        <td className="px-6 py-3 text-slate-600">
                          {formatThaiDate(job.disbursementDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}

      {modalJob && (
        <DisbursementModal
          job={modalJob}
          onClose={() => setModalJob(null)}
          onConfirm={handleDisbursement}
          saving={saving}
        />
      )}
    </div>
  );
}
