import { Check, ExternalLink, FileText, Paperclip, X } from "lucide-react";
import type { StepStatus } from "../../Type";
import type { EmployeeApi } from "../api/employees.api";
import EmployeeAutocomplete from "../../shared/components/ui/EmployeeAutocomplete";
import StepImagesUploader from "./StepImagesUploader";
import StepRemarkPanel from "./StepRemarkPanel";
import type { JobReceiptUploadResponse } from "../../features/jobs/api/receipt.api";

export default function StepActionPanel({
  stepId,
  stepName,
  stepStatus,
  initialRemark,

  selectedEmployee,
  onSelectEmployee,

  selectedAction,
  onSelectAction,
  error,
  onSave,
  saving,
  canSkip = true,
  skipLabel = "ข้าม",
  onBulkSkip,
  onRemarkSaved,
  showReceiptUploader = false,
  receiptFile,
  onReceiptFileChange,
  uploadedReceipt,
  lockEmployee = false,
  lockedEmployeeName,
}: {
  stepId: string;
  stepName: string;
  stepStatus: StepStatus;
  initialRemark?: string | null;

  selectedEmployee: EmployeeApi | null;
  onSelectEmployee: (emp: EmployeeApi | null) => void;

  selectedAction: StepStatus | null;
  onSelectAction: (s: StepStatus) => void;
  error: string | null;
  onSave: () => void;
  saving?: boolean;
  canSkip?: boolean;
  skipLabel?: string;
  onBulkSkip?: () => void;
  onRemarkSaved?: (stepId: string, remark: string) => void;
  showReceiptUploader?: boolean;
  receiptFile?: File | null;
  onReceiptFileChange?: (file: File | null) => void;
  uploadedReceipt?: JobReceiptUploadResponse | null;
  lockEmployee?: boolean;
  lockedEmployeeName?: string;
}) {
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";

  const getReceiptHref = (receipt: JobReceiptUploadResponse): string | null => {
    const raw = receipt.receiptViewUrl || receipt.receiptUrl;
    if (!raw) return null;
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("/")) return `${apiBase}${raw}`;
    return raw;
  };

  const getBadge = () => {
    if (stepStatus === "completed")
      return (
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
          เสร็จสิ้น
        </span>
      );
    if (stepStatus === "skipped")
      return (
        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
          ข้าม
        </span>
      );
    return (
      <span className="bg-orange-50 text-orange-500 px-3 py-1 rounded-full text-xs font-medium">
        กำลังดำเนินการ
      </span>
    );
  };

  return (
    <div className="flex h-full flex-col bg-white p-4">
      <div className="border-b border-slate-100 pb-3">
        <div>
          <h3 className="mb-1 text-xs font-semibold tracking-wide text-slate-500">
            เช็กรายการ
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-bold leading-tight text-slate-900">
              {stepName}
            </span>
            {getBadge()}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 pt-3">
        {lockEmployee ? (
          <div className="pb-3">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              ผู้ดำเนินการ <span className="text-red-500">*</span>
            </label>
            <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {lockedEmployeeName || selectedEmployee?.name || "-"}
            </div>
          </div>
        ) : (
          <EmployeeAutocomplete
            label={
              <>
                ผู้ดำเนินการ <span className="text-red-500">*</span>
              </>
            }
            value={selectedEmployee}
            onChange={onSelectEmployee}
            error={error}
            placeholder="กรุณากรอกชื่อพนักงาน"
            limit={50}
            minQueryLength={1}
            debounceMs={250}
            className="pb-3"
            inputClassName="border-slate-200 bg-slate-50 py-3"
          />
        )}

        {!showReceiptUploader && (
          <div className="border-t border-slate-100 pt-3">
            <StepImagesUploader stepId={stepId} />
          </div>
        )}
        {showReceiptUploader && onReceiptFileChange && (
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <label className="block text-sm font-semibold text-slate-700">
              ใบเสร็จวันจ่ายเงิน 
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-600">
              <Paperclip size={14} />
              <span>เลือกไฟล์ใบเสร็จ</span>
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  onReceiptFileChange(file);
                  e.currentTarget.value = "";
                }}
              />
            </label>
            {receiptFile && (
              <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                <span className="truncate">{receiptFile.name}</span>
                <button
                  type="button"
                  onClick={() => onReceiptFileChange(null)}
                  className="text-blue-700 hover:text-blue-900"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {uploadedReceipt && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                <div className="flex items-center gap-2">
                <FileText size={14} />
                <span className="truncate">
                  อัปโหลดใบเสร็จแล้ว: {uploadedReceipt.receiptFileName}
                </span>
                </div>
                {getReceiptHref(uploadedReceipt) && (
                  <a
                    href={getReceiptHref(uploadedReceipt) ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-green-800 underline hover:text-green-900"
                  >
                    เปิดใบเสร็จ
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        <div className="border-t border-slate-100 pt-3">
          <StepRemarkPanel
            stepId={Number(stepId)}
            status={stepStatus}
            employeeId={selectedEmployee?.id}
            initialRemark={initialRemark ?? ""}
            onSaved={(r) => onRemarkSaved?.(stepId, r)}
            variant="minimal"
          />
        </div>

        <div className="border-t border-slate-100 pt-3">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            สถานะ
          </label>

          <div
            className={`grid gap-3 ${
              canSkip ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {canSkip && (
              <button
                type="button"
                onClick={() => {
                  if (onBulkSkip) onBulkSkip();
                  else onSelectAction("skipped");
                }}
                className={`flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all
                  ${
                    selectedAction === "skipped"
                      ? "border-slate-500 bg-white ring-1 ring-slate-400"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center ${
                    selectedAction === "skipped"
                      ? "bg-slate-600 border-slate-600"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {selectedAction === "skipped" && (
                    <Check size={12} className="text-white" />
                  )}
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {skipLabel}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onSelectAction("completed")}
              className={`flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all
                ${
                  selectedAction === "completed"
                    ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-400"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center ${
                  selectedAction === "completed"
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-slate-300 bg-white"
                }`}
              >
                {selectedAction === "completed" && (
                  <Check size={12} className="text-white" />
                )}
              </div>

              <span className="text-sm font-medium text-slate-700">
                เสร็จสิ้น
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </div>
  );
}
