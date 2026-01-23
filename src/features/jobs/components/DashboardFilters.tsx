import { useEffect, useRef, useState } from "react";
import { Calendar, Search, Filter } from "lucide-react";

import { useNavigate } from "react-router-dom";
import {
  vehiclesService,
  type VehicleBrandApi,
  type VehicleTypeApi,
  type InsuranceCompanyApi,
} from "../services/vehicles.service";

export default function DashboardFilters({
  searchTerm,

  startDate,
  endDate,
  advancedFilters,
  onSearchTermChange,

  onStartDateChange,
  onEndDateChange,
  onAdvancedFilterChange,
  onSubmitSearch,
}: {
  searchTerm: string;
  selectedCarType: string;
  startDate: string;
  endDate: string;
  advancedFilters?: {
    jobNumber?: string;
    insuranceCompanyId?: number;
    brand?: string;
    model?: string;
    color?: string;
    type?: string;
    year?: string;
    vehicleRegistration?: string;
    chassisNumber?: string;
    vinNumber?: string;
    customerName?: string;
  };
  onSearchTermChange: (v: string) => void;
  onCarTypeChange: (v: string) => void;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onAdvancedFilterChange?: (key: string, value: any) => void;
  onSubmitSearch: () => void;
}) {
  const navigate = useNavigate();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // API Data State
  const [brands, setBrands] = useState<VehicleBrandApi[]>([]);
  const [types, setTypes] = useState<VehicleTypeApi[]>([]);
  const [insurances, setInsurances] = useState<InsuranceCompanyApi[]>([]);

  const datePickerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch dropdown data
    const fetchMetadata = async () => {
      try {
        const [brandsData, typesData, insurancesData] = await Promise.all([
          vehiclesService.listBrands(),
          vehiclesService.fetchCarType(),
          vehiclesService.listInsurances(),
        ]);
        setBrands(brandsData);
        setTypes(typesData);
        setInsurances(insurancesData.data);
      } catch (error) {
        console.error("Failed to fetch filter metadata:", error);
      }
    };
    fetchMetadata();

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
    <div className="flex flex-col gap-4">
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
        {/* <div className="lg:col-span-3 relative" ref={dropdownRef}>
          <label className="text-sm font-semibold text-slate-700 block mb-2">
            ประเภทรถ
          </label>

          <button
            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            className={`w-full flex items-center justify-between border rounded-xl px-4 py-2.5 text-sm transition-colors ${isTypeDropdownOpen
              ? "border-blue-500 bg-blue-50/50 text-blue-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
          >
            <span>{selectedCarType}</span>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isTypeDropdownOpen ? "rotate-180" : ""
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

              {types.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    onCarTypeChange(type.name);
                    setIsTypeDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 text-slate-600 flex items-center justify-between"
                >
                  <span>{type.name}</span>
                  {selectedCarType === type.name && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div> */}

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
                ? `${startDate
                  ? new Date(startDate).toLocaleDateString("th-TH")
                  : "..."
                } - ${endDate
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

        <div className="lg:col-span-6 flex gap-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${showAdvancedFilters
              ? "bg-blue-50 text-blue-600 border border-blue-200"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
          >
            <Filter className="h-4 w-4" />
            ตัวกรองเพิ่มเติม
          </button>
          <button
            type="button"
            onClick={() => navigate("/create")}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + รับรถ
          </button>
        </div>
      </div>

      {showAdvancedFilters && onAdvancedFilterChange && advancedFilters && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
          {/* Job Number */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">เลขที่ใบงาน</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="ระบุเลขที่ใบงาน"
              value={advancedFilters.jobNumber || ""}
              onChange={(e) => onAdvancedFilterChange("jobNumber", e.target.value)}
            />
          </div>
          {/* Brand */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              ยี่ห้อรถ
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              value={advancedFilters.brand || ""}
              onChange={(e) => onAdvancedFilterChange("brand", e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          {/* Model */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">รุ่นรถ</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="ระบุรุ่น (e.g. Camry)"
              value={advancedFilters.model || ""}
              onChange={(e) => onAdvancedFilterChange("model", e.target.value)}
            />
          </div>
          {/* Color */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">สีรถ</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="ระบุสี"
              value={advancedFilters.color || ""}
              onChange={(e) => onAdvancedFilterChange("color", e.target.value)}
            />
          </div>
          {/* Registration */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">ทะเบียนรถ</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="ระบุทะเบียน"
              value={advancedFilters.vehicleRegistration || ""}
              onChange={(e) => onAdvancedFilterChange("vehicleRegistration", e.target.value)}
            />
          </div>
          {/* Chassis */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">เลขตัวถัง</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="ระบุเลขตัวถัง"
              value={advancedFilters.chassisNumber || ""}
              onChange={(e) => onAdvancedFilterChange("chassisNumber", e.target.value)}
            />
          </div>
          {/* VIN */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">VIN Code</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="ระบุ VIN Code"
              value={advancedFilters.vinNumber || ""}
              onChange={(e) => onAdvancedFilterChange("vinNumber", e.target.value)}
            />
          </div>
          {/* Customer Name */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">ชื่อลูกค้า</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="ระบุชื่อลูกค้า"
              value={advancedFilters.customerName || ""}
              onChange={(e) => onAdvancedFilterChange("customerName", e.target.value)}
            />
          </div>
          {/* Type */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              ประเภท
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              value={advancedFilters.type || ""}
              onChange={(e) => onAdvancedFilterChange("type", e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              {types.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          {/* Year */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">ปี</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="ระบุปี (e.g. 2024)"
              value={advancedFilters.year || ""}
              onChange={(e) => onAdvancedFilterChange("year", e.target.value)}
            />
          </div>
          {/* Insurance Company ID */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              บริษัทประกัน
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              value={advancedFilters.insuranceCompanyId || ""}
              onChange={(e) =>
                onAdvancedFilterChange(
                  "insuranceCompanyId",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            >
              <option value="">ทั้งหมด</option>
              {insurances.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

