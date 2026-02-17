import {
  AlertTriangle,
  ArrowUpCircle,
  List,
  Search,
} from "lucide-react";
import FormSelect from "../../shared/components/form/FormSelect";

export type AlertFilterValue = "all" | "warning" | "critical";

export default function StationsFilters({
  searchTerm,
  selectedStatus,
  statusOptions,
  selectedAlert,
  summaryCounts,
  onSearchTermChange,
  onStatusChange,
  onAlertChange,
  onSubmitSearch,
}: {
  searchTerm: string;
  selectedStatus: string;
  statusOptions: string[];
  selectedAlert: AlertFilterValue;
  summaryCounts: {
    all: number;
    warning: number;
    critical: number;
  };

  onSearchTermChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onAlertChange: (v: AlertFilterValue) => void;
  onSubmitSearch: () => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmitSearch();
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {[
          {
            key: "all" as const,
            title: "งานทั้งหมด",
            subTitle: "",
            count: summaryCounts.all,
            icon: List,
            iconWrapClass: "bg-blue-100 text-blue-600",
          },
          {
            key: "warning" as const,
            title: "เกินกำหนด",
            subTitle: "15 วัน",
            count: summaryCounts.warning,
            icon: ArrowUpCircle,
            iconWrapClass: "bg-amber-100 text-amber-600",
          },
          {
            key: "critical" as const,
            title: "เกินกำหนด",
            subTitle: "30 วัน",
            count: summaryCounts.critical,
            icon: AlertTriangle,
            iconWrapClass: "bg-rose-100 text-rose-600",
          },
        ].map((item) => {
          const active = selectedAlert === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onAlertChange(item.key)}
              className={[
                "w-full rounded-3xl border bg-white px-5 py-4 text-left shadow-sm transition",
                active
                  ? "border-blue-500 ring-1 ring-blue-500/30 shadow-[0_6px_16px_rgba(37,99,235,0.16)]"
                  : "border-slate-200 hover:border-slate-300",
              ].join(" ")}
            >
              <div className="flex items-center gap-4">
                <span
                  className={[
                    "flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl",
                    item.iconWrapClass,
                  ].join(" ")}
                >
                  <Icon className="h-8 w-8" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xl leading-tight font-semibold text-slate-600">
                    {item.title}
                    {item.subTitle && (
                      <span className="ml-2 inline text-slate-500">
                        {item.subTitle}
                      </span>
                    )}
                  </span>
                  <span className="mt-2 block text-5xl leading-none font-extrabold text-slate-900">
                    {item.count}
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative w-full xl:flex-1 xl:max-w-3xl">
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

        <FormSelect
          options={statusOptions}
          placeholder="สถานะ"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full xl:w-auto xl:min-w-44"
        />

        <div className="inline-flex w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 xl:w-auto">
          {[
            { key: "all" as const, label: "ทั้งหมด" },
            { key: "warning" as const, label: "เกิน 15 วัน" },
            { key: "critical" as const, label: "เกิน 30 วัน" },
          ].map((item) => {
            const active = selectedAlert === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onAlertChange(item.key)}
                className={[
                  "flex-1 px-4 py-2.5 text-sm font-semibold transition xl:flex-none",
                  active
                    ? "bg-blue-500 text-white"
                    : "text-slate-700 hover:bg-white",
                ].join(" ")}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
