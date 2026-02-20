import { http } from "../../../shared/lib/http";

export type JobReceiptUploadResponse = {
  jobId: number;
  receiptFileName: string;
  receiptUrl: string;
  receiptMimeType: string;
  receiptFileSize: number;
  receiptUploadedAt: string;
  receiptViewUrl: string;
};

async function uploadWithFieldName(
  jobId: number,
  file: File,
  fieldName: string,
): Promise<JobReceiptUploadResponse> {
  const formData = new FormData();
  formData.append(fieldName, file);

  const { data } = await http.post<JobReceiptUploadResponse>(
    `private/jobs/${jobId}/receipt`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
}

export async function uploadJobReceipt(
  jobId: number,
  file: File,
): Promise<JobReceiptUploadResponse> {
  try {
    return await uploadWithFieldName(jobId, file, "receipt");
  } catch {
    return uploadWithFieldName(jobId, file, "file");
  }
}

export async function getJobReceipt(
  jobId: number,
): Promise<JobReceiptUploadResponse> {
  const { data } = await http.get<JobReceiptUploadResponse>(
    `private/jobs/${jobId}/receipt`,
  );
  return data;
}

export async function deleteJobReceipt(jobId: number): Promise<void> {
  await http.delete(`private/jobs/${jobId}/receipt`);
}
