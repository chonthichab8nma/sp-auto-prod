import {
  getJobsApi,
  type JobApi,
  type JobsListApiResponse,
  type JobsQuery,
  type JobStatusApi,
} from "../api/job.api";

const UI_STATUS_TO_API: Record<string, JobStatusApi> = {
  เคลม: "CLAIM",
  ซ่อม: "REPAIR",
  ตั้งเบิก: "BILLING",
  เสร็จสิ้น: "DONE",
};

export function mapUiStatusToApi(status: string): JobStatusApi | undefined {
  return UI_STATUS_TO_API[status];
}

export function compactWhitespace(value?: string): string {
  return (value ?? "").replace(/\s+/g, "");
}

export function resolveTotalPages(
  response: JobsListApiResponse | null,
  pageSize: number,
): number {
  if (!response) return 1;

  if ("meta" in response) {
    const { totalItems, totalPages } = response.meta;
    if (typeof totalPages === "number") return Math.max(1, totalPages);
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }

  return Math.max(1, response.totalPages);
}

export function resolveTotalItems(response: JobsListApiResponse | null): number {
  if (!response) return 0;
  if ("meta" in response) return response.meta.totalItems;
  return response.total;
}

export async function fetchAllJobsPages(
  params: Omit<JobsQuery, "page">,
): Promise<JobApi[]> {
  const firstPage = await getJobsApi({
    page: 1,
    ...params,
  });

  const allJobs = [...(firstPage.data ?? [])];
  const totalPages = resolveTotalPages(firstPage, params.pageSize);
  if (totalPages <= 1) return allJobs;

  const restPagePromises = Array.from({ length: totalPages - 1 }, (_, index) =>
    getJobsApi({
      page: index + 2,
      ...params,
    }),
  );

  const restPages = await Promise.all(restPagePromises);
  for (const pageResponse of restPages) {
    allJobs.push(...(pageResponse.data ?? []));
  }

  return allJobs;
}
