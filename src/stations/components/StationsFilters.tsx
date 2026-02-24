import {
  AlertTriangle,
  ArrowUpCircle,
  CarFront,
  List,
  Search,
} from "lucide-react";
import FormSelect from "../../shared/components/form/FormSelect";

export type AlertFilterValue = "all" | "warning" | "critical";
type SummaryCardKey = AlertFilterValue | "totalVehicles";

export default function StationsFilters({
  searchTerm,
  selectedStatus,
  statusOptions,
  selectedAlert,
  summaryCounts,
  totalVehiclesCount,
  warningDays,
  criticalDays,
  isAllStatuses,
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
  totalVehiclesCount: number;
  warningDays: number;
  criticalDays: number;
  isAllStatuses: boolean;

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
      <div className="hidden grid-cols-2 gap-3 md:grid xl:grid-cols-4">
        {[
          {
            key: "totalVehicles" as SummaryCardKey,
            title: "จำนวนรถทั้งหมด",
            subTitle: "รถทั้งหมดในระบบ",
            count: totalVehiclesCount,
            icon: CarFront,
            iconWrapClass: "bg-sky-50 text-sky-600",
            toneClass: "border-sky-200 bg-sky-50/40",
            countClass: "text-sky-700",
            subTitleClass: "text-sky-700/80",
          },
          {
            key: "all" as SummaryCardKey,
            title: "งานทั้งหมดที่เกินระยะเวลา",
            subTitle: "งานที่อยู่ในระบบ",
            count: summaryCounts.all,
            icon: List,
            iconWrapClass: "bg-blue-50 text-blue-600",
            toneClass: "border-slate-200 bg-white",
            countClass: "text-slate-900",
            subTitleClass: "text-slate-500",
          },
          {
            key: "warning" as SummaryCardKey,
            title: "เกินกำหนด",
            subTitle: isAllStatuses ? "ตามค่าเตือนของแต่ละสถานะ" : `${warningDays} วัน`,
            count: summaryCounts.warning,
            icon: ArrowUpCircle,
            iconWrapClass: "bg-amber-50 text-amber-600",
            toneClass: "border-amber-200 bg-amber-50/45",
            countClass: "text-amber-700",
            subTitleClass: "text-amber-700/80",
          },
          {
            key: "critical" as SummaryCardKey,
            title: "เกินกำหนด",
            subTitle: isAllStatuses ? "ตามค่าเตือนของแต่ละสถานะ" : `${criticalDays} วัน`,
            count: summaryCounts.critical,
            icon: AlertTriangle,
            iconWrapClass: "bg-rose-50 text-rose-600",
            toneClass: "border-rose-200 bg-rose-50/45",
            countClass: "text-rose-700",
            subTitleClass: "text-rose-700/80",
          },
        ].map((item) => {
          const active = selectedAlert === item.key;
          const Icon = item.icon;
          const isFilterButton = item.key !== "totalVehicles";
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                if (!isFilterButton) return;
                onAlertChange(item.key as AlertFilterValue);
              }}
              className={[
                "relative w-full min-h-[96px] rounded-2xl border px-4 py-3 text-left transition shadow-sm",
                item.toneClass,
                isFilterButton
                  ? active
                    ? "shadow-md bg-white/95"
                    : "opacity-95"
                  : "opacity-95 cursor-default",
              ].join(" ")}
            >
              <div className="flex h-full items-center gap-3">
                <span
                  className={[
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    item.iconWrapClass,
                  ].join(" ")}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0 flex-1 flex items-center justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block text-[13px] leading-tight font-semibold text-slate-700 lg:text-[14px]">
                      {item.title}
                    </span>
                    {item.subTitle ? (
                      <span
                        className={`mt-0.5 block text-[12px] leading-snug font-semibold lg:text-[13px] ${item.subTitleClass}`}
                      >
                        {item.subTitle}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={`shrink-0 whitespace-nowrap text-right text-[40px] leading-none font-extrabold lg:text-[44px] ${item.countClass}`}
                  >
                    {item.count}
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="grid grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] gap-2 xl:flex xl:flex-1 xl:items-center xl:gap-3">
          <div className="relative min-w-0 w-full xl:flex-1 xl:max-w-3xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>

            <input
              type="text"
              className="placeholder:py-2 block w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-[13px] leading-5 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 md:text-sm"
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
            className="w-full min-w-0 xl:w-auto xl:min-w-44"
          />
        </div>

        <div className="inline-flex w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 xl:w-auto">
          {[
            {
              key: "all" as const,
              label: "ทั้งหมด",
              count: summaryCounts.all,
            },
            {
              key: "warning" as const,
              label: isAllStatuses ? "เตือน" : `เกิน ${warningDays} วัน`,
              count: summaryCounts.warning,
            },
            {
              key: "critical" as const,
              label: isAllStatuses ? "เกินกำหนด" : `เกิน ${criticalDays} วัน`,
              count: summaryCounts.critical,
            },
          ].map((item) => {
            const active = selectedAlert === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onAlertChange(item.key)}
                className={[
                  "flex-1 px-3 py-2.5 text-[13px] font-semibold transition xl:flex-none xl:px-4 xl:text-sm",
                  active
                    ? "bg-blue-500 text-white"
                    : "text-slate-700 hover:bg-white",
                ].join(" ")}
              >
                <span className="hidden md:inline">{item.label}</span>
                <span className="md:hidden">
                  {item.label} ({item.count})
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
