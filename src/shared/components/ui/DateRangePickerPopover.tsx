import React, { useMemo, useState } from "react";
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

  const selectedSingle = useMemo(() => {
    if (props.mode !== "single") return undefined;
    return toDate(props.value);
  }, [props.mode, props.mode === "single" ? props.value : ""]);

  const selectedRange: DateRange | undefined = useMemo(() => {
    if (props.mode !== "range") return undefined;
    const from = toDate(props.value.startDate);
    const to = toDate(props.value.endDate);
    if (!from && !to) return undefined;
    return { from, to };
  }, [
    props.mode,
    props.mode === "range" ? props.value.startDate : "",
    props.mode === "range" ? props.value.endDate : "",
  ]);

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
    return `${format(r.from, "PPP", { locale: th })}–${format(r.to, "PPP", { locale: th })}`;
  }, [props.mode, selectedSingle, selectedRange]);

  const buttonText = useMemo(() => {
    if (props.mode === "single") {
      if (!selectedSingle) return placeholder;
      return format(selectedSingle, "dd/MM/yyyy");
    }

    const r = selectedRange;
    if (!r?.from) return placeholder;
    if (!r.to) return format(r.from, "dd/MM/yyyy");
    return `${format(r.from, "dd/MM/yyyy")} - ${format(r.to, "dd/MM/yyyy")}`;
  }, [props.mode, placeholder, selectedSingle, selectedRange]);

  const onReset = () => {
    if (props.mode === "single") props.onChange("");
    else props.onChange({ startDate: "", endDate: "" });
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
            "w-full h-11 px-4 rounded-xl border text-sm font-medium transition-colors",
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
          {/* <span className="text-slate-400">▾</span> */}
        </button>

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

        {open && !disabled && (
          <>
            {/* backdrop */}
            <button
              type="button"
              aria-label="close"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setOpen(false)}
            />
            {/* popover */}
            <div className="absolute z-50 mt-2 w-[320px] rounded-2xl border border-slate-200 bg-white shadow-lg p-3">
              {props.mode === "single" ? (
                <DayPicker
                  mode="single"
                  defaultMonth={defaultMonth}
                  selected={selectedSingle}
                  onSelect={(d) => {
                    props.onChange(d ? toYmd(d) : "");
                    if (d) setOpen(false);
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
                    props.onChange({ startDate: nextStart, endDate: nextEnd });
                  }}
                  locale={th}
                  footer={
                    <div className="pt-2 text-sm text-slate-700">{footer}</div>
                  }
                />
              )}

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onReset}
                  className="px-3 py-2 text-sm rounded-xl border border-slate-200 hover:bg-slate-50"
                >
                  ล้างวันที่
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700"
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
