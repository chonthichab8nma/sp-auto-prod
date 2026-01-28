import React, { useEffect, useMemo, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, parseISO, isValid } from "date-fns";
import { th } from "date-fns/locale";

type BaseProps = {
  label?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  triggerClassName?: string;
  icon?: React.ReactNode;
};

type SingleProps = BaseProps & {
  mode: "single";
  value: string;
  onChange: (next: string) => void; 
};

type RangeValue = { startDate: string; endDate: string };
type RangeProps = BaseProps & {
  mode: "range";
  value: RangeValue; 
  onChange: (next: RangeValue) => void; 
};

type Props = SingleProps | RangeProps;

function toDate(v: string): Date | undefined {
  if (!v) return undefined;
  const d = parseISO(v);
  return isValid(d) ? d : undefined;
}

function toYmd(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function isSameRange(a: RangeValue, b: RangeValue) {
  return a.startDate === b.startDate && a.endDate === b.endDate;
}

export default function DatePickerPopover(props: Props) {
  const {
    label,
    placeholder = props.mode === "single" ? "เลือกวันที่" : "เลือกช่วงวันที่",
    disabled,
    className,
    error,
    triggerClassName,
    icon,
  } = props;

  const [open, setOpen] = useState(false);

  const [draftSingle, setDraftSingle] = useState<string>("");
  const [draftRange, setDraftRange] = useState<RangeValue>({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (!open) return;
    if (props.mode === "single") {
      setDraftSingle(props.value ?? "");
    } else {
      setDraftRange({
        startDate: props.value.startDate ?? "",
        endDate: props.value.endDate ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectedSingle = useMemo(() => {
    if (props.mode !== "single") return undefined;
    return toDate(draftSingle);
  }, [props.mode, draftSingle]);

  const selectedRange: DateRange | undefined = useMemo(() => {
    if (props.mode !== "range") return undefined;
    const from = toDate(draftRange.startDate);
    const to = toDate(draftRange.endDate);
    if (!from && !to) return undefined;
    return { from, to };
  }, [props.mode, draftRange.startDate, draftRange.endDate]);

  const defaultMonth = useMemo(() => {
    if (props.mode === "single") return selectedSingle ?? new Date();
    return selectedRange?.from ?? new Date();
  }, [props.mode, selectedSingle, selectedRange?.from]);

  const footer = useMemo(() => {
    if (props.mode === "single") {
      if (!selectedSingle) return "กรุณาเลือกวันที่";
      return format(selectedSingle, "PPP", { locale: th });
    }

    const r = selectedRange;
    if (!r?.from) return "กรุณาเลือกวันเริ่มต้น";
    if (!r.to) return format(r.from, "PPP", { locale: th });
    return `${format(r.from, "PPP", { locale: th })}–${format(r.to, "PPP", {
      locale: th,
    })}`;
  }, [props.mode, selectedSingle, selectedRange]);


  const buttonText = useMemo(() => {
    if (props.mode === "single") {
      const v = open ? draftSingle : props.value;
      const d = toDate(v);
      if (!d) return placeholder;
      return format(d, "dd/MM/yyyy");
    }

    const v = open ? draftRange : props.value;
    const from = toDate(v.startDate);
    const to = toDate(v.endDate);
    if (!from) return placeholder;
    if (!to) return format(from, "dd/MM/yyyy");
    return `${format(from, "dd/MM/yyyy")} - ${format(to, "dd/MM/yyyy")}`;
  }, [props.mode, open, draftSingle, draftRange, props.value, placeholder]);

  const onResetDraft = () => {
    if (props.mode === "single") setDraftSingle("");
    else setDraftRange({ startDate: "", endDate: "" });
  };

  const onDone = () => {
    if (props.mode === "single") {
      if (draftSingle !== props.value) props.onChange(draftSingle);
    } else {
      if (!isSameRange(draftRange, props.value)) props.onChange(draftRange);
    }
    setOpen(false);
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-medium text-slate-800 block leading-5 mb-2 min-h-[20px] md:min-h-[44px] lg:min-h-[20px]">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className={[
            "relative",
            "w-full h-11 px-4 rounded-xl border text-sm font-normal transition-colors",
            "flex items-center justify-between",
            icon ? "pl-10 pr-4" : "px-4",
            error
              ? "border-red-500 text-slate-400 bg-white"
              : "border-slate-200 text-slate-400 bg-white hover:bg-slate-50",
            disabled ? "opacity-60 cursor-not-allowed" : "",
            triggerClassName ?? "",
          ].join(" ")}
          aria-invalid={!!error}
        >
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </span>
          )}
          <span className="truncate">{buttonText}</span>
        </button>

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

        {open && !disabled && (
          <>
            {/* backdrop */}
            <button
              type="button"
              aria-label="close"
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setOpen(false)}
            />

            <div
              className={[
                "fixed inset-x-0 bottom-0 z-50",
                "rounded-t-2xl border border-slate-200 bg-white shadow-lg",
                "p-3",
                "max-h-[85vh] overflow-auto",
                "md:absolute md:inset-auto md:bottom-auto md:mt-2",
                "md:w-90 md:rounded-2xl md:max-h-none md:overflow-visible",
              ].join(" ")}
            >
              {/* handle (mobile) */}
              <div className="md:hidden mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-200" />

              {props.mode === "single" ? (
                <DayPicker
                  mode="single"
                  defaultMonth={defaultMonth}
                  selected={selectedSingle}
                  onSelect={(d) => {
                    setDraftSingle(d ? toYmd(d) : "");
                  }}
                  locale={th}
                  footer={
                    <div className="pt-2 text-sm text-slate-700">{footer}</div>
                  }
                />
              ) : (
                <DayPicker
                  mode="range"
                  defaultMonth={defaultMonth}
                  selected={selectedRange}
                  onSelect={(r) => {
                    const nextStart = r?.from ? toYmd(r.from) : "";
                    const nextEnd = r?.to ? toYmd(r.to) : "";
                    setDraftRange({ startDate: nextStart, endDate: nextEnd });
                  }}
                  locale={th}
                  footer={
                    <div className="pt-2 text-sm text-slate-700">{footer}</div>
                  }
                />
              )}

              <div className="pt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={onResetDraft}
                  className="flex-1 md:flex-none px-3 py-2 text-sm rounded-xl border border-slate-200 hover:bg-slate-50"
                >
                  ล้างวันที่
                </button>

                <button
                  type="button"
                  onClick={onDone}
                  className="flex-1 md:flex-none px-3 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

