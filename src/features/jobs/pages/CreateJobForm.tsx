import React, { useMemo, useState, useEffect } from "react";
import type { JobFormData } from "../../../Type";
import FormInput from "../../../shared/components/form/FormInput";
import FormSelect from "../../../shared/components/form/FormSelect";
// import { CAR_TYPES, CAR_BRANDS, CAR_MODELS, YEARS } from "../../../data";
import {
  getDefaultCreateJobFormData,
  validateCreateJob,
} from "../types/jobForm";

import {
  vehiclesService,
  normalizeRegistration,
  type InsuranceCompanyApi,
  type VehicleApi,
  type VehicleBrandApi,
  type VehicleTypeApi,
  type VehicleModelApi,
} from "../services/vehicles.service";
import { jobsService } from "../services/jobs.service";

type CreateJobFormState = JobFormData & {
  insuranceCompanyId?: number | null; // optional
};
const LabelWithStar = ({ text }: { text: string }) => (
  <span>
    {text} <span className="text-red-500">*</span>
  </span>
);

function parseFieldValue(name: string, value: string) {
  if (name === "excessFee") return value === "" ? 0 : Number(value);
  return value;
}

function uniqueStrings(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function ReadOnlyValue({
  label,
  value,
}: {
  label?: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-800 ">{label}</label>

      <div className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
        {value || "-"}
      </div>
    </div>
  );
}
function parseInsuranceOption(v: string) {
  const [idStr, ...rest] = v.split("::");
  return { id: Number(idStr), name: rest.join("::") };
}

export default function CreateJobForm() {
  const [formData, setFormData] = useState<CreateJobFormState>(
    getDefaultCreateJobFormData(),
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeApi[]>([]);

  const [brands, setBrands] = useState<VehicleBrandApi[]>([]);
  const [isLoadingVehicleMeta, setIsLoadingVehicleMeta] = useState(false);
  const [brandModels, setBrandModels] = useState<VehicleModelApi[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const [vehiclesCache, setVehiclesCache] = useState<VehicleApi[] | null>(null);

  const [insurances, setInsurances] = useState<InsuranceCompanyApi[]>([]);
  const [isLoadingInsurances, setIsLoadingInsurances] = useState(false);

  function buildYearOptions() {
    const now = new Date().getFullYear();
    const years: string[] = [];
    for (let y = now; y >= now - 40; y--) years.push(String(y));
    return years;
  }

  const insuranceRequired = useMemo(
    () => formData.paymentType === "Insurance",
    [formData.paymentType],
  );

  // Step 1: fetch dropdown meta (types + brands/models)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setIsLoadingVehicleMeta(true);

        const [types, brandList] = await Promise.all([
          vehiclesService.fetchCarType(),
          vehiclesService.listBrands(),
        ]);

        if (!alive) return;

        setVehicleTypes(types);
        setBrands(brandList);
      } catch (err) {
        console.error("Fetch vehicle meta failed:", err);
      } finally {
        if (alive) setIsLoadingVehicleMeta(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const yearOptions = useMemo(() => buildYearOptions(), []);

  const typeOptions = useMemo(() => {
    return vehicleTypes.map((t) => t.name);
  }, [vehicleTypes]);

  const brandOptions = useMemo(
    () => uniqueStrings(brands.map((b) => b.name)),
    [brands],
  );

  const selectedBrand = useMemo(
    () => brands.find((b) => b.name === formData.brand) ?? null,
    [brands, formData.brand],
  );

  const modelOptions = useMemo(() => {
    if (!selectedBrand) return [];
    return uniqueStrings(brandModels.map((m) => m.name));
  }, [selectedBrand, brandModels]);

  const selectedModel = useMemo(() => {
    return brandModels.find((m) => m.name === formData.model) ?? null;
  }, [brandModels, formData.model]);

  const insuranceOptions = useMemo(() => {
    return insurances ? insurances.map((i) => `${i.id}::${i.name}`) : [];
  }, [insurances]);

  useEffect(() => {
    const typeName = selectedModel?.type?.name;
    if (!typeName) return;

    setFormData((prev) => {
      if (prev.type === typeName) return prev;
      return { ...prev, type: typeName };
    });
  }, [selectedModel?.type?.name]);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!selectedBrand?.id) {
        setBrandModels([]);
        return;
      }

      try {
        setIsLoadingModels(true);
        const brandDetail = await vehiclesService.getBrandById(
          selectedBrand.id,
        );

        if (!alive) return;
        setBrandModels(brandDetail.models ?? []);
      } catch (e) {
        console.error("load brand models failed", e);
        if (alive) setBrandModels([]);
      } finally {
        if (alive) setIsLoadingModels(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [selectedBrand?.id]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setIsLoadingInsurances(true);

        const list = await vehiclesService.listInsurances();
        console.log({list})
        if (!alive) return;

        setInsurances(list.data);
      } catch (e) {
        console.error("Fetch insurances failed:", e);
        if (alive) setInsurances([]);
      } finally {
        if (alive) setIsLoadingInsurances(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // optional Step 4: lookup ทะเบียน → autofill
  const lookupRegistrationAndAutofill = async () => {
    const reg = normalizeRegistration(formData.registration || "");
    if (!reg) return;

    try {
      let list = vehiclesCache;
      if (!list) {
        list = await vehiclesService.listVehicles();
        setVehiclesCache(list);
      }

      const found =
        list.find((v) => normalizeRegistration(v.registration) === reg) ?? null;

      if (!found) return;

      setFormData((prev) => ({
        ...prev,
        chassisNumber: found.chassisNumber ?? prev.chassisNumber,
        brand: found.brand ?? prev.brand,
        model: found.model ?? prev.model,
        type: found.type ?? prev.type,
        year: found.year ?? prev.year,
        color: found.color ?? prev.color,
      }));
    } catch (err) {
      console.error("Lookup registration failed:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "customerPhone") {
      let digits = value.replace(/\D/g, "");
      digits = digits.slice(0, 10);
      if (digits.length > 0 && digits[0] !== "0") return;

      setFormData((prev) => ({
        ...prev,
        customerPhone: digits,
      }));
      return;
    }

    if (name === "brand") {
      setFormData((prev) => ({
        ...prev,
        brand: value,
        model: "",
        type: "",
      }));
      return;
    }

    if (name === "model") {
      const nextTypeName =
        brandModels.find((m) => m.name === value)?.type?.name ?? "";

      setFormData((prev) => ({
        ...prev,
        model: value,
        type: nextTypeName || prev.type,
      }));
      return;
    }

    if (name === "insuranceCompanyId") {
      const { id, name: companyName } = parseInsuranceOption(value);

      setFormData((prev) => ({
        ...prev,
        insuranceCompanyId: Number.isFinite(id) ? id : null,
        insuranceCompany: companyName || "",
      }));
      return;
    }

    if (name === "paymentType") {
      const next = value as "Insurance" | "Cash";

      setFormData((prev) => ({
        ...prev,
        paymentType: next,
        ...(next === "Insurance"
          ? {}
          : { insuranceCompanyId: null, insuranceCompany: "" }),
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: parseFieldValue(name, value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const v = validateCreateJob(formData);

    if (!v.ok) {
      alert(v.errors[0]);
      return;
    }

    const test = { ...formData,
      vehicle: {
        registration: formData.registration,
        brand: formData.brand,
        model: formData.model,
        color: formData.color,
        chassisNumber:formData.chassisNumber,
      },
      customer: {
        name: formData.customerName,
        phone: formData.customerPhone,
        address: formData.customerAddress,
      },}

    try {
      setIsSubmitting(true);
      const res = await jobsService.create(test);
      if (!res.ok) {
        alert(res.error);
        return;
      }
    } finally {
      setIsSubmitting(false);
    }
    // NOTE: คุณยังคอมเมนต์ flow create job อยู่ เลยยังไม่แตะตรงนี้
    console.log("submit payload (draft):", formData);
  };

  function onCancel() {}

  return (
    <div className="w-full bg-white border border-slate-200 overflow-hidden ">
      <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-800">รับรถเข้าจอดซ่อม</h2>
          <p className="text-slate-500 text-sm mt-1">
            ระบุรายละเอียดการรับรถใหม่
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-8 py-8 space-y-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4 shrink-0 pt-2">
            <h3 className="font-semibold text-slate-800">รายละเอียดรถ</h3>
            <p className="text-sm text-slate-500 mt-1">ข้อมูลรถ</p>
          </div>

          <div className="md:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-5">
            <FormInput
              label={<LabelWithStar text="ทะเบียนรถ" />}
              name="registration"
              value={formData.registration}
              onChange={handleChange}
              onBlur={lookupRegistrationAndAutofill}
              required
            />
            <FormInput
              label={<LabelWithStar text="เลขตัวถัง" />}
              name="chassisNumber"
              value={formData.chassisNumber}
              onChange={handleChange}
              required
            />

            <FormSelect
              options={brandOptions}
              label={<LabelWithStar text="ยี่ห้อ/แบรนด์" />}
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="เลือกยี่ห้อ"
              required
            />
            <FormSelect
              options={modelOptions}
              label={<LabelWithStar text="รุ่น" />}
              name="model"
              value={formData.model}
              onChange={handleChange}
              disabled={!formData.brand || isLoadingModels}
              placeholder={
                !formData.brand
                  ? "เลือกแบรนด์ก่อน"
                  : isLoadingModels
                    ? "กำลังโหลดรุ่น..."
                    : "เลือกรุ่นรถ"
              }
              required
            />
            {/* <FormSelect

              options={typeOptions}
              label={<LabelWithStar text="ประเภทรถ" />}
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="เลือกประเภทรถ"
              
            /> */}
            <ReadOnlyValue label="ประเภทรถ" value={formData.type} />
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                options={yearOptions}
                label={<LabelWithStar text="ปี" />}
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="เลือกปี"
                required
              />
              <FormInput
                label={<LabelWithStar text="สี" />}
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="ระบุสี"
                required
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4 shrink-0 pt-2">
            <h3 className="font-semibold text-slate-800">รายละเอียดการซ่อม</h3>
            <p className="text-sm text-slate-500 mt-1">ข้อมูลการซ่อม</p>
          </div>

          <div className="md:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-5">
            <FormInput
              label={<LabelWithStar text="วันที่นำรถเข้าจอดซ่อม" />}
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              type="date"
              required
            />
            <FormInput
              label={<LabelWithStar text="กำหนดซ่อมเสร็จ/นัดรับรถ" />}
              name="estimatedEndDate"
              value={formData.estimatedEndDate}
              onChange={handleChange}
              type="date"
              required
            />
            <FormInput
              label={<LabelWithStar text="ค่าความเสียหายส่วนแรก" />}
              name="excessFee"
              value={formData.excessFee}
              onChange={handleChange}
              type="number"
              onFocus={(e) => e.target.select()}
              required
            />

            <div className="md:col-span-3 pt-2">
              <FormInput
                label={<LabelWithStar text="เจ้าหน้าที่รับรถ" />}
                name="receiver"
                value={formData.receiver}
                onChange={handleChange}
                type="text"
                required
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4 shrink-0 pt-2">
            <h3 className="font-semibold text-slate-800">รายละเอียดลูกค้า</h3>
            <p className="text-sm text-slate-500 mt-1">ข้อมูลลูกค้า</p>
          </div>

          <div className="md:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-5">
            <FormInput
              label="ชื่อ-นามสกุล"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="ระบุชื่อ-นามสกุลลูกค้า"
            />
            <FormInput
              label="เบอร์โทรศัพท์"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              placeholder="ระบุเบอร์โทรศัพท์"
            />
            <FormInput
              label="ที่อยู่"
              name="customerAddress"
              value={formData.customerAddress}
              onChange={handleChange}
              placeholder="ระบุที่อยู่"
            />
          </div>
        </div>

        <hr className="border-slate-100" />

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4 shrink-0 pt-2">
            <h3 className="font-semibold text-slate-800">
              รายละเอียดการชำระเงิน
            </h3>
            <p className="text-sm text-slate-500 mt-1">ข้อมูลการชำระเงิน</p>
          </div>

          <div className="md:w-3/4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`relative flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                  formData.paymentType === "Insurance"
                    ? "border-blue-600 bg-white ring-1 ring-blue-600"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-slate-800 text-sm">
                    ประกันภัย{" "}
                    <span className="text-slate-400 font-normal">(เคลม)</span>
                  </span>
                </div>
                <input
                  type="radio"
                  name="paymentType"
                  value="Insurance"
                  checked={formData.paymentType === "Insurance"}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    formData.paymentType === "Insurance"
                      ? "border-blue-600"
                      : "border-slate-300"
                  }`}
                >
                  {formData.paymentType === "Insurance" && (
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                  )}
                </div>
              </label>

              <label
                className={`relative flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                  formData.paymentType === "Cash"
                    ? "border-blue-600 bg-white ring-1 ring-blue-600"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-slate-800 text-sm">
                    เงินสด{" "}
                    <span className="text-slate-400 font-normal">
                      (ลูกค้าชำระ)
                    </span>
                  </span>
                </div>
                <input
                  type="radio"
                  name="paymentType"
                  value="Cash"
                  checked={formData.paymentType === "Cash"}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    formData.paymentType === "Cash"
                      ? "border-blue-600"
                      : "border-slate-300"
                  }`}
                >
                  {formData.paymentType === "Cash" && (
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                  )}
                </div>
              </label>
            </div>

            {insuranceRequired && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <FormSelect
                  label={<LabelWithStar text="บริษัทประกันภัย" />}
                  name="insuranceCompanyId"
                  value={
                    formData.insuranceCompanyId
                      ? `${formData.insuranceCompanyId}::${formData.insuranceCompany || ""}`
                      : ""
                  }
                  options={insuranceOptions}
                  placeholder={
                    isLoadingInsurances ? "กำลังโหลด..." : "เลือกบริษัทประกัน"
                  }
                  disabled={isLoadingInsurances}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium disabled:opacity-60"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm disabled:opacity-60"
          >
            {isSubmitting ? "กำลังบันทึก..." : "บันทึกรับรถ"}
          </button>
        </div>
      </form>
    </div>
  );
}
