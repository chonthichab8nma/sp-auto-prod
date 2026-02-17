export type AgingBand = "normal" | "warning" | "critical";

export function resolveAgingBand(daysInProcess: number): AgingBand {
  if (daysInProcess >= 30) return "critical";
  if (daysInProcess >= 15) return "warning";
  return "normal";
}

export function getDelayBadgeClass(daysInProcess: number): string {
  const band = resolveAgingBand(daysInProcess);
  if (band === "critical") return "bg-red-100 text-red-700";
  if (band === "warning") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-500";
}
