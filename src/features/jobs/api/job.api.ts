// //dashboard

// import type { Job } from "../../../Type";
// import { filterData } from "../hooks/useSearch";

// export type JobStatusFilter =
//   | "ทั้งหมด"
//   | "เคลม"
//   | "ซ่อม"
//   | "ตั้งเบิก"
//   | "เสร็จสิ้น";

// export type JobsQuery = {
//   search: string;
//   carType: string;
//   from: string;
//   to: string;
//   status: JobStatusFilter;
//   page: number;
//   pageSize: number;
// };

// export type JobsSummary = {
//   total: number;
//   claim: number;
//   repair: number;
//   billing: number;
//   finished: number;
// };

// export type JobsResponse = {
//   items: Job[];
//   totalItems: number;
//   summary: JobsSummary;
// };

// export async function getJobsDashboardMock(
//   allJobs: Job[],
//   q: JobsQuery
// ): Promise<JobsResponse> {
//   const base = filterData(
//     allJobs,
//     q.search,
//     q.carType,
//     q.from,
//     q.to,
//     "ทั้งหมด"
//   );

//   const summary: JobsSummary = {
//     total: base.length,
//     claim: base.filter(
//       (j) => !j.isFinished && j.stages[j.currentStageIndex]?.name === "เคลม"
//     ).length,
//     repair: base.filter(
//       (j) => !j.isFinished && j.stages[j.currentStageIndex]?.name === "ซ่อม"
//     ).length,
//     billing: base.filter(
//       (j) => !j.isFinished && j.stages[j.currentStageIndex]?.name === "ตั้งเบิก"
//     ).length,
//     finished: base.filter((j) => j.isFinished).length,
//   };

//   const filtered =
//     q.status === "ทั้งหมด"
//       ? base
//       : base.filter((j) => {
//           if (q.status === "เสร็จสิ้น") return j.isFinished;
//           const stageName = j.stages[j.currentStageIndex]?.name;
//           return !j.isFinished && stageName === q.status;
//         });

//   const totalItems = filtered.length;
//   const start = (q.page - 1) * q.pageSize;
//   const items = filtered.slice(start, start + q.pageSize);

//   await new Promise((r) => setTimeout(r, 80));

//   return { items, totalItems, summary };
// }

import { http } from "../../../shared/lib/http";
import type { Job } from "../../../Type";

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

type JobApi = {
  id: number;
  jobNumber: string;
  vehicleId: number;
  customerId: number;
  receiverId: number | null;
  insuranceCompanyId: number | null;
  paymentType: string;
  excessFee: number;
  startDate: string;
  estimatedEndDate: string | null;
  actualEndDate: string | null;
  repairDescription: string;
  notes: string | null;
  currentStageIndex: number;
  status: "CLAIM" | "REPAIR" | "BILLING" | "FINISHED" | string;
  isFinished: boolean;
  createdAt: string;
  updatedAt: string;

  vehicle: {
    id: number;
    customerId: number;
    registration: string;
    brand: string;
    model: string;
    type: string;
    year: string;
    color: string;
  };

  customer: {
    id: number;
    name: string;
    phone: string;
    address: string;
  };

  insuranceCompany: unknown | null;

  jobStages: Array<{
    id: number;
    jobId: number;
    stageId: number;
    isLocked: boolean;
    isCompleted: boolean;
    startedAt: string | null;
    completedAt: string | null;
    jobSteps: Array<{
      id: number;
      jobStageId: number;
      stepTemplateId: number;
      status: "pending" | "in_progress" | "completed" | string;
      employeeId: number | null;
      completedAt: string | null;
      notes: string | null;
      stepTemplate: {
        id: number;
        stageId: number;
        name: string;
        orderIndex: number;
        isSkippable: boolean;
      };
    }>;
  }>;
};

type JobsListApiResponse = {
  data: JobApi[];
  meta?: {
    totalItems?: number;
    total?: number;
    page?: number;
    pageSize?: number;
  };
};

/** ---------- Helpers ---------- */
function mapStageName(
  stageId: number,
): "เคลม" | "ซ่อม" | "ตั้งเบิก" | "เสร็จสิ้น" {
  switch (stageId) {
    case 1:
      return "เคลม";
    case 2:
      return "ซ่อม";
    case 3:
      return "ตั้งเบิก";
    default:
      return "เสร็จสิ้น";
  }
}

function mapJobApiToJob(api: JobApi): Job {
  const stages =
    api.jobStages?.map((s) => ({
      id: String(s.id),
      name: mapStageName(s.stageId),
      isLocked: s.isLocked,
      isCompleted: s.isCompleted,
      startedAt: s.startedAt,
      completedAt: s.completedAt,
      steps: s.jobSteps?.map((st) => ({
        id: String(st.id),
        name: st.stepTemplate?.name ?? "",
        status: st.status,
        employeeId: st.employeeId,
        completedAt: st.completedAt,
        notes: st.notes,
        orderIndex: st.stepTemplate?.orderIndex ?? 0,
        isSkippable: st.stepTemplate?.isSkippable ?? false,
      })),
    })) ?? [];
  const {
    id,
    jobNumber,
    vehicleId,
    customerId,
    receiverId,
    insuranceCompanyId,
    paymentType,
    excessFee,
    startDate,
    estimatedEndDate,
    actualEndDate,
    repairDescription,
    notes,
    currentStageIndex,
    status,
    isFinished,
    createdAt,
    updatedAt,
  } = api;
  const job: unknown = {
    id: String(id),
    jobNumber,
    vehicleId,
    customerId,
    receiverId,
    insuranceCompanyId,
    paymentType,
    excessFee,
    startDate,
    estimatedEndDate,
    actualEndDate,
    repairDescription,
    notes,
    currentStageIndex,
    status,
    isFinished,
    createdAt,
    updatedAt,

    registration: api.vehicle?.registration ?? "",
    brand: api.vehicle?.brand ?? "",
    model: api.vehicle?.model ?? "",
    type: api.vehicle?.type ?? "",
    year: api.vehicle?.year ?? "",
    color: api.vehicle?.color ?? "",
    customerName: api.customer?.name ?? "",
    customerPhone: api.customer?.phone ?? "",
    customerAddress: api.customer?.address ?? "",

    stages,
  };

  return job as Job;
}

function buildSummary(jobs: JobApi[]): JobsSummary {
  const total = jobs.length;
  const finished = jobs.filter((j) => j.isFinished).length;
  const claim = jobs.filter(
    (j) => !j.isFinished && j.status === "CLAIM",
  ).length;
  const repair = jobs.filter(
    (j) => !j.isFinished && j.status === "REPAIR",
  ).length;
  const billing = jobs.filter(
    (j) => !j.isFinished && j.status === "BILLING",
  ).length;

  return { total, claim, repair, billing, finished };
}

export async function getJobsApi(q: JobsQuery): Promise<JobsResponse> {
  const { data } = await http.get<JobsListApiResponse>("private/jobs", {
    params: {
      page: q.page,
      pageSize: q.pageSize,

      search: q.search || undefined,
      carType: q.carType !== "ทั้งหมด" ? q.carType : undefined,
      from: q.from || undefined,
      to: q.to || undefined,
      status: q.status !== "ทั้งหมด" ? q.status : undefined,
    },
  });

  const jobsApi = data.data ?? [];
  const items = jobsApi.map(mapJobApiToJob);

  const totalItems =
    data.meta?.totalItems ?? data.meta?.total ?? jobsApi.length;

  const summary = buildSummary(jobsApi);

  return { items, totalItems, summary };
}
