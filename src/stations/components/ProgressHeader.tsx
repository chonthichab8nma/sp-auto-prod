import { ChevronLeft } from "lucide-react";

export default function ProgressHeader({
  registration,
  status,
  onBack,
}: {
  registration: string;
  status: "CLAIM" | "REPAIR" | "BILLING" | "DONE";
  onBack: () => void;
}) {
  const label =
    status === "CLAIM"
      ? "เคลม"
      : status === "REPAIR"
        ? "ซ่อม"
        : status === "BILLING"
          ? "ตั้งเบิก"
          : "เสร็จสิ้น";

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:gap-4 md:rounded-xl md:p-4">
      <button
        onClick={onBack}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 md:h-8 md:w-8 md:rounded-lg"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-base font-bold text-slate-900 md:text-lg">สเตชั่น</h1>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {label}
          </span>
        </div>

        <div className="mt-1.5 md:hidden">
          <p className="truncate text-[15px] font-semibold text-slate-900">
            <span className="mr-1 text-[11px] font-medium tracking-wide text-slate-400">
              ทะเบียนรถ
            </span>
            {registration}
          </p>
        </div>

        <div className="mt-1 hidden items-center flex-wrap gap-2 text-sm sm:text-base md:flex">
          <span className="text-slate-500">
            <span className="mx-1 text-slate-300">/</span> รายละเอียด {registration}
          </span>
          <span className="mx-1 text-slate-300">/</span>
          <span className="font-bold text-slate-900">สถานะ</span>
        </div>
      </div>
    </div>
  );
}
