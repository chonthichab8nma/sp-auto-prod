import type { Job } from "../../../Type";

export default function StatusBadge({ job }: { job: Job }) {
  if (job.isFinished) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold bg-emerald-50 text-emerald-600">
        เสร็จสิ้น
      </span>
    );
  }

  const currentStatus =
    job.stages[job.currentStageIndex]?.name || "รอดำเนินการ";

  const map: Record<string, string> = {
    เคลม: "bg-blue-50 text-blue-600",
    ซ่อม: "bg-orange-50 text-[#fa731a]",
    ตั้งเบิก: "bg-yellow-50 text-[#f6b51e]",
  };

  const className = map[currentStatus] ?? "bg-slate-50 text-slate-600";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold ${className}`}
    >
      {currentStatus}
    </span>
  );
}
