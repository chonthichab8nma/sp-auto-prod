import { Search } from "lucide-react";

export default function DashboardSearchInput({
  value,
  onChange,
  onSubmit,
  label = "ค้นหา",
  placeholder = "ค้นหาทะเบียนรถ",
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  label?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700 block mb-2">
        {label}
      </label>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          className="placeholder:py-2 w-full h-11 pl-10 pr-4 py-2.5
            border border-slate-200 rounded-xl
            text-sm text-slate-700
            placeholder:text-slate-400
            focus:border-blue-500
            outline-none transition-all
            hover:bg-slate-50"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
        />
      </div>
    </div>
  );
}
