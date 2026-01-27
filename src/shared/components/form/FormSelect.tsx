import React from "react";

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode;
  options: string[];
  placeholder?: string;
  error?: string;
}

const FormSelect = ({
  label,
  options,
  placeholder = "กรุณาเลือก",
  className = "",
  value,
  error,
  ...props
}: FormSelectProps) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-slate-800">{label}</label>
      )}

      <div className="relative">
        <select
          {...props}
          value={value}
          className={`
             w-full px-4 py-2 bg-white
              border rounded-lg
              text-sm text-slate-800
              outline-none appearance-none
              transition-all cursor-pointer

            hover:bg-slate-50 hover:border-slate-300

            ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-slate-200 focus:border-blue-600"
            }

            border-slate-200 focus:border-blue-600"
            disabled:bg-slate-50 disabled:text-slate-400
            ${value === "" ? "text-slate-400" : ""} 
            ${className}
          `.trim()}
        >
          <option value="" disabled>
            {placeholder}
          </option>

          {options.map((option, index) => (
            <option key={index} value={option} className="text-slate-800">
              {option}
            </option>
          ))}
        </select>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
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
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default FormSelect;
