import { Search, ChevronDown } from "lucide-react";

export type AlertFilterValue = "all" | "warning" | "critical";

export default function StationsFilters({
  searchTerm,
  selectedStatus,
  statusOptions,
  selectedAlert,
  onSearchTermChange,
  onStatusChange,
  onAlertChange,
  onSubmitSearch,
}: {
  searchTerm: string;
  selectedStatus: string;
  statusOptions: string[];
  selectedAlert: AlertFilterValue;

  onSearchTermChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onAlertChange: (v: AlertFilterValue) => void;
  onSubmitSearch: () => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmitSearch();
  };

  return (
    <div className="mb-6 space-y-3">
      <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-2">
        {[
          { key: "all" as const, label: "ทั้งหมด" },
          { key: "warning" as const, label: "เกินกำหนด 15 วันขึ้นไป" },
          { key: "critical" as const, label: "เกินกำหนด 30 วันขึ้นไป" },
        ].map((item) => {
          const active = selectedAlert === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onAlertChange(item.key)}
              className={[
                "rounded-xl border px-3 py-2 text-xs sm:text-sm font-medium transition",
                active
                  ? item.key === "critical"
                    ? "border-red-300 bg-red-50 text-red-700"
                    : item.key === "warning"
                      ? "border-amber-300 bg-amber-50 text-amber-700"
                      : "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
      {/* Search */}
      <div className="flex flex-1 gap-4 w-full md:w-auto">
        <div className="relative flex-1 md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>

          <input
            type="text"
            className="placeholder:py-2 block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            placeholder="ค้นหาทะเบียนรถ / เลขตัวถัง / ชื่อลูกค้า"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {/* Dropdowns */}
      <div className="flex gap-3 w-full md:w-auto">
        {/* Status */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white hover:bg-slate-50 outline-none cursor-pointer min-w-40"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>
      </div>
    </div>
  );
}
