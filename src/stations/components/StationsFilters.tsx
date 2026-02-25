import {
  CarFront,
  CircleAlert,
  Clock3,
  ClipboardList,
  Search,
} from "lucide-react";
import FormSelect from "../../shared/components/form/FormSelect";

export type AlertFilterValue = "vehicles" | "all" | "warning" | "critical";
type SummaryCardKey = AlertFilterValue;

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
            key: "vehicles" as SummaryCardKey,
            title: "จำนวนรถทั้งหมด",
            subTitle: "รถที่กำลังซ่อมในระบบ",
            count: totalVehiclesCount,
            icon: CarFront,
            iconWrapClass: "bg-white text-sky-600",
            toneClass: "border-sky-200 bg-sky-50",
            countClass: "text-slate-900",
            subTitleClass: "text-sky-700/80",
            titleClass: "text-slate-800",
          },
          {
            key: "warning" as SummaryCardKey,
            title: "เสี่ยงล่าช้า",
            subTitle: isAllStatuses
              ? "ตามค่าเตือนของแต่ละสถานะ"
              : `เกินกำหนด ${warningDays} วัน`,
            count: summaryCounts.warning,
            icon: Clock3,
            iconWrapClass: "bg-white text-amber-500",
            toneClass: "border-amber-200 bg-amber-50",
            countClass: "text-slate-900",
            subTitleClass: "text-amber-700/80",
            titleClass: "text-slate-700",
          },
          {
            key: "critical" as SummaryCardKey,
            title: "เกินกำหนดแล้ว",
            subTitle: isAllStatuses
              ? "ตามค่าเตือนของแต่ละสถานะ"
              : `เกินกำหนด ${criticalDays} วัน`,
            count: summaryCounts.critical,
            icon: CircleAlert,
            iconWrapClass: "bg-white text-rose-600",
            toneClass: "border-rose-200 bg-rose-50",
            countClass: "text-slate-900",
            subTitleClass: "text-rose-700/80",
            titleClass: "text-slate-700",
          },
          {
            key: "all" as SummaryCardKey,
            title: "งานที่ล่าช้าทั้งหมด",
            subTitle: "รวมเสี่ยงล่าช้าและเกินกำหนด",
            count: summaryCounts.all,
            icon: ClipboardList,
            iconWrapClass: "bg-white text-blue-600",
            toneClass: "border-slate-200 bg-slate-50",
            countClass: "text-slate-900",
            subTitleClass: "text-slate-500",
            titleClass: "text-slate-800",
          },
        ].map((item) => {
          const active = selectedAlert === item.key;
          const Icon = item.icon;
          const activeClass = item.key === "vehicles"
              ? "border-sky-300 bg-sky-200"
            : item.key === "warning"
              ? "border-amber-300 bg-amber-100"
              : item.key === "critical"
                ? "border-rose-300 bg-rose-100"
                : "border-blue-300 bg-blue-100";

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onAlertChange(item.key);
              }}
              className={[
                "relative w-full min-h-20 rounded-2xl border px-4 py-2 text-left transition",
                item.toneClass,
                active ? activeClass : "hover:brightness-[0.98]",
              ].join(" ")}
            >
              <div className="flex h-full items-center gap-4">
                <span
                  className={[
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                    item.iconWrapClass,
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 flex items-center justify-between gap-2">
                  <span className="min-w-0 pr-2">
                    <span className={`block truncate whitespace-nowrap text-[14px] leading-snug font-semibold lg:text-[15px] ${item.titleClass}`}>
                      {item.title}
                    </span>
                    {item.subTitle ? (
                      <span
                        className={`mt-1 block truncate whitespace-nowrap text-[12px] leading-relaxed font-semibold lg:text-[13px] ${item.subTitleClass}`}
                      >
                        {item.subTitle}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={`shrink-0 self-start whitespace-nowrap text-right text-[28px] leading-none font-bold lg:text-[30px] ${item.countClass}`}
                  >
                    {item.count}
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="md:hidden">
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              key: "vehicles" as AlertFilterValue,
              label: "รถทั้งหมด",
              count: totalVehiclesCount,
              subLabel: "รถที่กำลังซ่อมในระบบ",
              idle: "border-sky-200 bg-sky-50 text-sky-800",
              active: "border-sky-300 bg-sky-200 text-sky-900",
            },
            {
              key: "warning" as AlertFilterValue,
              label: "เสี่ยงล่าช้า",
              count: summaryCounts.warning,
              subLabel: isAllStatuses
                ? "ตามค่าเตือนของแต่ละสถานะ"
                : `เกินกำหนด ${warningDays} วัน`,
              idle: "border-amber-200 bg-amber-50 text-amber-800",
              active: "border-amber-300 bg-amber-200 text-amber-900",
            },
            {
              key: "critical" as AlertFilterValue,
              label: "เกินกำหนด",
              count: summaryCounts.critical,
              subLabel: isAllStatuses
                ? "ตามค่าเตือนของแต่ละสถานะ"
                : `เกินกำหนด ${criticalDays} วัน`,
              idle: "border-rose-200 bg-rose-50 text-rose-800",
              active: "border-rose-300 bg-rose-200 text-rose-900",
            },
            {
              key: "all" as AlertFilterValue,
              label: "งานที่ล่าช้าทั้งหมด",
              count: summaryCounts.all,
              subLabel: "รวมเสี่ยงล่าช้าและเกินกำหนด",
              idle: "border-slate-200 bg-slate-50 text-slate-800",
              active: "border-blue-300 bg-blue-200 text-slate-900",
            },
          ].map((item) => {
            const active = selectedAlert === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onAlertChange(item.key)}
                className={[
                  "rounded-xl border px-3 py-2 text-left transition",
                  active ? item.active : `${item.idle} hover:brightness-[0.98]`,
                ].join(" ")}
              >
                <div className="truncate text-[11px] font-semibold">{item.label}</div>
                <div className="mt-0.5 text-lg font-bold leading-none">{item.count}</div>
                <div className="mt-1 truncate text-[10px] font-medium opacity-80">
                  {item.subLabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative min-w-0 flex-1">
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
          className="w-[140px] min-w-0 shrink-0 md:ml-auto md:w-64 md:shrink-0"
        />
      </div>
    </div>
  );
}
