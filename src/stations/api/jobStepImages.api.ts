import { http } from "../../shared/lib/http";

export type UploadImageErrorApi = {
  fileName: string;
  error: string;
};

export type UploadedImageApi = {
  id: number;
  fileName: string;
  url: string;
  mimeType: string;
  fileSize: number;
};

export type UploadImagesResultApi = {
  success: number;
  failed: number;
  uploaded: UploadedImageApi[];
  errors: UploadImageErrorApi[];
};

export type JobStepImageApi = {
  id: number;
  fileName: string;
  url: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  employee?: {
    id: number;
    name: string;
  };
};

export type JobStepImagesResponseApi = {
  stepId: string;
  stepName: string;
  jobNumber: string;
  images: JobStepImageApi[];
  count: number;
};

export async function getJobStepImages(
  stepId: string,
): Promise<JobStepImagesResponseApi> {
  const res = await http.get<JobStepImagesResponseApi>(
    `/private/jobs/steps/${stepId}/images`,
  );
  return res.data;
}

export async function uploadJobStepImages(
  stepId: string,
  files: File[],
): Promise<UploadImagesResultApi> {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));

  const res = await http.post<UploadImagesResultApi>(
    `/private/jobs/steps/${stepId}/images`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return res.data;
}

export function getJobStepImageViewUrl(
  stepId: string,
  imageId: number,
): string {
  return `/api/v1/private/jobs/steps/${stepId}/images/${imageId}/view`;
}

export async function deleteJobStepImage(
  stepId: string,
  imageId: number,
): Promise<void> {
  await http.delete(
    `/private/jobs/steps/${stepId}/images/${imageId}`,
  );
}
