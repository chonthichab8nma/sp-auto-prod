import { useEffect, useState, useMemo } from "react";
import { CirclePlus, Filter, CalendarIcon } from "lucide-react";

import { useNavigate } from "react-router-dom";
import {
  vehiclesService,
  type VehicleBrandApi,
  type VehicleTypeApi,
  type InsuranceCompanyApi,
} from "../services/vehicles.service";
import FormSelect from "../../../shared/components/form/FormSelect";
import DatePickerPopover from "../../../shared/components/ui/DateRangePickerPopover";

type DashboardAdvancedFilters = {
  jobNumber?: string;
  insuranceCompanyId?: number;
  brand?: string;
  model?: string;
  color?: string;
  typeId?: number;
  year?: string;
  vehicleRegistration?: string;
  chassisNumber?: string;
  vinNumber?: string;
  customerName?: string;
};

type DashboardFilterValue = string | number | undefined;

export default function DashboardFilters({
  startDate,
  endDate,
  advancedFilters,

  onStartDateChange,
  onEndDateChange,
  onAdvancedFilterChange,
}: {
  startDate: string;
  endDate: string;
  advancedFilters?: DashboardAdvancedFilters;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onAdvancedFilterChange?: (
    key: keyof DashboardAdvancedFilters,
    value: DashboardFilterValue,
  ) => void;
}) {
  const navigate = useNavigate();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [brands, setBrands] = useState<VehicleBrandApi[]>([]);
  const [types, setTypes] = useState<VehicleTypeApi[]>([]);
  const [insurances, setInsurances] = useState<InsuranceCompanyApi[]>([]);

  const insuranceOptions = useMemo(
    () => insurances.map((i) => i.name),
    [insurances],
  );

  const brandOptions = useMemo(() => brands.map((b) => b.name), [brands]);
  const typeOptions = useMemo(
    () => types.map((t) => `${t.id}::${t.name}`),
    [types],
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
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
        {/* Insurance Company ID */}
        <div className="lg:col-span-4">
          <span className="text-sm font-semibold text-slate-700 block mb-2">
            บริษัทประกัน
          </span>
          <FormSelect
            options={insuranceOptions}
            placeholder="ทั้งหมด"
            value={
              advancedFilters?.insuranceCompanyId
                ? (insurances.find(
                    (i) => i.id === advancedFilters.insuranceCompanyId,
                  )?.name ?? "")
                : ""
            }
            className="h-11 rounded-xl border-slate-200hover:border-slate-200 hover:bg-slate-50 focus:border-blue-500"
            onChange={(e) => {
              const name = e.target.value;
              const found = insurances.find((i) => i.name === name);

              onAdvancedFilterChange?.("insuranceCompanyId", found?.id);
            }}
          />
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

        <div className="lg:col-span-3">
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

        <div className="lg:col-span-2 flex ">
          <button
            type="button"
            onClick={() => navigate("/create")}
            className="
      h-11 w-full
      bg-blue-600 text-white
      rounded-xl
      text-sm font-semibold
      inline-flex items-center justify-center gap-2
      px-4
      hover:bg-blue-700
      transition-colors
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      shadow-sm
    "
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
              <CirclePlus className="h-4 w-4" />
            </span>
            รับรถ
          </button>
        </div>
      </div>

      {showAdvancedFilters && onAdvancedFilterChange && advancedFilters && (
        <div className=" bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
          {/* Job Number */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              เลขที่ใบงาน
            </label>
            <input
              type="text"
              className="placeholder:text-slate-400 placeholder:py-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring focus:ring-blue-500 outline-none"
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

            <FormSelect
              options={brandOptions}
              placeholder="ทั้งหมด"
              value={advancedFilters.brand ?? ""}
              onChange={(e) => onAdvancedFilterChange("brand", e.target.value)}
              className="w-full"
            />
          </div>
          {/* Model */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              รุ่นรถ
            </label>
            <input
              type="text"
              className="placeholder:text-slate-400 placeholder:py-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring focus:ring-blue-500  outline-none"
              placeholder="ระบุรุ่นรถ"
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
              className="placeholder:text-slate-400 placeholder:py-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring focus:ring-blue-500  outline-none"
              placeholder="ระบุสี"
              value={advancedFilters.color || ""}
              onChange={(e) => onAdvancedFilterChange("color", e.target.value)}
            />
          </div>
          {/* Registration */}
          {/* <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              ทะเบียนรถ
            </label>
            <input
              type="text"
              className="placeholder:text-slate-400 placeholder:py-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring focus:ring-blue-500  outline-none"
              placeholder="ระบุทะเบียน"
              value={advancedFilters.vehicleRegistration || ""}
              onChange={(e) =>
                onAdvancedFilterChange("vehicleRegistration", e.target.value)
              }
            />
          </div> */}
          {/* Chassis */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              เลขตัวถัง
            </label>
            <input
              type="text"
              className="placeholder:text-slate-400 placeholder:py-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring focus:ring-blue-500  outline-none"
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
              className="placeholder:text-slate-400 placeholder:py-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring focus:ring-blue-500  outline-none"
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
              className="placeholder:text-slate-400 placeholder:py-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring focus:ring-blue-500  outline-none"
              placeholder="ระบุชื่อลูกค้า"
              value={advancedFilters.customerName || ""}
              onChange={(e) =>
                onAdvancedFilterChange("customerName", e.target.value)
              }
            />
          </div>
          {/* Type */}
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              ประเภทรถ
            </span>
            <FormSelect
              options={typeOptions}
              placeholder="ทั้งหมด"
              value={
                advancedFilters.typeId
                  ? `${advancedFilters.typeId}::${types.find((t) => t.id === advancedFilters.typeId)?.name ?? ""}`
                  : ""
              }
              onChange={(e) => {
                const [idStr] = e.target.value.split("::");
                onAdvancedFilterChange(
                  "typeId",
                  idStr ? Number(idStr) : undefined,
                );
              }}
            />
          </div>
          {/* Year */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              ปี
            </label>
            <input
              type="text"
              className="placeholder:text-slate-400 placeholder:py-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring focus:ring-blue-500  outline-none"
              placeholder="ระบุปี เช่น 2024"
              value={advancedFilters.year || ""}
              onChange={(e) => onAdvancedFilterChange("year", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
