import React, { useEffect, useMemo, useRef, useState } from "react";
import type { EmployeeApi } from "../../../stations/api/employees.api";
import { getEmployeesApi } from "../../../stations/api/employees.api";

type Props = {
  label?: React.ReactNode;
  required?: boolean;

  value: EmployeeApi | null;
  onChange: (emp: EmployeeApi | null) => void;

  placeholder?: string;
  disabled?: boolean;

  error?: string | null;

  className?: string;
  inputClassName?: string;
  dropdownClassName?: string;

  limit?: number;
  minQueryLength?: number;
  debounceMs?: number;
};

export default function EmployeeAutocomplete({
  label,
  required,
  value,
  onChange,
  placeholder = "ค้นหาพนักงาน",
  disabled = false,
  error,
  className = "",
  inputClassName = "",
  dropdownClassName = "",
  limit = 50,
  minQueryLength = 1,
  debounceMs = 250,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [query, setQuery] = useState<string>(value?.name ?? "");
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<EmployeeApi[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (!open) setQuery(value?.name ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.id]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => window.clearTimeout(t);
  }, [query, debounceMs]);

  useEffect(() => {
    if (disabled) return;

    const q = debouncedQuery.trim();

    if (value && q !== value.name) onChange(null);

    if (q.length < minQueryLength) {
      setOptions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getEmployeesApi({ q, page: 1, limit })
      .then((res) => {
        if (cancelled) return;
        setOptions(res.data ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setOptions([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, disabled, limit, minQueryLength]);

  const showDropdown = useMemo(() => {
    if (disabled) return false;
    const q = query.trim();
    if (!open) return false;
    if (q.length < minQueryLength) return false;
    return loading || options.length > 0;
  }, [disabled, query, minQueryLength, open, loading, options.length]);

  const commit = (emp: EmployeeApi) => {
    onChange(emp);
    setQuery(emp.name);
    setOpen(false);
    setActiveIndex(-1);
  };

  const inputBorder = error
    ? "border-red-300 bg-red-50 focus:border-red-500"
    : "border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label ? (
        <label className="block mb-2 text-sm font-medium text-slate-700">
          {label} {required ? <span className="text-red-500">*</span> : null}
        </label>
      ) : null}

      <input
        type="text"
        value={query}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setOpen(true);
          setActiveIndex(-1);
          setQuery(e.target.value);
        }}
        onKeyDown={(e) => {
          if (!showDropdown) return;

          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, options.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter") {
            if (activeIndex >= 0 && activeIndex < options.length) {
              e.preventDefault();
              commit(options[activeIndex]);
            }
          } else if (e.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
          }
        }}
        className={[
          "w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all placeholder:text-slate-400",
          inputBorder,
          disabled ? "opacity-60 cursor-not-allowed" : "",
          inputClassName,
        ].join(" ")}
        aria-invalid={!!error}
        aria-autocomplete="list"
      />

      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}

      {showDropdown ? (
        <div
          className={[
            "absolute z-20 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden",
            dropdownClassName,
          ].join(" ")}
        >
          {loading ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              กำลังค้นหา...
            </div>
          ) : options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">ไม่พบพนักงาน</div>
          ) : (
            <ul className="max-h-64 overflow-auto">
              {options.map((emp, idx) => (
                <li key={emp.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => commit(emp)}
                    className={[
                      "w-full text-left px-4 py-3 flex items-center justify-between",
                      idx === activeIndex ? "bg-slate-50" : "hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">
                        {emp.name}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">#{emp.id}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {value ? (
        <div className="mt-1 text-xs text-slate-500">
          เลือกแล้ว: {value.name}
        </div>
      ) : null}
    </div>
  );
}
