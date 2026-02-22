import type { JobStatusApi } from "../../../features/jobs/api/job.api";

type StatusBadgeJob = {
  status: JobStatusApi | string;
  isFinished?: boolean;
};

type BadgeConfig = {
  label: string;
  bgClassName: string;
  textClassName: string;
};

const STATUS_BADGE: Record<string, BadgeConfig> = {
  CLAIM: { label: "เคลม", bgClassName: "bg-blue-50", textClassName: "text-blue-600" },
  REPAIR: { label: "ซ่อม", bgClassName: "bg-orange-50", textClassName: "text-[#fa731a]" },
  BILLING: { label: "ตั้งเบิก", bgClassName: "bg-yellow-50", textClassName: "text-[#f6b51e]" },

  DONE: { label: "เสร็จสิ้น", bgClassName: "bg-emerald-50", textClassName: "text-emerald-600" },
  FINISHED: { label: "เสร็จสิ้น", bgClassName: "bg-emerald-50", textClassName: "text-emerald-600" },
};

export default function StatusBadge({
  job,
  forceWhiteBackground = false,
}: {
  job: StatusBadgeJob;
  forceWhiteBackground?: boolean;
}) {
  if (job.isFinished) {
    return (
      <span
        className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[12px] font-semibold min-w-[80px] text-emerald-600 ${forceWhiteBackground ? "bg-white" : "bg-emerald-50"}`}
      >
        เสร็จสิ้น
      </span>
    );
  }

  const config = STATUS_BADGE[job.status] ?? {
    label: "รอดำเนินการ",
    bgClassName: "bg-slate-50",
    textClassName: "text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[12px] font-semibold min-w-[80px] ${config.textClassName} ${forceWhiteBackground ? "bg-white" : config.bgClassName}`}
    >
      {config.label}
    </span>
  );
}
