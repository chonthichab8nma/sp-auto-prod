import { Check } from "lucide-react";
import type { StepStatus } from "../../Type";
import type { EmployeeApi } from "../api/employees.api";

export default function StepActionPanel({
  stepName,
  stepStatus,

  employeeQuery,
  onEmployeeQueryChange,
  employeeOptions,
  employeeLoading,
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

  employeeQuery: string;
  onEmployeeQueryChange: (v: string) => void;
  employeeOptions: EmployeeApi[];
  employeeLoading?: boolean;
  selectedEmployee: EmployeeApi | null;
  onSelectEmployee: (emp: EmployeeApi) => void;

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

  const showDropdown =
    !!employeeQuery.trim() &&
    !selectedEmployee &&
    (employeeLoading || employeeOptions.length > 0);

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

      <div className="flex-1 space-y-6 ">
        {/* Operator autocomplete */}
        <div className="space-y-4 relative">
          <label className=" block mb-2 text-sm font-medium text-slate-700">
            ผู้ดำเนินการ <span className="text-red-500 ">*</span>
          </label>

          <input
            type="text"
            placeholder="กรุณากรอกชื่อพนักงาน"
            value={selectedEmployee ? selectedEmployee.name : employeeQuery}
            onChange={(e) => onEmployeeQueryChange(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all
              ${error
                ? "border-red-300 bg-red-50 focus:border-red-500"
                : "border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500"
              }
            `}
          />

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute z-20 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
              {employeeLoading ? (
                <div className="px-4 py-3 text-sm text-slate-500">
                  กำลังค้นหา...
                </div>
              ) : employeeOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500">
                  ไม่พบพนักงาน
                </div>
              ) : (
                <ul className="max-h-64 overflow-auto">
                  {employeeOptions.map((e) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => onSelectEmployee(e)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-800 truncate">
                            {e.name}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {e.role} • {e.phone}
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">#{e.id}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Selected hint */}
          {selectedEmployee && (
            <div className="text-xs text-slate-500">
              ผู้ดำเนินการ: {selectedEmployee.name}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="block mb-2 text-sm font-medium text-slate-700">สถานะ</label>
          <div className="grid grid-cols-2 gap-4">
            {canSkip && (
              <button
                onClick={() => {
                  if (onBulkSkip) {
                    onBulkSkip();
                  } else {
                    onSelectAction("skipped");
                  }
                }}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left
                   ${selectedAction === "skipped"
                    ? "border-slate-500 bg-slate-50 ring-1 ring-slate-500"
                    : "border-slate-200 hover:border-slate-300"
                  }
                 `}
              >
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center ${selectedAction === "skipped"
                    ? "bg-slate-600 border-slate-600"
                    : "border-slate-300 bg-white"
                    }`}
                >
                  {selectedAction === "skipped" && (
                    <Check size={12} className="text-white" />
                  )}
                </div>
                <span className="text-sm font-medium text-slate-700">{skipLabel}</span>
              </button>
            )}

            <button
              onClick={() => onSelectAction("completed")}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left
                 ${selectedAction === "completed"
                  ? "border-green-500 bg-green-50 ring-1 ring-green-500"
                  : "border-slate-200 hover:border-slate-300"
                }
               `}
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center ${selectedAction === "completed"
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
