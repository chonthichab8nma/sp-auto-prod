import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
}

export default function FormInput({
  label,
  type = "text",
  error,
  className = "",
  ...props
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-slate-800">{label}</label>
      )}

      <input
        type={type}
        {...props}
        className={`
          placeholder:py-2
          w-full px-4 py-2 bg-white 
          border rounded-lg 
          text-sm text-slate-800
          outline-none
          transition-all

          hover:bg-slate-50 hover:border-slate-300

          ${
            error
              ? "border-red-500  focus:border-red-500"
              : "border-slate-200 focus:border-blue-600"
          }

          disabled:bg-slate-50 disabled:text-slate-400
    ${className}
  `.trim()}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
