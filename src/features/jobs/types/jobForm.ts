import type { JobFormData } from "../../../Type";

export type CreateJobPayload = JobFormData;

export const getDefaultCreateJobFormData = (): JobFormData => ({
  registration: "",
  chassisNumber: "",
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

export function fixBuddhistYearToAD(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  
  if (date.getFullYear() > 2400) {
    date.setFullYear(date.getFullYear() - 543);
  }

  return date.toISOString().split("T")[0];
}

export function normalizeCreateJobPayload(form: JobFormData): CreateJobPayload {
  return {
    ...form,
    excessFee: Number(form.excessFee) || 0,
    startDate: fixBuddhistYearToAD(form.startDate),
    estimatedEndDate: fixBuddhistYearToAD(form.estimatedEndDate),
    insuranceCompany: form.paymentType === "Insurance" ? form.insuranceCompany : "",
  };
}

export function validateCreateJob(form: JobFormData) {
  const errors: string[] = [];
   if (form.startDate && form.estimatedEndDate) {
    const start = fixBuddhistYearToAD(form.startDate);
    const end = fixBuddhistYearToAD(form.estimatedEndDate);

    if (end <= start) {
      errors.push("กำหนดซ่อมเสร็จ/นัดรับรถ ต้องหลังวันที่นำรถเข้าจอดซ่อมอย่างน้อย 1 วัน");
    }
  }


  if (!form.registration?.trim()) errors.push("กรุณากรอกทะเบียนรถ");
  if (!form.chassisNumber?.trim()) errors.push("กรุณากรอกเลขตัวถัง");
  if (!form.type?.trim()) errors.push("กรุณาเลือกประเภทรถ");
  if (!form.brand?.trim()) errors.push("กรุณาเลือกยี่ห้อ/แบรนด์");
  if (!form.model?.trim()) errors.push("กรุณาเลือกรุ่น");
  if (!form.year?.trim()) errors.push("กรุณาเลือกปี");
  if (!form.color?.trim()) errors.push("กรุณากรอกสี");
  if (!form.startDate) errors.push("กรุณาเลือกวันที่นำรถเข้าจอดซ่อม");
  if (!form.estimatedEndDate) errors.push("กรุณาเลือกกำหนดซ่อมเสร็จ/นัดรับรถ");
  if (!form.receiver?.trim()) errors.push("กรุณากรอกเจ้าหน้าที่รับรถ");

  if (form.paymentType === "Insurance" && !form.insuranceCompany?.trim()) {
    errors.push("กรุณากรอกชื่อบริษัทประกันภัย");
  }

  return { ok: errors.length === 0, errors };
}
