export type AgingBand = "normal" | "warning" | "critical";
export type AgingThresholds = {
  warningDays: number;
  criticalDays: number;
};

const DEFAULT_THRESHOLDS: AgingThresholds = {
  warningDays: 15,
  criticalDays: 30,
};

export function resolveAgingBand(
  daysInProcess: number,
  thresholds: AgingThresholds = DEFAULT_THRESHOLDS,
): AgingBand {
  if (daysInProcess >= thresholds.criticalDays) return "critical";
  if (daysInProcess >= thresholds.warningDays) return "warning";
  return "normal";
}

export function getDelayBadgeClass(
  daysInProcess: number,
  thresholds: AgingThresholds = DEFAULT_THRESHOLDS,
): string {
  const band = resolveAgingBand(daysInProcess, thresholds);
  if (band === "critical") return "bg-red-100 text-red-700";
  if (band === "warning") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-500";
}
