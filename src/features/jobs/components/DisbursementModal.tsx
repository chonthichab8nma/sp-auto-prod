import { useState } from "react";
import { X } from "lucide-react";
import ModalPortal from "../../../shared/components/ui/ModalPortal";
import type { DisbursementJob } from "../api/disbursement.api";

const fmtBaht = (n: number | null) =>
  n != null ? `฿${n.toLocaleString("th-TH")}` : "-";

export default function DisbursementModal({
  job,
  onClose,
  onConfirm,
  saving,
}: {
  job: DisbursementJob;
  onClose: () => void;
  onConfirm: (amount: number, date: string) => void;
  saving: boolean;
}) {
  const pending =
    (job.approvedAmount ?? 0) - (job.disbursedAmount ?? 0);
  const [amount, setAmount] = useState(String(pending > 0 ? pending : ""));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = () => {
    const num = Number(amount);
    if (!num || num <= 0) return;
    onConfirm(num, date);
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-99999">
        <button
          type="button"
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
          aria-label="close"
        />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative w-[90%] max-w-md rounded-xl bg-white p-6 shadow-lg border border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              ตั้งเบิกจ่าย
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              {job.jobNumber} - {job.vehicle.registration}
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-400">ยอดเคลม</span>
                  <div className="font-medium text-slate-800">
                    {fmtBaht(job.claimAmount)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">ยอดอนุมัติ</span>
                  <div className="font-medium text-slate-800">
                    {fmtBaht(job.approvedAmount)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">เบิกแล้ว</span>
                  <div className="font-medium text-slate-800">
                    {fmtBaht(job.disbursedAmount)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">คงเหลือ</span>
                  <div className="font-bold text-blue-600">
                    {fmtBaht(pending)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  จำนวนเงินที่เบิก (บาท)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  วันที่เบิก
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || !Number(amount)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : "ยืนยันเบิกจ่าย"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
