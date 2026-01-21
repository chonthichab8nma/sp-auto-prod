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
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 mb-6 flex items-center gap-4">
      <button
        onClick={onBack}
        className="w-8 h-8   rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 text-slate-500"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center flex-wrap gap-2 text-sm sm:text-base">
        <h1 className="text-lg font-bold text-slate-900">สเตชั่น</h1>

        <span className="text-slate-300 mx-1">/</span>

        <span className="text-slate-500">
          สเตชั่น <span className="text-slate-300 mx-1">/</span> รายละเอียด{" "}
          {registration}
        </span>

        <span className="text-slate-300 mx-1">/</span>

        <span className="font-bold text-slate-900">สถานะ</span>

        <span className="ml-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {label}
        </span>
      </div>
    </div>
  );
}
