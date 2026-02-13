import { Clock } from "lucide-react";
import type { AgingStatus } from "../../../features/jobs/api/job.api";

const CONFIG: Record<AgingStatus, { label: string; className: string }> = {
  normal: {
    label: "ปกติ",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  warning: {
    label: "เตือน",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  critical: {
    label: "วิกฤต",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export default function AgingBadge({
  status,
  days,
  compact = false,
}: {
  status?: AgingStatus;
  days?: number;
  compact?: boolean;
}) {
  if (!status || status === "normal") return null;

  const cfg = CONFIG[status];

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${cfg.className}`}
      >
        <Clock size={10} />
        {days != null ? `${days}d` : cfg.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.className}`}
    >
      <Clock size={12} />
      {days != null && <span>{days} วัน</span>}
      <span>{cfg.label}</span>
    </span>
  );
}
