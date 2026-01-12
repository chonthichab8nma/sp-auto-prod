import React, { useState } from "react";
import { XCircle, Car, Wrench, CreditCard, User } from "lucide-react";
import { type JobFormData } from "../Type";
import FormInput from "./FormInput";

interface CreateJobFormProps {
  onCancel: () => void;
  onSubmit: (data: JobFormData) => void;
}

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
    if (!formData.registration || !formData.brand)
      return alert("กรุณากรอกข้อมูลสำคัญ");
    onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">รับรถเข้าซ่อมใหม่</h2>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600"
        >
          <XCircle />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <section className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <Car size={20} />
            <h3 className="font-semibold">รายละเอียดรถยนต์</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="ทะเบียนรถ"
              name="registration"
              value={formData.registration}
              onChange={handleChange}
              required
            />
            <FormInput
              label="เลขถัง"
              name="bagNumber"
              value={formData.bagNumber}
              onChange={handleChange}
              required
            />

            <FormInput
              label="ยี่ห้อ"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
            />
            <FormInput
              label="รุ่น"
              name="model"
              value={formData.model}
              onChange={handleChange}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="ปี"
                name="year"
                value={formData.year}
                onChange={handleChange}
                type="number"
              />
              <FormInput
                label="สี"
                name="color"
                value={formData.color}
                onChange={handleChange}
              />
            </div>

            <FormInput
              label="ประเภทรถ"
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="เช่น เก๋ง, กระบะ"
            />
          </div>
        </section>

        <section className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <Wrench size={20} />
            <h3 className="font-semibold">รายละเอียดการซ่อม</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="วันที่เริ่มงาน"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              type="date"
            />
            <FormInput
              label="ประเมินวันเสร็จ"
              name="estimatedEndDate"
              value={formData.estimatedEndDate}
              onChange={handleChange}
              type="date"
            />

            <FormInput
              label="คนรับรถ"
              name="receiver"
              value={formData.receiver}
              onChange={handleChange}
            />
            <FormInput
              label="ค่าความเสียหายส่วนแรก (Excess)"
              name="excessFee"
              value={formData.excessFee}
              onChange={handleChange}
              type="number"
            />
          </div>
        </section>

        <div className="col-span-1 md:col-span-2">
          <section className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-2 text-blue-600">
              <CreditCard size={20} />
              <h3 className="font-semibold">รูปแบบการชำระเงิน</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-4 col-span-1 md:col-span-2">
                <label
                  className={`flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-slate-50 w-full transition-all ${
                    formData.paymentType === "Insurance"
                      ? "border-green-500 bg-green-50"
                      : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentType"
                    value="Insurance"
                    checked={formData.paymentType === "Insurance"}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="font-medium text-slate-700">
                    ประกันภัย (เคลม)
                  </span>
                </label>

                <label
                  className={`flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-slate-50 w-full transition-all ${
                    formData.paymentType === "Cash"
                      ? "border-green-500 bg-green-50"
                      : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentType"
                    value="Cash"
                    checked={formData.paymentType === "Cash"}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="font-medium text-slate-700">เงินสด</span>
                </label>
              </div>

              {formData.paymentType === "Insurance" && (
                <div className="col-span-1 md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <FormInput
                    label="ชื่อบริษัทประกันภัย"
                    name="insuranceCompany"
                    value={formData.insuranceCompany || ""}
                    onChange={handleChange}
                    placeholder="ระบุชื่อบริษัทประกันภัย"
                    required={formData.paymentType === "Insurance"}
                  />
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <User size={20} />
            <h3 className="font-semibold text-lg">ข้อมูลลูกค้า</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="ชื่อ-นามสกุล ลูกค้า"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="ระบุชื่อผู้ติดต่อ"
            />
            <FormInput
              label="เบอร์โทรศัพท์"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              placeholder="08X-XXX-XXXX"
            />

            <div className="md:col-span-2">
              <FormInput
                label="ที่อยู่"
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleChange}
                placeholder="บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด"
              />
            </div>
          </div>
        </section>

        <div className="col-span-1 md:col-span-2 pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
          >
            บันทึกรับรถ
          </button>
        </div>
      </form>
    </div>
  );
}
