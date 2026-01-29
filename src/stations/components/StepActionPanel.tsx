import { Check } from "lucide-react";
import type { StepStatus } from "../../Type";
import type { EmployeeApi } from "../api/employees.api";
import EmployeeAutocomplete from "../../shared/components/ui/EmployeeAutocomplete";

export default function StepActionPanel({
  stepName,
  stepStatus,

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
}: {
  stepName: string;
  stepStatus: StepStatus;

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
}) {
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
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">
            เช็กรายการ
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-900">{stepName}</span>
            {getBadge()}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <EmployeeAutocomplete
          label={
            <>
              ผู้ดำเนินการ <span className="text-red-500">*</span>
            </>
          }
          required
          value={selectedEmployee}
          onChange={onSelectEmployee}
          error={error}
          placeholder="กรุณากรอกชื่อพนักงาน"
          limit={50}
          minQueryLength={1}
          debounceMs={250}
        />

        {/* Status */}
        <div className="space-y-2">
          <label className="block mb-2 text-sm font-medium text-slate-700">
            สถานะ
          </label>

          <div className="grid grid-cols-2 gap-4">
            {canSkip && (
              <button
                type="button"
                onClick={() => {
                  if (onBulkSkip) onBulkSkip();
                  else onSelectAction("skipped");
                }}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left
                  ${
                    selectedAction === "skipped"
                      ? "border-slate-500 bg-slate-50 ring-1 ring-slate-500"
                      : "border-slate-200 hover:border-slate-300"
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
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left
                ${
                  selectedAction === "completed"
                    ? "border-green-500 bg-green-50 ring-1 ring-green-500"
                    : "border-slate-200 hover:border-slate-300"
                }`}
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center ${
                  selectedAction === "completed"
                    ? "bg-green-500 border-green-500"
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

      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-8 py-2.5 bg-slate-100 hover:bg-blue-700 hover:text-white text-slate-600 font-medium rounded-lg text-sm transition-colors shadow-blue-200"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </div>
  );
}
