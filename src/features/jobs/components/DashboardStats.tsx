import { Car, FileText, Wrench, Receipt, CheckCircle2 } from "lucide-react";

export default function DashboardStats({
  selectedStatus,
  onSelectStatus,
  values,
}: {
  selectedStatus: string;
  onSelectStatus: (s: string) => void;
  values: {
    total: number;
    claim: number;
    repair: number;
    billing: number;
    finished: number;
  };
}) {
  const cards = [
    {
      label: "รถทั้งหมด",
      mobileLabel: "รถทั้งหมด",
      statusValue: "ทั้งหมด",
      value: values.total,
      icon: Car,
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "ขั้นตอนเคลม",
      mobileLabel: "เคลม",
      statusValue: "เคลม",
      value: values.claim,
      icon: FileText,
      bg: "bg-rose-50",
      iconColor: "text-rose-500",
    },
    {
      label: "ขั้นตอนซ่อม",
      mobileLabel: "ซ่อม",
      statusValue: "ซ่อม",
      value: values.repair,
      icon: Wrench,
      bg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      label: "ขั้นตอนตั้งเบิก",
      mobileLabel: "ตั้งเบิก",
      statusValue: "ตั้งเบิก",
      value: values.billing,
      icon: Receipt,
      bg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      label: "รถที่เสร็จสิ้น",
      mobileLabel: "รถที่เสร็จสิ้น",
      statusValue: "เสร็จสิ้น",
      value: values.finished,
      icon: CheckCircle2,
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  const priorityCards = cards.filter((card) =>
    ["เคลม", "ซ่อม", "ตั้งเบิก"].includes(card.statusValue),
  );
  const summaryCards = cards.filter((card) =>
    ["ทั้งหมด", "เสร็จสิ้น"].includes(card.statusValue),
  );

  return (
    <>
      <div className="space-y-3 md:hidden">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold tracking-wide text-slate-500">
            สถานะที่ต้องติดตาม
          </p>
          <p className="text-[10px] text-slate-400">แตะเพื่อกรองรายการ</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {priorityCards.map((card) => {
            const Icon = card.icon;
            const isActive = selectedStatus === card.statusValue;

            return (
              <button
                key={card.label}
                type="button"
                onClick={() => onSelectStatus(card.statusValue)}
                className={`flex items-center gap-2 rounded-2xl border p-2 text-left transition active:scale-95 ${
                  isActive
                    ? "border-blue-500 ring-2 ring-blue-500/10 bg-blue-50/40"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${card.bg}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${card.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold leading-[1.35] text-slate-600">
                    {card.mobileLabel}
                  </p>
                  <p className="mt-1 text-[16px] font-bold leading-none text-slate-800 tabular-nums">
                    {card.value}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            const isActive = selectedStatus === card.statusValue;

            return (
              <button
                key={card.label}
                type="button"
                onClick={() => onSelectStatus(card.statusValue)}
                className={`flex items-center gap-2 rounded-2xl border p-2 text-left transition active:scale-95 ${
                  isActive
                    ? "border-blue-500 ring-2 ring-blue-500/10 bg-blue-50/40"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${card.bg}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${card.iconColor}`} />
                </div>
                <div>
                  <p className="text-[10px] font-medium leading-tight text-slate-600">
                    {card.label}
                  </p>
                  <p className="mt-1 text-[17px] font-bold leading-none text-slate-800">
                    {card.value}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden grid-cols-1 gap-5 md:grid md:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          const isActive = selectedStatus === card.statusValue;

          return (
            <div
              key={card.label}
              onClick={() => onSelectStatus(card.statusValue)}
              className={`flex items-center gap-4 border rounded-2xl p-2 shadow-sm transition-all cursor-pointer hover:shadow-md active:scale-95 ${
                isActive
                  ? "border-blue-500 ring-2 ring-blue-500/10 bg-blue-50/10"
                  : "border-slate-100 bg-white"
              }`}
            >
              <div
                className={`flex items-center justify-center rounded-xl ${card.bg} h-12 w-12 shrink-0`}
              >
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-slate-500 truncate leading-6 py-px">
                  {card.label}
                </p>
                <p className="text-[20px] font-bold text-slate-800 leading-none mt-1">
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
