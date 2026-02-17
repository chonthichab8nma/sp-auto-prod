import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { StepStatus } from "../../Type";
import { patchJobStepStatus } from "../api/jobSteps.api";
import { Pencil } from "lucide-react";
import { toThaiErrorMessage } from "../../shared/lib/errorMessage";

type StepRemarkPanelProps = {
  stepId: number;
  status: StepStatus;
  employeeId?: number;
  initialRemark?: string | null;
  onSaved?: (remark: string) => void;
  variant?: "default" | "minimal";
};

export default function StepRemarkPanel({
  stepId,
  status,
  employeeId,
  initialRemark,
  onSaved,
  variant = "default",
}: StepRemarkPanelProps) {
  const initial = initialRemark ?? "";

  const [remark, setRemark] = useState(initial);
  const [savedRemark, setSavedRemark] = useState(initial);
  const [saving, setSaving] = useState(false);

  const [isEditing, setIsEditing] = useState<boolean>(!initial.trim());

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const needsEmployee = status === "in_progress" || status === "completed";
  const dirty = useMemo(() => remark !== savedRemark, [remark, savedRemark]);

  const canSave = useMemo(() => {
    if (!dirty) return false;
    if (saving) return false;
    if (needsEmployee && !employeeId) return false;
    return true;
  }, [dirty, saving, needsEmployee, employeeId]);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    const v = initialRemark ?? "";
    setRemark(v);
    setSavedRemark(v);

    const nextIsEditing = !v.trim();
    setIsEditing(nextIsEditing);

    if (nextIsEditing) {
      requestAnimationFrame(() => autoResize());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId, initialRemark, autoResize]);

  useEffect(() => {
    if (!isEditing) return;
    autoResize();
  }, [remark, autoResize, isEditing]);

  const onSave = useCallback(async () => {
    try {
      setSaving(true);

      const trimmed = remark.trim();

      await patchJobStepStatus(stepId, {
        status,
        employeeId,
        remark: trimmed,
      });

      setSavedRemark(trimmed);
      toast.success("บันทึกหมายเหตุแล้ว", { duration: 1500 });

      setIsEditing(false);
      onSaved?.(trimmed);
    } catch (err) {
      const msg = toThaiErrorMessage(err, "บันทึกหมายเหตุไม่สำเร็จ");
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [stepId, status, employeeId, remark, onSaved]);

  const onEdit = useCallback(() => {
    setIsEditing(true);
    requestAnimationFrame(() => autoResize());
  }, [autoResize]);

  const onCancelEdit = useCallback(() => {
    setRemark(savedRemark);
    setIsEditing(false);
  }, [savedRemark]);

  if (!isEditing) {
    if (variant === "minimal") {
      return (
        <div className="text-sm text-slate-700">
          <span className="font-medium text-slate-800">หมายเหตุ:</span>{" "}
          {savedRemark.trim() ? (
            <span className="whitespace-pre-wrap break-words">{savedRemark}</span>
          ) : (
            <span className="text-slate-400">ยังไม่มีหมายเหตุ</span>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="ml-2 inline-flex items-center gap-1 text-slate-400 hover:text-slate-700"
            aria-label="แก้ไขหมายเหตุ"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="text-xs">แก้ไข</span>
          </button>
        </div>
      );
    }

    return (
      <div className="text-sm text-slate-700">
        <span className="font-medium text-slate-800">หมายเหตุ:</span>{" "}
        {savedRemark.trim() ? (
          <span className="inline-flex items-center gap-1 whitespace-pre-wrap">
            {savedRemark}
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center text-slate-400 hover:text-slate-700"
              aria-label="แก้ไขหมายเหตุ"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700"
          >
            —
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div>
        <div className="text-sm font-semibold text-slate-600">
          หมายเหตุ
        </div>

        <textarea
          ref={textareaRef}
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          rows={1}
          placeholder="ระบุรายละเอียดคำขอถึงร้าน"
          className={[
            "mt-3 w-full resize-none bg-transparent text-sm leading-relaxed",
            "border-0 border-b border-slate-200",
            "px-0 py-2",
            "text-slate-700 placeholder:text-slate-300",
            "outline-none",
            "focus:border-slate-300",
            "focus:ring-0",
          ].join(" ")}
        />

        <div className="mt-2 flex items-center justify-between gap-3 text-xs">
          <div className="min-h-4.5">
            {needsEmployee && !employeeId ? (
              <span className="text-red-600">
                ต้องเลือกผู้ดำเนินการก่อนจึงจะบันทึกหมายเหตุได้
              </span>
            ) : dirty ? (
              <span className="text-amber-600">มีการแก้ไขที่ยังไม่บันทึก</span>
            ) : (
              <span className="text-slate-400"> </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => void onSave()}
            disabled={!canSave}
            className={[
              "rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium transition",
              !canSave
                ? "cursor-not-allowed text-slate-300"
                : "text-slate-700 hover:bg-slate-100",
            ].join(" ")}
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-slate-800">หมายเหตุ</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            disabled={saving}
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={() => void onSave()}
            disabled={!canSave}
            className={[
              "rounded-xl border px-3 py-2 text-sm transition",
              !canSave
                ? "cursor-not-allowed bg-slate-50 text-slate-400"
                : "bg-white text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>

      <div className="mt-3">
        {/* ตรงนี้ถ้าเธอจะเปลี่ยนเป็น Textarea ค่อยแทนที่ภายหลัง */}
        <textarea
          ref={textareaRef}
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          rows={2}
          placeholder="เช่น รอยบุบด้านซ้าย ต้องรออะไหล่ ลูกค้าขอรับรถวันศุกร์..."
          className={[
            "w-full resize-none bg-transparent text-sm leading-relaxed",
            "border-0 border-b border-slate-300",
            "px-0 py-2",
            "outline-none",
            "focus:border-slate-600",
            "focus:ring-0",
          ].join(" ")}
        />

        <div className="mt-2 flex items-start justify-between gap-3">
          <div className="min-h-4.5 text-xs">
            {needsEmployee && !employeeId ? (
              <span className="text-red-600">
                ต้องเลือกผู้ดำเนินการก่อนจึงจะบันทึกหมายเหตุได้
              </span>
            ) : dirty ? (
              <span className="text-amber-600">มีการแก้ไขที่ยังไม่บันทึก</span>
            ) : (
              <span className="text-slate-400"> </span>
            )}
          </div>

          <div className="text-xs text-slate-400">{remark.length} ตัวอักษร</div>
        </div>
      </div>
    </div>
  );
}
