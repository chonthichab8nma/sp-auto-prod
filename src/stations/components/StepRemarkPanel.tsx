import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { StepStatus } from "../../Type";
import { patchJobStepStatus } from "../api/jobSteps.api";

type StepRemarkPanelProps = {
  stepId: number;
  status: StepStatus;
  employeeId?: number;
  initialRemark?: string | null;
  onSaved?: (remark: string) => void;
};

export default function StepRemarkPanel({
  stepId,
  status,
  employeeId,
  initialRemark,
  onSaved,
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
      const msg =
        err instanceof Error ? err.message : "บันทึกหมายเหตุไม่สำเร็จ";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [stepId, status, employeeId, remark,onSaved]);

  const onEdit = useCallback(() => {
    setIsEditing(true);
    requestAnimationFrame(() => autoResize());
  }, [autoResize]);

  const onCancelEdit = useCallback(() => {
    setRemark(savedRemark); 
    setIsEditing(false);
  }, [savedRemark]);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-slate-800">หมายเหตุ</div>
        </div>


        {isEditing ? (
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
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            แก้ไข
          </button>
        )}
      </div>


      {!isEditing ? (
        <div className="mt-3 text-sm text-slate-700">
          <span className="font-medium text-slate-800">หมายเหตุ:</span>{" "}
          {savedRemark.trim() ? (
            <span className="whitespace-pre-wrap">{savedRemark}</span>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </div>
      ) : (

        <div className="mt-3">
          <textarea
            ref={textareaRef}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={3}
            placeholder="เช่น รอยบุบด้านซ้าย ต้องรออะไหล่ ลูกค้าขอรับรถวันศุกร์..."
            className={[
              "w-full resize-none rounded-xl border px-3 py-2 text-sm leading-relaxed",
              "outline-none focus:ring-2 focus:ring-slate-900/10",
              "min-h-21 max-h-[40vh] overflow-auto",
            ].join(" ")}
          />

          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="min-h-4.5 text-xs">
              {needsEmployee && !employeeId ? (
                <span className="text-red-600">
                  ต้องเลือกผู้ดำเนินการก่อนจึงจะบันทึกหมายเหตุได้
                </span>
              ) : dirty ? (
                <span className="text-amber-600">
                  มีการแก้ไขที่ยังไม่บันทึก
                </span>
              ) : (
                <span className="text-slate-400"> </span>
              )}
            </div>

            <div className="text-xs text-slate-400">
              {remark.length} ตัวอักษร
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
