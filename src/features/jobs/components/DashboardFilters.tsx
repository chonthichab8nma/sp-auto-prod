import { useEffect, useRef, useState, useMemo } from "react";
import { Search, Filter,CalendarIcon } from "lucide-react";

import { useNavigate } from "react-router-dom";
import {
  vehiclesService,
  type VehicleBrandApi,
  type VehicleTypeApi,
  type InsuranceCompanyApi,
} from "../services/vehicles.service";
import FormSelect from "../../../shared/components/form/FormSelect";
import DatePickerPopover from "../../../shared/components/ui/DateRangePickerPopover";

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
  // const [showDatePicker, setShowDatePicker] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  console.log(isTypeDropdownOpen);
  // API Data State
  const [brands, setBrands] = useState<VehicleBrandApi[]>([]);
  const [types, setTypes] = useState<VehicleTypeApi[]>([]);
  const [insurances, setInsurances] = useState<InsuranceCompanyApi[]>([]);

  // const datePickerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const insuranceOptions = useMemo(
    () => insurances.map((i) => i.name),
    [insurances],
  );

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
      // if (
      //   datePickerRef.current &&
      //   !datePickerRef.current.contains(event.target as Node)
      // ) {
      //   setShowDatePicker(false);
      // }
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
          <label className=" text-sm font-semibold text-slate-700 block mb-2">
            ค้นหา
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              className="placeholder:py-2 w-full h-11 pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-all hover:bg-slate-50"
              placeholder="ค้นหาทะเบียนรถ / ชื่อลูกค้า"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Date picker */}
        <div className="lg:col-span-3">
          <DatePickerPopover
            mode="range"
            label="เลือกวันที่"
             icon={<CalendarIcon className="h-4 w-4" />}
            value={{ startDate, endDate }}
            onChange={({ startDate, endDate }) => {
              onStartDateChange(startDate);
              onEndDateChange(endDate);
            }}
          />
        </div>

        <div className="lg:col-span-3 flex flex-col gap-2 lg:flex-row">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`
            relative h-11 w-full lg:flex-1
            pl-10 pr-4
            rounded-xl border
            text-sm font-medium text-left
            transition-colors
            ${
              showAdvancedFilters
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }
            `}
          >
            <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 " />
            ตัวกรองเพิ่มเติม
          </button>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-2 lg:flex-row">
          <button
            type="button"
            onClick={() => navigate("/create")}
            className="
            h-11 w-full lg:flex-1
           bg-blue-600 text-white
            rounded-xl
            text-sm font-medium
           hover:bg-blue-700
             transition-colors
              "
          >
            รับรถ
          </button>
        </div>
      </div>

      {showAdvancedFilters && onAdvancedFilterChange && advancedFilters && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
          {/* Job Number */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              เลขที่ใบงาน
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="ระบุเลขที่ใบงาน"
              value={advancedFilters.jobNumber || ""}
              onChange={(e) =>
                onAdvancedFilterChange("jobNumber", e.target.value)
              }
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
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              รุ่นรถ
            </label>
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
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              สีรถ
            </label>
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
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              ทะเบียนรถ
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="ระบุทะเบียน"
              value={advancedFilters.vehicleRegistration || ""}
              onChange={(e) =>
                onAdvancedFilterChange("vehicleRegistration", e.target.value)
              }
            />
          </div>
          {/* Chassis */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              เลขตัวถัง
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="ระบุเลขตัวถัง"
              value={advancedFilters.chassisNumber || ""}
              onChange={(e) =>
                onAdvancedFilterChange("chassisNumber", e.target.value)
              }
            />
          </div>
          {/* VIN */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              VIN Code
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="ระบุ VIN Code"
              value={advancedFilters.vinNumber || ""}
              onChange={(e) =>
                onAdvancedFilterChange("vinNumber", e.target.value)
              }
            />
          </div>
          {/* Customer Name */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              ชื่อลูกค้า
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="ระบุชื่อลูกค้า"
              value={advancedFilters.customerName || ""}
              onChange={(e) =>
                onAdvancedFilterChange("customerName", e.target.value)
              }
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
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              ปี
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="ระบุปี (e.g. 2024)"
              value={advancedFilters.year || ""}
              onChange={(e) => onAdvancedFilterChange("year", e.target.value)}
            />
          </div>
          {/* Insurance Company ID */}
          <FormSelect
            label={
              <span className="text-xs font-semibold text-slate-500">
                บริษัทประกัน
              </span>
            }
            options={insuranceOptions}
            placeholder="ทั้งหมด"
            value={
              advancedFilters.insuranceCompanyId
                ? (insurances.find(
                    (i) => i.id === advancedFilters.insuranceCompanyId,
                  )?.name ?? "")
                : ""
            }
            onChange={(e) => {
              const name = e.target.value; // ชื่อบริษัท
              const found = insurances.find((i) => i.name === name);

              onAdvancedFilterChange("insuranceCompanyId", found?.id);
            }}
          />
        </div>
      )}
    </div>
  );
}
