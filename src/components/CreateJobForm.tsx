import React, { useState } from "react";
import { type JobFormData } from "../Type";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import { CAR_TYPES, CAR_BRANDS, CAR_MODELS, YEARS } from "../data";
interface CreateJobFormProps {
  onCancel: () => void;
  onSubmit: (data: JobFormData) => void;
}

const LabelWithStar = ({ text }: { text: string }) => (
  <span>
    {text} <span className="text-red-500">*</span>
  </span>
);

export default function CreateJobForm({
  onCancel,
  onSubmit,
}: CreateJobFormProps) {
  const [formData, setFormData] = useState<JobFormData>({
    registration: "",
    bagNumber: "",
    brand: "",
    type: "",
    model: "",
    year: "",
    color: "",
    startDate: new Date().toISOString().split("T")[0],
    estimatedEndDate: "",
    receiver: "",
    excessFee: 0,
    paymentType: "Insurance",
    insuranceCompany: "",
    customerName: "",
    customerPhone: "",
    customerAddress: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.registration || !formData.brand) {
      return alert("กรุณากรอกข้อมูลสำคัญ");
    }

    const fixDateToAD = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);

      if (date.getFullYear() > 2400) {
        date.setFullYear(date.getFullYear() - 543);
      }

      return date.toISOString().split("T")[0];
    };

    const finalData = {
      ...formData,
      startDate: fixDateToAD(formData.startDate),
      estimatedEndDate: fixDateToAD(formData.estimatedEndDate),
    };

    onSubmit(finalData);
  };

  return (
    <div className="w-full bg-white border border-slate-200 overflow-hidden ">
      <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-800">รับรถเข้าจอดซ่อม</h2>
          <p className="text-slate-500 text-sm mt-1">
            ระบุรายละเอียดการรับรถใหม่
          </p>
        </div>
        {/* <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <XCircle size={24} />
        </button> */}
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
              required
            />
            <FormInput
              label={<LabelWithStar text="เลขตัวถัง" />}
              name="bagNumber"
              value={formData.bagNumber}
              onChange={handleChange}
              required
            />
            <FormSelect
              options={CAR_TYPES}
              label={<LabelWithStar text="ประเภทรถ" />}
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="เลือกประเภทรถ"
              required
            />

            <FormSelect
              options={CAR_BRANDS}
              label={<LabelWithStar text="ยี่ห้อ/แบรนด์" />}
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="เลือกยี่ห้อ"
              required
            />
            <FormSelect
              options={CAR_MODELS}
              label={<LabelWithStar text="รุ่น" />}
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="เลือกรุ่นรถ"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                options={YEARS}
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

            {formData.paymentType === "Insurance" && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <FormInput
                  label={<LabelWithStar text="ชื่อบริษัทประกันภัย" />}
                  name="insuranceCompany"
                  value={formData.insuranceCompany || ""}
                  onChange={handleChange}
                  placeholder="เลือกบริษัทประกันภัย"
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
            className="px-6 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
          >
            บันทึกรับรถ
          </button>
        </div>
      </form>
    </div>
  );
}
