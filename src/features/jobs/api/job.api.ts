//dashboard

import type { Job } from "../../../Type";
import { filterData } from "../hooks/useSearch";

export type JobStatusFilter =
  | "ทั้งหมด"
  | "เคลม"
  | "ซ่อม"
  | "ตั้งเบิก"
  | "เสร็จสิ้น";

export type JobsQuery = {
  search: string;
  carType: string;
  from: string;
  to: string;
  status: JobStatusFilter;
  page: number;
  pageSize: number;
};

export type JobsSummary = {
  total: number;
  claim: number;
  repair: number;
  billing: number;
  finished: number;
};

export type JobsResponse = {
  items: Job[];
  totalItems: number;
  summary: JobsSummary;
};

export async function getJobsDashboardMock(
  allJobs: Job[],
  q: JobsQuery
): Promise<JobsResponse> {
  const base = filterData(
    allJobs,
    q.search,
    q.carType,
    q.from,
    q.to,
    "ทั้งหมด"
  );

  const summary: JobsSummary = {
    total: base.length,
    claim: base.filter(
      (j) => !j.isFinished && j.stages[j.currentStageIndex]?.name === "เคลม"
    ).length,
    repair: base.filter(
      (j) => !j.isFinished && j.stages[j.currentStageIndex]?.name === "ซ่อม"
    ).length,
    billing: base.filter(
      (j) => !j.isFinished && j.stages[j.currentStageIndex]?.name === "ตั้งเบิก"
    ).length,
    finished: base.filter((j) => j.isFinished).length,
  };

  const filtered =
    q.status === "ทั้งหมด"
      ? base
      : base.filter((j) => {
          if (q.status === "เสร็จสิ้น") return j.isFinished;
          const stageName = j.stages[j.currentStageIndex]?.name;
          return !j.isFinished && stageName === q.status;
        });

  const totalItems = filtered.length;
  const start = (q.page - 1) * q.pageSize;
  const items = filtered.slice(start, start + q.pageSize);

  await new Promise((r) => setTimeout(r, 80));

  return { items, totalItems, summary };
}
