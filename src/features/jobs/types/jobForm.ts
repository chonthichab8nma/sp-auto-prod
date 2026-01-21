// src/features/jobs/types/jobForm.ts
import type { JobFormData } from "../../../Type";

export type VehicleCreateInput = {
  registration: string;
  brand?: string;
  model?: string;
  type?: string;
  year?: string;
  color?: string;
  chassisNumber?: string;
  vinNumber?: string;
};

export type CreateJobPayload =
  | (Omit<JobFormData, never> & { vehicleId: number; vehicle?: never })
  | (Omit<JobFormData, never> & { vehicleId?: never; vehicle: VehicleCreateInput });

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

/**
 * ✅ ใช้ตอนสร้าง payload สำหรับ POST /jobs
 * - ถ้ามี vehicleId => ส่ง vehicleId
 * - ถ้าไม่มี => ส่ง vehicle object เพื่อให้ BE สร้างรถใหม่
 */
export function normalizeCreateJobPayloadWithVehicle(
  form: JobFormData,
  vehicleId: number | null,
): CreateJobPayload {
  const base: Omit<JobFormData, never> = {
    ...form,
    excessFee: Number(form.excessFee) || 0,
    startDate: fixBuddhistYearToAD(form.startDate),
    estimatedEndDate: fixBuddhistYearToAD(form.estimatedEndDate),
    insuranceCompany: form.paymentType === "Insurance" ? form.insuranceCompany : "",
  };

  if (vehicleId != null) {
    return {
      ...base,
      vehicleId,
    };
  }

  // รถใหม่ -> ส่ง vehicle (ให้ BE lookup/สร้าง)
  return {
    ...base,
    vehicle: {
      registration: form.registration.trim(),
      brand: form.brand || undefined,
      model: form.model || undefined,
      type: form.type || undefined,
      year: form.year || undefined,
      color: form.color || undefined,
      chassisNumber: form.chassisNumber || undefined,
      // ถ้า JobFormData ไม่มี vinNumber ก็ไม่เป็นไร (ปล่อย undefined)
      vinNumber: (form as unknown as { vinNumber?: string }).vinNumber,
    },
  };
}

/**
 * ✅ alias เผื่ออยากเรียกชื่อแบบนี้
 */
export function normalizeCreateJobPayload(
  form: JobFormData,
  vehicleId: number | null,
): CreateJobPayload {
  return normalizeCreateJobPayloadWithVehicle(form, vehicleId);
}

/**
 * ✅ validate แบบฉลาด:
 * - ถ้าเจอรถในระบบแล้ว (hasExistingVehicle=true)
 *   จะไม่บังคับกรอกรายละเอียดรถ (brand/model/type/year/color/chassis)
 * - แต่ยังบังคับทะเบียน + ข้อมูลงานซ่อม + payment/insurance ตามเดิม
 */
export function validateCreateJob(
  form: JobFormData,
  opts?: { hasExistingVehicle?: boolean },
) {
  const errors: string[] = [];
  const hasExistingVehicle = !!opts?.hasExistingVehicle;

  // ตรวจวัน (แก้ปี พ.ศ. เผื่อ)
  if (form.startDate && form.estimatedEndDate) {
    const start = fixBuddhistYearToAD(form.startDate);
    const end = fixBuddhistYearToAD(form.estimatedEndDate);

    if (end <= start) {
      errors.push(
        "กำหนดซ่อมเสร็จ/นัดรับรถ ต้องหลังวันที่นำรถเข้าจอดซ่อมอย่างน้อย 1 วัน",
      );
    }
  }

  // ต้องมีทะเบียนเสมอ
  if (!form.registration?.trim()) errors.push("กรุณากรอกทะเบียนรถ");

  // ถ้า “ไม่เจอรถในระบบ” -> บังคับรายละเอียดรถ
  if (!hasExistingVehicle) {
    if (!form.chassisNumber?.trim()) errors.push("กรุณากรอกเลขตัวถัง");
    if (!form.type?.trim()) errors.push("กรุณาเลือกประเภทรถ");
    if (!form.brand?.trim()) errors.push("กรุณาเลือกยี่ห้อ/แบรนด์");
    if (!form.model?.trim()) errors.push("กรุณาเลือกรุ่น");
    if (!form.year?.trim()) errors.push("กรุณาเลือกปี");
    if (!form.color?.trim()) errors.push("กรุณากรอกสี");
  }

  // ข้อมูลงานซ่อม
  if (!form.startDate) errors.push("กรุณาเลือกวันที่นำรถเข้าจอดซ่อม");
  if (!form.estimatedEndDate) errors.push("กรุณาเลือกกำหนดซ่อมเสร็จ/นัดรับรถ");
  if (!form.receiver?.trim()) errors.push("กรุณากรอกเจ้าหน้าที่รับรถ");

  // การจ่ายเงิน
  if (form.paymentType === "Insurance" && !form.insuranceCompany?.trim()) {
    errors.push("กรุณากรอกชื่อบริษัทประกันภัย");
  }

  return { ok: errors.length === 0, errors };
}
