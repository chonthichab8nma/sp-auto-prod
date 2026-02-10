import toast from "react-hot-toast";

type ConfirmToastOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
};

export function confirmToast({
  title = "ยืนยันการดำเนินการ",
  description = "คุณแน่ใจหรือไม่?",
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  onConfirm,
}: ConfirmToastOptions) {
  toast.custom(
    (t) => (
      <div className="w-[320px] rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200">
        <div className="text-sm font-medium text-slate-800">{title}</div>
        {description && (
          <div className="mt-1 text-xs text-slate-500">{description}</div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            {cancelText}
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await onConfirm();
            }}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    ),
    { duration: Infinity },
  );
}
