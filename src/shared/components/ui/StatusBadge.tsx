import type { JobApi } from "../../../features/jobs/api/job.api";

type BadgeConfig = {
  label: string;
  className: string;
};

const STATUS_BADGE: Record<string, BadgeConfig> = {
  CLAIM: { label: "เคลม", className: "bg-blue-50 text-blue-600" },
  REPAIR: { label: "ซ่อม", className: "bg-orange-50 text-[#fa731a]" },
  BILLING: { label: "ตั้งเบิก", className: "bg-yellow-50 text-[#f6b51e]" },

  DONE: { label: "เสร็จสิ้น", className: "bg-emerald-50 text-emerald-600" },
  FINISHED: { label: "เสร็จสิ้น", className: "bg-emerald-50 text-emerald-600" },
};

export default function StatusBadge({ job }: { job: JobApi }) {

  if (job.isFinished) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold bg-emerald-50 text-emerald-600">
        เสร็จสิ้น
      </span>
    );
  }

  const config = STATUS_BADGE[job.status] ?? {
    label: "รอดำเนินการ",
    className: "bg-slate-50 text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
