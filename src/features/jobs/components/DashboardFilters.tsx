import { useEffect, useMemo, useState } from "react";
import {
  Filter,
  CalendarIcon,
  SlidersHorizontal,
  X,
} from "lucide-react";

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
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

  const activeFieldCount = useMemo(() => {
    const dateCount = startDate || endDate ? 1 : 0;
    if (!advancedFilters) return dateCount;

    const filterCount = Object.values(advancedFilters).reduce<number>(
      (sum, value) => {
        if (typeof value === "number") {
          return Number.isFinite(value) ? sum + 1 : sum;
        }
        return String(value || "").trim() ? sum + 1 : sum;
      },
      0,
    );

    return dateCount + filterCount;
  }, [advancedFilters, startDate, endDate]);

  useEffect(() => {
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

  const clearAllFilters = () => {
    onStartDateChange("");
    onEndDateChange("");
    onAdvancedFilterChange?.("insuranceCompanyId", undefined);
    onAdvancedFilterChange?.("jobNumber", "");
    onAdvancedFilterChange?.("brand", "");
    onAdvancedFilterChange?.("model", "");
    onAdvancedFilterChange?.("color", "");
    onAdvancedFilterChange?.("typeId", undefined);
    onAdvancedFilterChange?.("year", "");
    onAdvancedFilterChange?.("vehicleRegistration", "");
    onAdvancedFilterChange?.("chassisNumber", "");
    onAdvancedFilterChange?.("vinNumber", "");
    onAdvancedFilterChange?.("customerName", "");
  };

  const renderAdvancedFields = (className: string) => {
    if (!onAdvancedFilterChange || !advancedFilters) return null;

    return (
      <div className={className}>
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">เลขที่ใบงาน</label>
          <input
            type="text"
            className="placeholder:text-slate-400 placeholder:py-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring focus:ring-blue-500 outline-none"
            placeholder="ระบุเลขที่ใบงาน"
            value={advancedFilters.jobNumber || ""}
            onChange={(e) => onAdvancedFilterChange("jobNumber", e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">ยี่ห้อรถ</label>
          <FormSelect
            options={brandOptions}
            placeholder="ทั้งหมด"
            value={advancedFilters.brand ?? ""}
            onChange={(e) => onAdvancedFilterChange("brand", e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">รุ่นรถ</label>
          <input
            type="text"
            className="placeholder:text-slate-400 placeholder:py-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring focus:ring-blue-500 outline-none"
            placeholder="ระบุรุ่นรถ"
            value={advancedFilters.model || ""}
            onChange={(e) => onAdvancedFilterChange("model", e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">สีรถ</label>
          <input
            type="text"
            className="placeholder:text-slate-400 placeholder:py-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring focus:ring-blue-500 outline-none"
            placeholder="ระบุสี"
            value={advancedFilters.color || ""}
            onChange={(e) => onAdvancedFilterChange("color", e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">เลขตัวถัง</label>
          <input
            type="text"
            className="placeholder:text-slate-400 placeholder:py-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring focus:ring-blue-500 outline-none"
            placeholder="ระบุเลขตัวถัง"
            value={advancedFilters.chassisNumber || ""}
            onChange={(e) => onAdvancedFilterChange("chassisNumber", e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">VIN Code</label>
          <input
            type="text"
            className="placeholder:text-slate-400 placeholder:py-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring focus:ring-blue-500 outline-none"
            placeholder="ระบุ VIN Code"
            value={advancedFilters.vinNumber || ""}
            onChange={(e) => onAdvancedFilterChange("vinNumber", e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">ชื่อลูกค้า</label>
          <input
            type="text"
            className="placeholder:text-slate-400 placeholder:py-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring focus:ring-blue-500 outline-none"
            placeholder="ระบุชื่อลูกค้า"
            value={advancedFilters.customerName || ""}
            onChange={(e) => onAdvancedFilterChange("customerName", e.target.value)}
          />
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-500 block mb-1">ประเภทรถ</span>
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
              onAdvancedFilterChange("typeId", idStr ? Number(idStr) : undefined);
            }}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">ปี</label>
          <input
            type="text"
            className="placeholder:text-slate-400 placeholder:py-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring focus:ring-blue-500 outline-none"
            placeholder="ระบุปี เช่น 2024"
            value={advancedFilters.year || ""}
            onChange={(e) => onAdvancedFilterChange("year", e.target.value)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setShowMobileFilters(true)}
          className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 inline-flex items-center justify-between text-[13px] md:text-sm font-semibold text-slate-700"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            ตัวกรอง
          </span>
          {activeFieldCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 text-[11px] font-bold text-blue-700">
              {activeFieldCount}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">แตะเพื่อเปิด</span>
          )}
        </button>
      </div>

      <div className="hidden lg:block">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-4">
            <span className="text-sm font-semibold text-slate-700 block mb-2">บริษัทประกัน</span>
            <FormSelect
              options={insuranceOptions}
              placeholder="ทั้งหมด"
              value={
                advancedFilters?.insuranceCompanyId
                  ? (insurances.find((i) => i.id === advancedFilters.insuranceCompanyId)?.name ?? "")
                  : ""
              }
              className="h-11 rounded-xl border-slate-200 hover:bg-slate-50 focus:border-blue-500"
              onChange={(e) => {
                const name = e.target.value;
                const found = insurances.find((i) => i.name === name);
                onAdvancedFilterChange?.("insuranceCompanyId", found?.id);
              }}
            />
          </div>

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
              <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              ตัวกรองเพิ่มเติม
            </button>
          </div>

          <div className="hidden lg:col-span-2 lg:flex">
            <button
              type="button"
              onClick={() => navigate("/create")}
              className="h-11 w-full bg-blue-600 text-white rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 px-4 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
            >
              รับรถ
            </button>
          </div>
        </div>
      </div>

      {showAdvancedFilters ? (
        <div className="hidden lg:block bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
          {renderAdvancedFields("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4")}
        </div>
      ) : null}

      {showMobileFilters ? (
        <>
          <button
            type="button"
            aria-label="close mobile filters"
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          />

          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-auto rounded-t-2xl border border-slate-200 bg-white p-4 shadow-xl lg:hidden">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />

            <div className="mb-4 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-slate-800">ตัวกรองรายการ</p>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[13px] font-semibold text-slate-700 block mb-2">บริษัทประกัน</span>
                <FormSelect
                  options={insuranceOptions}
                  placeholder="ทั้งหมด"
                  value={
                    advancedFilters?.insuranceCompanyId
                      ? (insurances.find((i) => i.id === advancedFilters.insuranceCompanyId)?.name ?? "")
                      : ""
                  }
                  className="h-11 rounded-xl border-slate-200 hover:bg-slate-50 focus:border-blue-500"
                  onChange={(e) => {
                    const name = e.target.value;
                    const found = insurances.find((i) => i.name === name);
                    onAdvancedFilterChange?.("insuranceCompanyId", found?.id);
                  }}
                />
              </div>

              <div>
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

              <div>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`
                    relative h-11 w-full pl-10 pr-4 rounded-xl border text-[13px] font-medium text-left transition-colors
                    ${
                      showAdvancedFilters
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }
                  `}
                >
                  <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  ตัวกรองเพิ่มเติม
                </button>
              </div>

              {showAdvancedFilters ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {renderAdvancedFields("grid grid-cols-1 gap-3")}
                </div>
              ) : null}
            </div>

            <div className="sticky bottom-0 mt-4 grid grid-cols-2 gap-2 bg-white pt-3">
              <button
                type="button"
                onClick={clearAllFilters}
                className="h-10 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600"
              >
                ล้างตัวกรอง
              </button>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="h-10 rounded-xl bg-blue-600 text-[13px] font-semibold text-white"
              >
                ดูรายการ
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
