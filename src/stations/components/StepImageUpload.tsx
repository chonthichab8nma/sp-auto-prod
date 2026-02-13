import { useRef, useState, useEffect } from "react";
import { ImagePlus, Trash2, Loader2, ImageOff, X } from "lucide-react";
import toast from "react-hot-toast";
import { useStepImages } from "../hooks/useStepImages";
import type { StepImageApi } from "../../features/jobs/api/job.api";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/** Resolve image src: prefer viewUrl (backend proxy) over direct R2 url */
function resolveImageSrc(img: StepImageApi): string {
  if (img.viewUrl) return `${API_BASE}${img.viewUrl}`;
  return img.url;
}

/** Local preview for files being uploaded */
type LocalPreview = { file: File; objectUrl: string };

export default function StepImageUpload({ stepId }: { stepId: number | null }) {
  const { images, loading, uploading, upload, remove } =
    useStepImages(stepId);
  const fileRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<LocalPreview[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.objectUrl));
    };
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const arr = Array.from(files);
    const valid = arr.filter((f) => {
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name}: ไฟล์ใหญ่เกิน 10MB`);
        return false;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
        toast.error(`${f.name}: รองรับเฉพาะ jpg, png, webp`);
        return false;
      }
      return true;
    });
    if (!valid.length) return;

    // Show local previews immediately
    const localPreviews = valid.map((file) => ({
      file,
      objectUrl: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...localPreviews]);

    try {
      const res = await upload(valid);
      if (res && res.failed > 0 && res.errors) {
        res.errors.forEach((e) => toast.error(`${e.fileName}: ${e.error}`));
      }
      if (res && res.success > 0) {
        toast.success(`อัปโหลด ${res.success} รูปสำเร็จ`);
      }
    } catch {
      toast.error("อัปโหลดไม่สำเร็จ");
    }

    // Clean up local previews after upload completes (server images replace them)
    localPreviews.forEach((p) => URL.revokeObjectURL(p.objectUrl));
    setPreviews((prev) =>
      prev.filter((p) => !localPreviews.includes(p)),
    );

    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = async (imageId: number) => {
    try {
      await remove(imageId);
      toast.success("ลบรูปสำเร็จ");
    } catch {
      toast.error("ลบรูปไม่สำเร็จ");
    }
  };

  if (!stepId) return null;

  const hasImages = images.length > 0 || previews.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">
          รูปภาพ {images.length > 0 && `(${images.length})`}
        </label>
        {uploading && (
          <Loader2 size={14} className="animate-spin text-blue-500" />
        )}
      </div>

      {/* Upload area */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
        disabled={uploading}
        className="w-full border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center gap-2 text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors disabled:opacity-50"
      >
        <ImagePlus size={20} />
        <span className="text-xs">
          {uploading ? "กำลังอัปโหลด..." : "คลิกหรือลากรูปมาวาง"}
        </span>
      </button>

      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Gallery */}
      {loading ? (
        <div className="text-xs text-slate-400 text-center py-2">
          กำลังโหลดรูป...
        </div>
      ) : hasImages ? (
        <div className="grid grid-cols-3 gap-2">
          {/* Local previews (uploading) */}
          {previews.map((p, idx) => (
            <div
              key={`preview-${idx}`}
              className="relative aspect-square rounded-lg border border-blue-200 overflow-hidden"
            >
              <img
                src={p.objectUrl}
                alt={p.file.name}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2
                  size={20}
                  className="animate-spin text-blue-500"
                />
              </div>
            </div>
          ))}

          {/* Server images */}
          {images.map((img) => {
            const src = resolveImageSrc(img);
            return (
            <div key={img.id} className="relative group aspect-square">
              <ImageThumb
                src={src}
                alt={img.fileName}
                onClick={() => setLightbox(src)}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(img.id);
                }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                <Trash2 size={12} />
              </button>
            </div>
            );
          })}
        </div>
      ) : null}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
          >
            <X size={20} />
          </button>
          <img
            src={lightbox}
            alt="preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

/** Image thumbnail with error fallback */
function ImageThumb({
  src,
  alt,
  onClick,
}: {
  src: string;
  alt: string;
  onClick?: () => void;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className="w-full h-full rounded-lg border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-1">
        <ImageOff size={16} />
        <span className="text-[10px] truncate max-w-full px-1">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
      onError={() => setErrored(true)}
      onClick={onClick}
    />
  );
}
