import { Loader2, X } from "lucide-react";
import ModalPortal from "../../../../shared/components/ui/ModalPortal";
import Skeleton from "../../../../shared/components/ui/Skeleton";

export function SectionWrapper({
  title,
  description,
  headerAction,
  children,
}: {
  title: string;
  description: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </div>
        {description ? (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  type?: "text" | "password";
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-800">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition hover:border-slate-300 hover:bg-slate-50 focus:border-blue-600"
      />
    </div>
  );
}

export function FormModal({
  title,
  onClose,
  disableClose = false,
  children,
}: {
  title: string;
  onClose: () => void;
  disableClose?: boolean;
  children: React.ReactNode;
}) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50">
        <button
          type="button"
          className="absolute inset-0 bg-black/45"
          onClick={() => {
            if (disableClose) return;
            onClose();
          }}
          aria-label="close modal"
        />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative flex w-full max-w-[720px] max-h-[92vh] flex-col rounded-none border border-slate-200 bg-white p-6 shadow-2xl md:aspect-square md:p-7">
            <div className="mb-5 flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
              <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
              <button
                type="button"
                onClick={() => {
                  if (disableClose) return;
                  onClose();
                }}
                disabled={disableClose}
                className="p-1 text-slate-700 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="ปิด"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-1">{children}</div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[60]">
        <button
          type="button"
          className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]"
          onClick={() => {
            if (loading) return;
            onClose();
          }}
          aria-label="close confirm modal"
        />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
              <button
                type="button"
                onClick={() => {
                  if (loading) return;
                  onClose();
                }}
                disabled={loading}
                className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="ปิด"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">{message}</p>
            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

export function EmployeeSectionSkeleton() {
  return (
    <SectionWrapper
      title="จัดการพนักงาน"
      description=""
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={`employee-input-skeleton-${index}`} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <div className="md:col-span-2 xl:col-span-5 flex justify-end">
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
        <div className="grid min-w-[720px] grid-cols-5 gap-3 bg-slate-50 px-3 py-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <div className="flex justify-end">
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="space-y-0">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`employee-row-skeleton-${index}`}
              className="grid min-w-[720px] grid-cols-5 gap-3 border-t border-slate-200 px-3 py-3"
            >
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-36" />
              <div className="flex justify-end">
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
