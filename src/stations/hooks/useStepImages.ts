import { useCallback, useEffect, useState } from "react";
import {
  getStepImages,
  uploadStepImages,
  deleteStepImage,
} from "../../features/jobs/api/upload.api";
import type { StepImageApi } from "../../features/jobs/api/job.api";

export function useStepImages(stepId: number | null) {
  const [images, setImages] = useState<StepImageApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchImages = useCallback(async () => {
    if (!stepId) return;
    setLoading(true);
    try {
      const res = await getStepImages(stepId);
      setImages(res.images);
    } catch {
      // silently fail - images are optional
    } finally {
      setLoading(false);
    }
  }, [stepId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const upload = useCallback(
    async (files: File[]) => {
      if (!stepId) return;
      setUploading(true);
      try {
        const res = await uploadStepImages(stepId, files);
        setImages((prev) => [...prev, ...res.uploaded]);
        return res;
      } finally {
        setUploading(false);
      }
    },
    [stepId],
  );

  const remove = useCallback(
    async (imageId: number) => {
      if (!stepId) return;
      await deleteStepImage(stepId, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    },
    [stepId],
  );

  return { images, loading, uploading, upload, remove, refetch: fetchImages };
}
