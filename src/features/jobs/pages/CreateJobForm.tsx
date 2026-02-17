import React from "react";
import FormInput from "../../../shared/components/form/FormInput";
import FormSelect from "../../../shared/components/form/FormSelect";
import { useNavigate } from "react-router-dom";
import EmployeeAutocomplete from "../../../shared/components/ui/EmployeeAutocomplete";
import DatePickerPopover from "../../../shared/components/ui/DateRangePickerPopover";
import { CalendarIcon } from "lucide-react";
import { useCreateJobForm } from "../hooks/useCreateJobForm";

const LabelWithStar = ({ text }: { text: string }) => (
  <span className="inline-flex items-center gap-1">
    {text}
    <span className="text-red-500">*</span>
  </span>
);

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

export default function CreateJobForm() {
  const navigate = useNavigate();
  const {
    formData,
    setFormData,
    errors,
    isSubmitting,
    insuranceRequired,
    isLoadingModels,
    isLoadingInsurances,
    brandOptions,
    modelOptions,
    yearOptions,
    insuranceOptions,
    receiverEmployee,
    handleChange,
    handleReceiverChange,
    lookupRegistrationAndAutofill,
    handleSubmit,
  } = useCreateJobForm();

  function onCancel() {
    navigate("/dashboard", { replace: true });
  }

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

      <form
        onSubmit={(e) =>
          handleSubmit(e, () => navigate("/dashboard", { replace: true }))
        }
        className="px-8 py-8 space-y-10"
      >
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4 shrink-0 pt-2">
            <h3 className="font-semibold text-slate-800">รายละเอียดรถ</h3>
            <p className="text-sm text-slate-500 mt-1">ข้อมูลรถ</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-4 lg:gap-5">
            <div className="xl:col-span-4">
              <FormInput
                label={<LabelWithStar text="ทะเบียนรถ" />}
                name="registration"
                placeholder="ระบุทะเบียนรถ"
                value={formData.registration}
                onChange={handleChange}
                onBlur={lookupRegistrationAndAutofill}
                error={errors.registration}
              />
            </div>
            <div className="xl:col-span-4">
              <FormInput
                label={<LabelWithStar text="เลขตัวถัง" />}
                placeholder="ระบุเลขตัวถัง"
                name="chassisNumber"
                disabled={!!formData.isExistingVehicle}
                value={formData.chassisNumber}
                onChange={handleChange}
                error={errors.chassisNumber}
                // required
              />
            </div>
            <div className="xl:col-span-4">
              <FormSelect
                options={brandOptions}
                label={<LabelWithStar text="ยี่ห้อ/แบรนด์" />}
                name="brand"
                disabled={!!formData.isExistingVehicle}
                value={formData.brand}
                onChange={handleChange}
                placeholder="เลือกยี่ห้อ/แบรนด์รถ"
                error={errors.brand}
              />
            </div>
            <div className="xl:col-span-4">
              <FormSelect
                options={modelOptions}
                label={<LabelWithStar text="รุ่น" />}
                name="model"
                disabled={
                  !!formData.isExistingVehicle ||
                  !formData.brand ||
                  isLoadingModels
                }
                value={formData.model}
                onChange={handleChange}
                placeholder={
                  !formData.brand
                    ? "เลือกรุ่นรถ"
                    : isLoadingModels
                      ? "กำลังโหลดรุ่น..."
                      : "เลือกรุ่นรถ"
                }
                error={errors.model}
              />
            </div>
            <div className="xl:col-span-4">
              <ReadOnlyValue label="ประเภทรถ" value={formData.type} />
            </div>
            <div className="xl:col-span-2">
              {/* ปี */}
              <FormSelect
                options={yearOptions}
                label={<LabelWithStar text="ปี" />}
                name="year"
                disabled={!!formData.isExistingVehicle}
                value={formData.year}
                onChange={handleChange}
                placeholder="ปี"
                error={errors.year}
              />
            </div>

            {/* สี */}
            <div className="xl:col-span-2">
             <FormInput
                label={<LabelWithStar text="สี" />}
                name="color"
                disabled={!!formData.isExistingVehicle}
                value={formData.color}
                onChange={handleChange}
                placeholder="ระบุสี"
                error={errors.color}
              />
            </div>
            {formData.isExistingVehicle && formData.vehicleId ? (
              <div className="md:col-span-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                พบรถในระบบแล้ว (Vehicle ID: {formData.vehicleId})
              </div>
            ) : null}
          </div>
        </div>

        <hr className="border-slate-100" />

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4 shrink-0 pt-2">
            <h3 className="font-semibold text-slate-800">รายละเอียดการซ่อม</h3>
            <p className="text-sm text-slate-500 mt-1">ข้อมูลการซ่อม</p>
          </div>

          <div className="md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
            <DatePickerPopover
              className="lg:col-span-1"
              mode="single"
              label="วันที่นำรถเข้าจอดซ่อม"
              value={formData.startDate}
              error={errors.startDate}
              onChange={(v) => setFormData((p) => ({ ...p, startDate: v }))}
              triggerClassName="h-9.5! rounded-lg!"
              icon={<CalendarIcon className="h-4 w-4" />}
            />
            <DatePickerPopover
              className="lg:col-span-1"
              mode="single"
              label="กำหนดซ่อมเสร็จ/นัดรับรถ"
              value={formData.estimatedEndDate}
              error={errors.estimatedEndDate}
              onChange={(v) =>
                setFormData((p) => ({ ...p, estimatedEndDate: v }))
              }
              triggerClassName="h-9.5! rounded-lg!"
              icon={<CalendarIcon className="h-4 w-4" />}
            />
            <FormInput
              className="lg:col-span-1"
              label={<LabelWithStar text="ค่าความเสียหายส่วนแรก" />}
              name="excessFee"
              value={formData.excessFee}
              onChange={handleChange}
              type="number"
              onFocus={(e) => e.target.select()}
              // error={errors.excessFee}
            />
            <div className="sm:col-span-2 lg:col-span-3 pt-2">
                <EmployeeAutocomplete
                  label={<LabelWithStar text="เจ้าหน้าที่รับรถ" />}
                  value={receiverEmployee}
                  onChange={handleReceiverChange}
                  error={errors.receiver ?? null}
                  placeholder="เลือกพนักงาน"
                limit={50}
                minQueryLength={1}
                debounceMs={250}
                inputClassName="py-2"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-800 block leading-5">
                  ความต้องการซ่อม
                </label>
                <textarea
                  name="repairDescription"
                  rows={3}
                  value={formData.repairDescription ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      repairDescription: e.target.value,
                    }))
                  }
                  placeholder="ระบุความต้องการซ่อม เช่น อาการเสียที่พบ หรือรายการซ่อมที่ต้องการ (ถ้ามี)"
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:bg-slate-50 hover:border-slate-300 focus:border-blue-600 resize-y min-h-[88px]"
                />
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-800 block leading-5">
                  หมายเหตุ
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:bg-slate-50 hover:border-slate-300 focus:border-blue-600 resize-y min-h-[88px]"
                />
              </div>
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
              label={<LabelWithStar text="ชื่อ-นามสกุล" />}
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="ระบุชื่อ-นามสกุลลูกค้า"
              error={errors.customerName}
            />
            <FormInput
              label={<LabelWithStar text="เบอร์โทรศัพท์" />}
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              placeholder="ระบุเบอร์โทรศัพท์"
              error={errors.customerPhone}
            />
            <FormInput
              label={<LabelWithStar text="ที่อยู่" />}
              name="customerAddress"
              value={formData.customerAddress}
              onChange={handleChange}
              placeholder="ระบุที่อยู่"
              error={errors.customerAddress}
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
                    ? "border-blue-600 bg-white ring-blue-600"
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
                    ? "border-blue-600 bg-white ring-blue-600"
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
                  error={errors.insuranceCompanyId}
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
