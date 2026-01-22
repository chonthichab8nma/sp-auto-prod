import { Search, ChevronDown } from "lucide-react";


export default function StationsFilters({
  searchTerm,
  // selectedCarType,
  selectedStatus,
  statusOptions,
  onSearchTermChange,
  // onCarTypeChange,
  onStatusChange,
  onSubmitSearch,
}: {
  searchTerm: string;
  selectedCarType: string;
  selectedStatus: string;
  statusOptions: string[];
  onSearchTermChange: (v: string) => void;
  onCarTypeChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onSubmitSearch: () => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmitSearch();
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
      <div className="flex flex-1 gap-4 w-full md:w-auto">
        <div className="relative flex-1 md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            placeholder="ค้นหาทะเบียนรถ / เลขตัวถัง / ชื่อลูกค้า"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          onClick={onSubmitSearch}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#435EBE] hover:bg-[#3950a3] text-white rounded-lg text-sm font-medium transition-all shadow-sm"
        >
          <Search className="h-4 w-4" />
          ค้นหา
        </button>
      </div>

      <div className="flex gap-3 w-full md:w-auto">
        {/* Car type */}
        {/* <div className="relative">
          <select
            value={selectedCarType}
            onChange={(e) => onCarTypeChange(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white hover:bg-slate-50 outline-none cursor-pointer min-w-35.7"
          >
            <option value="ทั้งหมด">ประเภทรถ</option>
            {CAR_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div> */}

        {/* Status */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white hover:bg-slate-50 outline-none cursor-pointer min-w-35"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
