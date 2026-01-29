import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
interface FormSelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> {
  label?: React.ReactNode;
  options: string[];
  placeholder?: string;
  error?: string;
  // portal?: boolean;
}

type Pos = {
  top: number;
  left: number;
  width: number;
  placement: "down" | "up";
};

const FormSelect = ({
  label,
  options,
  placeholder = "กรุณาเลือก",
  className = "",
  value,
  error,
  disabled,
  name,
  onChange,
  required,
  ...props
}: FormSelectProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);

  const stringValue = (value ?? "") as string;

  const selectedLabel = useMemo(() => {
    return options.find((o) => o === stringValue) ?? "";
  }, [options, stringValue]);

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  const commit = (next: string) => {
    onChange?.({
      target: { name: name ?? "", value: next } as any,
      currentTarget: { name: name ?? "", value: next } as any,
    } as React.ChangeEvent<HTMLSelectElement>);

    setOpen(false);
    requestAnimationFrame(() => btnRef.current?.focus());
  };

  const updatePos = () => {
    const el = btnRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const gap = 8;
    const menuMaxH = 288;
    const spaceBelow = window.innerHeight - r.bottom - gap;
    const spaceAbove = r.top - gap;

    const placement: Pos["placement"] =
      spaceBelow < Math.min(menuMaxH, 200) && spaceAbove > spaceBelow
        ? "up"
        : "down";

    const top = placement === "down" ? r.bottom + gap : r.top - gap;

    const padding = 8;
    const maxLeft = Math.max(padding, window.innerWidth - r.width - padding);
    const left = Math.min(Math.max(r.left, padding), maxLeft);

    setPos({ top, left, width: r.width, placement });
  };

  useEffect(() => {
    if (!open) return;
    updatePos();

    const onAny = () => updatePos();
    window.addEventListener("resize", onAny);
    window.addEventListener("scroll", onAny, true);

    return () => {
      window.removeEventListener("resize", onAny);
      window.removeEventListener("scroll", onAny, true);
    };
  }, [open]);

  const dropdown =
    open && !disabled && pos
      ? createPortal(
          <div
            className="fixed z-[9999]"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <div
              className={[
                "rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden",
                pos.placement === "up" ? "-translate-y-full" : "",
              ].join(" ")}
            >
              <ul className="max-h-72 overflow-auto py-1">
                {options.map((o) => {
                  const isSelected = o === stringValue;
                  return (
                    <li key={o}>
                      <button
                        type="button"
                        onClick={() => commit(o)}
                        className={[
                          "w-full text-left px-4 py-2 text-sm leading-normal",
                          "hover:bg-blue-50 hover:text-blue-700",
                          isSelected
                            ? "font-medium text-blue-700"
                            : "text-slate-800",
                        ].join(" ")}
                      >
                        {o}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="flex flex-col gap-2" ref={rootRef}>
      {label && (
        <label className="text-sm font-medium text-slate-800">{label}</label>
      )}

      <select
        {...props}
        name={name}
        value={stringValue}
        required={required}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>

      <div className="relative">
        <button
          ref={btnRef}
          type="button"
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            setOpen((v) => {
              const next = !v;
              if (!v && next) requestAnimationFrame(updatePos);
              return next;
            });
          }}
          className={`
            placeholder:py-2
    w-full h-9.75 px-4 pr-10 text-left
    bg-white border rounded-lg
    text-sm leading-normal text-slate-800
    outline-none transition-all

    flex items-center

    hover:bg-slate-50 hover:border-slate-300

    ${error ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-blue-600"}

    disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
    ${className}
  `.trim()}
        >
          <span className={selectedLabel ? "" : "text-slate-400"}>
            {selectedLabel || placeholder}
          </span>

          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
        {dropdown}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default FormSelect;
