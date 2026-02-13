import { http } from "../../../shared/lib/http";
import type { StepImageApi } from "./job.api";

export type UploadResult = {
  success: number;
  failed: number;
  uploaded: StepImageApi[];
  errors: { fileName: string; error: string }[] | null;
};

export type StepImagesResponse = {
  stepId: number;
  stepName: string;
  jobNumber: string;
  images: StepImageApi[];
  count: number;
};

export async function uploadStepImages(
  stepId: number,
  files: File[],
): Promise<UploadResult> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  const { data } = await http.post<UploadResult>(
    `private/jobs/steps/${stepId}/images`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export async function getStepImages(
  stepId: number,
): Promise<StepImagesResponse> {
  const { data } = await http.get<StepImagesResponse>(
    `private/jobs/steps/${stepId}/images`,
  );
  return data;
}

export async function deleteStepImage(
  stepId: number,
  imageId: number,
): Promise<{ message: string; imageId: number }> {
  const { data } = await http.delete<{ message: string; imageId: number }>(
    `private/jobs/steps/${stepId}/images/${imageId}`,
  );
  return data;
}
