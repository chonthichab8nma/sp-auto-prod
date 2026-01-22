import { http } from "../../../shared/lib/http";

export type JobsQuery = {
  page: number;
  pageSize: number;
};


export type JobStatusApi = "CLAIM" | "REPAIR" | "BILLING" | "DONE";
export type JobStepStatusApi = "pending" | "in_progress" | "completed";

export type VehicleApi = {
  id: number;
  customerId: number;
  registration: string;
  vinNumber: string | null;
  brand: string;
  model: string;
  type: string;
  year: string;
  color: string;

  registrationProvince: string | null;
  registrationProvinceCode: string | null;
  registrationDate: string | null;
  ownerProvince: string | null;
  ownerProvinceCode: string | null;
  ownerDistrict: string | null;
  ownerSubDistrict: string | null;
  ownerAddress: string | null;
  ownerPostalCode: string | null;
  engineNumber: string | null;
  chassisNumber: string | null;

  createdAt: string;
  updatedAt: string;
};

export type CustomerApi = {
  id: number;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
};

export type InsuranceCompanyApi = {
  id: number;
  name: string;
  contactPhone: string;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
};

export type StageApi = {
  id: number;
  code: string;
  name: string;
  orderIndex: number;
};

export type StepTemplateApi = {
  id: number;
  stageId: number;
  name: string;
  orderIndex: number;
  isSkippable: boolean;
};

export type EmployeeApi = {
  id: number;
  name: string;
} | null;

export type JobStepApi = {
  id: number;
  jobStageId: number;
  stepTemplateId: number;
  status: JobStepStatusApi;
  employeeId: number | null;
  completedAt: string | null;
  notes: string | null;
  stepTemplate: StepTemplateApi;
  employee: EmployeeApi;
};

export type JobStageApi = {
  id: number;
  jobId: number;
  stageId: number;
  isLocked: boolean;
  isCompleted: boolean;
  startedAt: string | null;
  completedAt: string | null;
  stage: StageApi;
  jobSteps: JobStepApi[];
};

export type JobApi = {
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
  status: JobStatusApi;
  isFinished: boolean;
  createdAt: string;
  updatedAt: string;

  vehicle: VehicleApi;
  customer: CustomerApi;
  insuranceCompany: InsuranceCompanyApi | null;

  jobStages: JobStageApi[];
  jobPhotos: unknown[];
};

export type JobsListApiResponse =
  | {
      data: JobApi[];
      meta: {
        totalItems: number;
        page: number;
        pageSize: number;
        totalPages?: number;
      };
      statusCounts?: StatusCountsApi; 
    }
  | {
      data: JobApi[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      statusCounts?: StatusCountsApi;
    };
export type StatusCountsApi = {
  all: number;
  CLAIM: number;
  REPAIR: number;
  BILLING: number;
  DONE: number;
};

export async function getJobsApi(q: JobsQuery): Promise<JobsListApiResponse> {
  const { data } = await http.get<JobsListApiResponse>("private/jobs", {
    params: {
      page: q.page,
      pageSize: q.pageSize,
    },
  });

  return data;
}

export async function getJobByIdApi(jobId: number): Promise<JobApi> {
  const { data } = await http.get<JobApi>(`private/jobs/${jobId}`);
  return data;
}
