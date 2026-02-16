export type AgingBand = "normal" | "warning" | "critical";

export function resolveAgingBand(daysInProcess: number): AgingBand {
  if (daysInProcess >= 30) return "critical";
  if (daysInProcess >= 15) return "warning";
  return "normal";
}

export function getDelayBadgeClass(daysInProcess: number): string {
  const band = resolveAgingBand(daysInProcess);
  if (band === "critical") return "bg-red-50 text-red-700 border-red-200";
  if (band === "warning") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-500 border-slate-200";
}

