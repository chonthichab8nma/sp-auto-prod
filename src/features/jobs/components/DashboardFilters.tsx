import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, Check, Search } from "lucide-react";
import { CAR_TYPES } from "../../../data";
import { useNavigate } from "react-router-dom";

export default function DashboardFilters({
  searchTerm,
  selectedCarType,
  startDate,
  endDate,
  onSearchTermChange,
  onCarTypeChange,
  onStartDateChange,
  onEndDateChange,
  onSubmitSearch,
}: {
  searchTerm: string;
  selectedCarType: string;
  startDate: string;
  endDate: string;
  onSearchTermChange: (v: string) => void;
  onCarTypeChange: (v: string) => void;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onSubmitSearch: () => void;
}) {
  const navigate = useNavigate();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const datePickerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsTypeDropdownOpen(false);
      }
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmitSearch();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
      {/* Search */}
      <div className="lg:col-span-3">
        <label className="text-sm font-semibold text-slate-700 block mb-2">
          ค้นหา
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            placeholder="ค้นหาทะเบียนรถ / ชื่อลูกค้า"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {/* Car type dropdown */}
      <div className="lg:col-span-3 relative" ref={dropdownRef}>
        <label className="text-sm font-semibold text-slate-700 block mb-2">
          ประเภทรถ
        </label>

        <button
          onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
          className={`w-full flex items-center justify-between border rounded-xl px-4 py-2.5 text-sm transition-colors ${
            isTypeDropdownOpen
              ? "border-blue-500 bg-blue-50/50 text-blue-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span>{selectedCarType}</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              isTypeDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isTypeDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-lg z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                onCarTypeChange("ทั้งหมด");
                setIsTypeDropdownOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 text-slate-600 flex items-center justify-between"
            >
              <span>ทั้งหมด</span>
              {selectedCarType === "ทั้งหมด" && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </button>

            {CAR_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => {
                  onCarTypeChange(type);
                  setIsTypeDropdownOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 text-slate-600 flex items-center justify-between"
              >
                <span>{type}</span>
                {selectedCarType === type && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date picker */}
      <div className="lg:col-span-3 relative" ref={datePickerRef}>
        <label className="text-sm font-semibold text-slate-700 block mb-2">
          เลือกวันที่
        </label>

        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="w-full flex items-center justify-between border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 bg-white hover:bg-slate-50 transition-colors"
        >
          <span>
            {startDate || endDate
              ? `${
                  startDate
                    ? new Date(startDate).toLocaleDateString("th-TH")
                    : "..."
                } - ${
                  endDate
                    ? new Date(endDate).toLocaleDateString("th-TH")
                    : "..."
                }`
              : "เลือกช่วงวันที่"}
          </span>
          <Calendar className="h-4 w-4 text-slate-400" />
        </button>

        {showDatePicker && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">เริ่มวันที่</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="border rounded-lg p-2 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">ถึงวันที่</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="border rounded-lg p-2 text-sm"
              />
            </div>

            <button
              onClick={() => {
                onStartDateChange("");
                onEndDateChange("");
              }}
              className="text-xs text-blue-600 hover:underline self-end"
            >
              ล้างค่าวันที่
            </button>
          </div>
        )}
      </div>

      <div className="lg:col-span-3">
        <button
          type="button"
          onClick={() => navigate("/create")}
          className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + รับรถ
        </button>
      </div>

      {/* Submit */}
      {/* <div className="lg:col-span-2">
        <button
          onClick={onSubmitSearch}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#435EBE] hover:bg-[#3950a3] text-white text-sm font-medium px-4 py-2.5 transition-all shadow-md shadow-blue-500/20"
        >
          <Search className="h-4 w-4" />
          ค้นหา
        </button>
      </div> */}
    </div>
  );
}
