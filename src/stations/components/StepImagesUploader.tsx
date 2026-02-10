import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ImagePlus, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getJobStepImages,
  getJobStepImageViewUrl,
  uploadJobStepImages,
  type JobStepImageApi,
} from "../api/jobStepImages.api";

function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) return error.message;
  return "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

export default function StepImagesUploader({ stepId }: { stepId: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [images, setImages] = useState<JobStepImageApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ modal state
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const hasImages = useMemo(() => images.length > 0, [images.length]);

  const srcList = useMemo(() => {
    return images.map(
      (img) => img.url || getJobStepImageViewUrl(stepId, img.id),
    );
  }, [images, stepId]);

  async function loadImages(opts?: { silent?: boolean }): Promise<void> {
    if (!stepId) return;
    setError(null);

    if (!opts?.silent) setLoading(true);

    try {
      const data = await getJobStepImages(stepId);
      setImages(data.images);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }

  useEffect(() => {
    void loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId]);

  async function handleFiles(files: FileList | null): Promise<void> {
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);
    try {
      const result = await uploadJobStepImages(stepId, Array.from(files));

      if (result.failed > 0) {
        const message = result.errors
          .map((e) => `${e.fileName}: ${e.error}`)
          .join("\n");
        setError(message);
      }

      await loadImages({ silent: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  const openAt = useCallback((idx: number) => {
    setActiveIdx(idx);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);
  const prev = useCallback(
    () => setActiveIdx((i) => (i - 1 + srcList.length) % srcList.length),
    [srcList.length],
  );
  const next = useCallback(
    () => setActiveIdx((i) => (i + 1) % srcList.length),
    [srcList.length],
  );

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

  const touch = useRef<{ x: number; y: number } | null>(null);
  const showSkeleton = loading && images.length === 0;
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-slate-800">รูปภาพ</div>
          <div className="text-xs text-slate-500">
            {uploading
              ? "กำลังอัปโหลด..."
              : "รองรับหลายรูป • กดรูปเพื่อดูแบบเต็ม"}
          </div>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={[
            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
            uploading
              ? "cursor-not-allowed bg-slate-50 text-slate-400"
              : "bg-white text-slate-400 hover:bg-slate-50",
          ].join(" ")}
        >
          <ImagePlus className="h-4 w-4" />
          เพิ่มรูป
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
        disabled={uploading}
      />

      {error && (
        <pre className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 whitespace-pre-wrap">
          {error}
        </pre>
      )}

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
        {!hasImages && !loading ? (
          <div
            className="cursor-pointer rounded-2xl border border-dashed p-4 text-center text-sm text-slate-400 hover:bg-slate-50"
            onClick={() => inputRef.current?.click()}
          >
            ยังไม่มีรูป • แตะเพื่อเพิ่มรูป
          </div>
        ) : (
          <>
            <div className="max-h overflow-auto pr-1">
              <div className="grid grid-cols-3 gap-2">
                {showSkeleton
                  ? null
                  : images.map((img, idx) => {
                      const src =
                        img.url || getJobStepImageViewUrl(stepId, img.id);

                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => openAt(idx)}
                          className="group relative aspect-square overflow-hidden rounded-xl border bg-slate-50"
                          title="กดเพื่อดูรูป"
                        >
                          <img
                            src={src}
                            alt={img.fileName}
                            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/15" />
                        </button>
                      );
                    })}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>ทั้งหมด {images.length} รูป</span>
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

      {open && srcList.length > 0 && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={close} />

          <div className="absolute inset-0 flex items-center justify-center p-3 md:p-6">
            <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <div className="text-sm text-slate-700">
                  รูปที่ {activeIdx + 1} / {srcList.length}
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-xl p-2 hover:bg-slate-50"
                  aria-label="close"
                >
                  <X className="h-5 w-5 text-slate-700" />
                </button>
              </div>

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

                  // swipe left/right (กันเลื่อนแนวตั้ง)
                  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                    if (dx > 0) prev();
                    else next();
                  }
                }}
              >
                <img
                  src={srcList[activeIdx]}
                  alt="preview"
                  className="mx-auto max-h-[70vh] w-auto select-none object-contain"
                  draggable={false}
                />

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

              {/* thumbnail strip */}
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

                  <div className="mt-1 text-[11px] text-slate-500">
                    ปัดซ้าย/ขวาบนมือถือ • กดลูกศรบนคีย์บอร์ดได้
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
