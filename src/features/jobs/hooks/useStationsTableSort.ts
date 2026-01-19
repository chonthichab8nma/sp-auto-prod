import { useMemo, useState } from "react";
import type { Job } from "../../../Type";

type SortDir = "asc" | "desc" | null;
type SortKey = "customerName" | "startDate" | "estimatedEndDate" | null;

type SortState = { key: SortKey; dir: SortDir };

function compareThai(a: string, b: string) {
  return (a ?? "").trim().localeCompare((b ?? "").trim(), "th", {
    usage: "sort",
    sensitivity: "base",
    numeric: true,
    ignorePunctuation: true,
  });
}

function toTime(v: unknown): number {
  if (!v) return Number.NEGATIVE_INFINITY;
  if (v instanceof Date) return v.getTime();
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const t = new Date(v).getTime();
    return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t;
  }
  return Number.NEGATIVE_INFINITY;
}

export function useStationsTableSort(jobs: Job[]) {
  const [sort, setSort] = useState<SortState>({ key: null, dir: null });

  function toggleSort(key: Exclude<SortKey, null>) {
    setSort((prev) => {
      if (prev.key !== key) {
        const startDir: SortDir = key === "customerName" ? "asc" : "desc";
        return { key, dir: startDir };
      }
      if (prev.dir === "asc") return { key, dir: "desc" };
      return { key: null, dir: null };
    });
  }

  const sortedJobs = useMemo(() => {
    if (!sort.key || !sort.dir) return jobs;

    const factor = sort.dir === "asc" ? 1 : -1;

    return [...jobs].sort((a, b) => {
      if (sort.key === "customerName") {
        return factor * compareThai(a.customerName ?? "", b.customerName ?? "");
      }
      if (sort.key === "startDate") {
        return factor * (toTime(a.startDate) - toTime(b.startDate));
      }
      // estimatedEndDate
      return factor * (toTime(a.estimatedEndDate) - toTime(b.estimatedEndDate));
    });
  }, [jobs, sort]);

  return { sort, toggleSort, sortedJobs };
}
