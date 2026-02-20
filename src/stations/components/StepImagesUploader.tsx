import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";
import {
  deleteJobStepImage,
  getJobStepImages,
  getJobStepImageViewUrl,
  uploadJobStepImages,
  type JobStepImageApi,
} from "../api/jobStepImages.api";
import { confirmToast } from "../../shared/components/ui/ConfirmToast";
import toast from "react-hot-toast";
import { toThaiErrorMessage } from "../../shared/lib/errorMessage";

type UploadCategory = "image" | "receipt";
const RECEIPT_PREFIX = "__receipt__";

function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) {
    return toThaiErrorMessage(error.message, "จัดการรูปภาพไม่สำเร็จ");
  }
  return toThaiErrorMessage(error, "จัดการรูปภาพไม่สำเร็จ");
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

function isReceiptFile(fileName: string): boolean {
  return fileName.startsWith(RECEIPT_PREFIX);
}

function removeReceiptPrefix(fileName: string): string {
  return isReceiptFile(fileName)
    ? fileName.slice(RECEIPT_PREFIX.length)
    : fileName;
}

function formatFileForCategory(file: File, category: UploadCategory): File {
  const hasPrefix = isReceiptFile(file.name);
  if (category === "receipt" && !hasPrefix) {
    return new File([file], `${RECEIPT_PREFIX}${file.name}`, {
      type: file.type,
      lastModified: file.lastModified,
    });
  }
  if (category === "image" && hasPrefix) {
    return new File([file], removeReceiptPrefix(file.name), {
      type: file.type,
      lastModified: file.lastModified,
    });
  }
  return file;
}

export default function StepImagesUploader({
  stepId,
  category = "image",
  readOnly = false,
  onChanged,
}: {
  stepId: string;
  category?: UploadCategory;
  readOnly?: boolean;
  onChanged?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  // data state
  const [images, setImages] = useState<JobStepImageApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // modal state
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const hasImages = images.length > 0;
  const showSkeleton = loading && images.length === 0;

  const srcList = useMemo(() => {
    return images.map(
      (img) => img.url || getJobStepImageViewUrl(stepId, img.id),
    );
  }, [images, stepId]);

  const loadImages = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!stepId) return;
      setError(null);

      if (!opts?.silent) setLoading(true);
      try {
        const data = await getJobStepImages(stepId);
        const filtered =
          category === "receipt"
            ? data.images.filter((img) => isReceiptFile(img.fileName))
            : data.images.filter((img) => !isReceiptFile(img.fileName));
        setImages(filtered);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [stepId, category],
  );

  useEffect(() => {
    void loadImages();
  }, [loadImages]);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setError(null);
      setUploading(true);
      try {
        const normalizedFiles = Array.from(files).map((file) =>
          formatFileForCategory(file, category),
        );
        const result = await uploadJobStepImages(stepId, normalizedFiles);

        if (result.failed > 0) {
          const message = result.errors
            .map((e) => `${e.fileName}: ${e.error}`)
            .join("\n");
          setError(message);
        }

        await loadImages({ silent: true });
        onChanged?.();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setUploading(false);
      }
    },
    [stepId, loadImages, category, onChanged],
  );

  const openAt = useCallback((idx: number) => {
    setActiveIdx(idx);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const prev = useCallback(() => {
    setActiveIdx((i) => (i - 1 + srcList.length) % srcList.length);
  }, [srcList.length]);

  const next = useCallback(() => {
    setActiveIdx((i) => (i + 1) % srcList.length);
  }, [srcList.length]);

  // keyboard
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close, prev, next]);

  // hide checkpoints overlay (your global css uses body.modal-open)
  useEffect(() => {
    if (!open) return;
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, [open]);

  // lock scroll
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const handleDelete = useCallback(
    (imageId: number) => {
      confirmToast({
        title: category === "receipt" ? "ลบใบเสร็จ" : "ลบรูปภาพ",
        description:
          category === "receipt"
            ? "การลบใบเสร็จไม่สามารถกู้คืนได้"
            : "การลบรูปไม่สามารถกู้คืนได้",
        confirmText: category === "receipt" ? "ลบใบเสร็จ" : "ลบรูป",
        onConfirm: async () => {
          try {
            setDeletingId(imageId);

            const isDeletingActive = open && images[activeIdx]?.id === imageId;
            const prevCount = images.length;

            await deleteJobStepImage(stepId, imageId);
            await loadImages({ silent: true });
            onChanged?.();

            toast.success("ลบรูปเรียบร้อยแล้ว", {
              duration: 1500,
            });

            if (prevCount <= 1) {
              setOpen(false);
              setActiveIdx(0);
              return;
            }

            if (isDeletingActive) {
              setActiveIdx((cur) => Math.min(cur, prevCount - 2));
            }
          } catch (err) {
            toast.error(getErrorMessage(err));
          } finally {
            setDeletingId(null);
          }
        },
      });
    },
    [stepId, loadImages, images, activeIdx, open, category, onChanged],
  );

  const modal = open && srcList.length > 0 && (
    <div className="fixed inset-0 z-9999">
      <div className="absolute inset-0 bg-black/70" onClick={close} />

      <div className="absolute inset-0 flex items-center justify-center p-3 md:p-6">
        <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* header */}
          <div className="flex items-center justify-between border-b px-3 py-2">
            <div className="text-sm text-slate-700">
              รูปที่ {activeIdx + 1} / {srcList.length}
            </div>

            <div className="flex items-center gap-1">
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => void handleDelete(images[activeIdx].id)}
                  disabled={deletingId === images[activeIdx].id}
                  className="rounded-xl p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                  aria-label="delete"
                  title="ลบรูปนี้"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}

              <button
                type="button"
                onClick={close}
                className="rounded-xl p-2 hover:bg-slate-50"
                aria-label="close"
                title="ปิด"
              >
                <X className="h-5 w-5 text-slate-700" />
              </button>
            </div>
          </div>

          {/* image area */}
          <div
            className="relative bg-black"
            onTouchStart={(e) => {
              const t = e.touches[0];
              touch.current = { x: t.clientX, y: t.clientY };
            }}
            onTouchEnd={(e) => {
              const start = touch.current;
              if (!start) return;
              const t = e.changedTouches[0];
              const dx = t.clientX - start.x;
              const dy = t.clientY - start.y;
              touch.current = null;

              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) prev();
                else next();
              }
            }}
          >
            <div className="relative h-[60vh] w-full bg-black md:h-[70vh]">
              <img
                src={srcList[activeIdx]}
                alt="preview"
                className="absolute inset-0 h-full w-full object-contain"
                draggable={false}
              />
            </div>

            {srcList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
                  aria-label="previous"
                >
                  <ChevronLeft className="h-6 w-6 text-slate-800" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
                  aria-label="next"
                >
                  <ChevronRight className="h-6 w-6 text-slate-800" />
                </button>
              </>
            )}
          </div>

          {/* thumbnails */}
          {srcList.length > 1 && (
            <div className="border-t bg-white p-2">
              <div className="flex gap-2 overflow-auto">
                {srcList.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={[
                      "h-14 w-14 shrink-0 overflow-hidden rounded-xl border",
                      i === activeIdx
                        ? "ring-2 ring-slate-900"
                        : "opacity-80 hover:opacity-100",
                    ].join(" ")}
                  >
                    <img
                      src={src}
                      alt={`thumb-${i}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const MAX_PREVIEW = 4;
  const previewImages = images.slice(0, MAX_PREVIEW);
  const hiddenCount = Math.max(0, images.length - MAX_PREVIEW);
  const isReceipt = category === "receipt";
  const labels = isReceipt
    ? {
        title: "ใบเสร็จ",
        uploadingText: "กำลังอัปโหลดใบเสร็จ...",
        idleText: "กดรูปเพื่อดูใบเสร็จแบบเต็ม",
        addButton: "แนบใบเสร็จ",
        emptyText: "แตะเพื่อเพิ่มใบเสร็จ",
      }
    : {
        title: "รูปภาพ",
        uploadingText: "กำลังอัปโหลด...",
        idleText: "กดรูปเพื่อดูแบบเต็ม",
        addButton: "เพิ่มรูป",
        emptyText: "แตะเพื่อเพิ่มรูป",
      };

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">{labels.title}</div>
          <div className="text-xs text-slate-500">
            {uploading ? labels.uploadingText : labels.idleText}
          </div>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={[
              "inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold tracking-tight transition-colors",
              uploading
                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-100 text-slate-600">
              <ImagePlus className="h-3.5 w-3.5" />
            </span>
            {labels.addButton}
          </button>
        )}
      </div>

      {!readOnly && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
          disabled={uploading}
        />
      )}

      {error && (
        <pre className="whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </pre>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
        {!hasImages && !loading ? (
          <div
            className={[
              "rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500",
              readOnly ? "" : "cursor-pointer hover:bg-slate-50",
            ].join(" ")}
            onClick={() => {
              if (readOnly) return;
              inputRef.current?.click();
            }}
          >
            {readOnly ? "ยังไม่มีไฟล์" : labels.emptyText}
          </div>
        ) : (
          <>
            <div className="max-h-52 overflow-auto pr-1">
              <div className="grid grid-cols-4 gap-2">
                {showSkeleton
                  ? null
                  : previewImages.map((img, idx) => {
                      const src =
                        img.url || getJobStepImageViewUrl(stepId, img.id);
                      const isLastPreview =
                        idx === MAX_PREVIEW - 1 && hiddenCount > 0;

                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => openAt(idx)}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                          title="กดเพื่อดูรูป"
                        >
                          <img
                            src={src}
                            alt={removeReceiptPrefix(img.fileName)}
                            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/15" />
                          {isLastPreview && (
                            <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/55">
                              <span className="text-lg font-semibold text-white">
                                +{hiddenCount}
                              </span>
                            </div>
                          )}

                          {!readOnly && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleDelete(img.id);
                              }}
                              disabled={deletingId === img.id}
                              className={[
                                "absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1.5 text-white",
                                "opacity-100",
                                "md:opacity-0 md:group-hover:opacity-100",
                                "transition",
                                deletingId === img.id
                                  ? "cursor-not-allowed opacity-60"
                                  : "hover:bg-black/80",
                              ].join(" ")}
                              aria-label="delete"
                              title="ลบรูป"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </button>
                      );
                    })}
              </div>
            </div>

            <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
              <span>
                ทั้งหมด {images.length} {isReceipt ? "ใบเสร็จ" : "รูป"}
              </span>
              <button
                type="button"
                className="rounded-lg px-2 py-1 hover:bg-slate-50"
                onClick={() => void loadImages()}
                disabled={loading}
              >
                {loading ? "กำลังโหลด..." : "รีเฟรช"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* modal portal */}
      {modal && createPortal(modal, document.body)}
    </div>
  );
}
