// src/features/jobs/types/jobForm.ts
import type { JobFormData } from "../../../Type";

/**
 * =========================
 * Input types (create new)
 * =========================
 */
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

export type CustomerCreateInput = {
  name: string;
  phone: string;
  address: string;
};

/**
 * =========================
 * "Either-or" references
 * =========================
 */
export type InsuranceCompanyRef =
  | { insuranceCompanyId: number; insuranceCompany?: never }
  | { insuranceCompanyId?: never; insuranceCompany?: never };

export type VehicleRef =
  | { vehicleId: number; vehicle?: never }
  | { vehicleId?: never; vehicle: VehicleCreateInput };

export type CustomerRef =
  | { customerId: number; customer?: never }
  | { customerId?: never; customer: CustomerCreateInput };

/**
 * =========================
 * Create Job Payload
 * =========================
 * ปรับให้ตรงแนว swagger ตัวอย่าง: startDate เป็น string($date-time)
 * และเพื่อให้สอดคล้องกับ validate ของฟอร์ม: มี receiver + estimatedEndDate
 */
export type CreateJobPayloadBase = {
  jobNumber?: string;

  startDate: string; // ISO date-time
  estimatedEndDate: string; // ISO date-time
  receiver: string;

  paymentType: string;
  repairDescription?: string;
  excessFee: number;
  notes?: string | null;
  
};

export type CreateJobPayload = CreateJobPayloadBase &
  VehicleRef &
  CustomerRef &
  InsuranceCompanyRef;

/**
 * =========================
 * ผลลัพธ์การ “ค้นทะเบียน”
 * =========================
 * เวอร์ชันนี้ยังคงเป็น "id เป็นหลัก" (เหมาะกับ normalize)
 * ถ้าคุณอยาก autofill ให้ครบ (รถ/ลูกค้า/ประกัน) ให้ขยาย type นี้/เพิ่ม API fetch ต่อ
 */
export type RegistrationLookupResult = {
  vehicleId: number;
  customerId: number;
  insuranceCompanyId?: number | null;
};

/**
 * =========================
 * default form
 * =========================
 */
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
  insuranceCompanyId: null,
});

/**
 * =========================
 * Date helpers
 * =========================
 */
export function fixBuddhistYearToAD(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  if (date.getFullYear() > 2400) {
    date.setFullYear(date.getFullYear() - 543);
  }
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

/**
 * แปลงวันที่จาก input (รองรับ พ.ศ.) -> ISO date-time (string($date-time))
 * - ใช้ 00:00:00 ของวันนั้น แล้ว toISOString()
 * - ถ้าต้องการให้ BE มองเป็น timezone local แบบชัด ๆ ต้องตกลง format กันอีกที
 */
function toIsoDateTime(dateString: string): string {
  const fixed = fixBuddhistYearToAD(dateString); // YYYY-MM-DD
  if (!fixed) return "";

  const date = new Date(`${fixed}T12:00:00:000Z`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

/**
 * =========================
 * Safe field readers
 * (กรณี JobFormData อาจยังไม่ประกาศ field บางตัวใน type)
 * =========================
 */
function readOptionalStringField<K extends string>(
  obj: object,
  key: K,
): string | undefined {
  if (!(key in obj)) return undefined;
  const value = (obj as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

function readOptionalNullableStringField<K extends string>(
  obj: object,
  key: K,
): string | null | undefined {
  if (!(key in obj)) return undefined;
  const value = (obj as Record<string, unknown>)[key];
  if (value === null) return null;
  return typeof value === "string" ? value : undefined;
}

function readOptionalNumberField<K extends string>(
  obj: object,
  key: K,
): number | undefined {
  if (!(key in obj)) return undefined;
  const value = (obj as Record<string, unknown>)[key];
  return typeof value === "number" ? value : undefined;
}

/**
 * =========================
 * Normalize: form -> payload
 * =========================
 * เงื่อนไข:
 * - ถ้า lookup != null (มีรถในระบบแล้ว) => ส่ง vehicleId/customerId (+ insuranceCompanyId ถ้ามี)
 * - ถ้า lookup == null (ไม่เคยมี) => ส่ง vehicle/customer object เพื่อสร้างใหม่
 * - paymentType === "Insurance" => ต้องส่งประกัน (id หรือ name)
 */
export function normalizeCreateJobPayload(
  form: JobFormData,
  lookup: RegistrationLookupResult | null,
): CreateJobPayload {
  // optional fields (ถ้า JobFormData มี/ไม่มี ก็ยังอ่านได้ปลอดภัย)
  const repairDescription = readOptionalStringField(form, "repairDescription");
  const notes = readOptionalNullableStringField(form, "notes");
  const vinNumber = readOptionalStringField(form, "vinNumber");
  const insuranceCompanyIdFromForm = readOptionalNumberField(
    form,
    "insuranceCompanyId",
  );

  const base: CreateJobPayloadBase = {
    startDate: toIsoDateTime(form.startDate),
    estimatedEndDate: toIsoDateTime(form.estimatedEndDate),
    receiver: form.receiver.trim(),

    paymentType: form.paymentType,
    repairDescription,
    excessFee: Number(form.excessFee) || 0,
    notes: notes ?? null,
  };

  // ประกัน: ถ้า Insurance ต้องส่ง (id หรือ name อย่างใดอย่างหนึ่ง)
  const insurancePart: InsuranceCompanyRef =
    form.paymentType === "Insurance"
      ? typeof insuranceCompanyIdFromForm === "number"
        ? { insuranceCompanyId: insuranceCompanyIdFromForm }
        : typeof lookup?.insuranceCompanyId === "number"
          ? { insuranceCompanyId: lookup.insuranceCompanyId }
          : {}
      : {};

  // เจอทะเบียนแล้ว => ส่ง id
  if (lookup) {
    return {
      ...base,
      ...insurancePart,
      vehicleId: lookup.vehicleId,
      customerId: lookup.customerId,
    };
  }

  function requiredString(
    value: string | undefined,
    fieldName: string,
  ): string {
    if (!value?.trim()) {
      throw new Error(`Missing required field: ${fieldName}`);
    }
    return value.trim();
  }
  // ไม่เจอทะเบียน => ส่ง object เพื่อสร้างใหม่
  return {
    ...base,
    ...insurancePart,
    vehicle: {
      registration: form.registration.trim(),
      brand: form.brand || undefined,
      model: form.model || undefined,
      type: form.type || undefined,
      year: form.year || undefined,
      color: form.color || undefined,
      chassisNumber: form.chassisNumber || undefined,
      vinNumber: vinNumber || undefined,
    },
    customer: {
      name: requiredString(form.customerName, "customerName"),
      phone: requiredString(form.customerPhone, "customerPhone"),
      address: (form.customerAddress ?? "").trim(),
    },
  };
}

/**
 * =========================
 * Validate
 * =========================
 * - opts.hasExistingVehicle / hasExistingCustomer: คุม required fields สำหรับเคสมี/ไม่มีข้อมูลในระบบ
 * - opts.lookup: เอาไว้ช่วย validate ประกัน (กรณีมี insuranceCompanyId มาจาก lookup)
 */
export function validateCreateJob(
  form: JobFormData,
  opts?: {
    hasExistingVehicle?: boolean;
    hasExistingCustomer?: boolean;
    lookup?: RegistrationLookupResult | null;
  },
) {
  const errors: string[] = [];
  const hasExistingVehicle = !!opts?.hasExistingVehicle;
  const hasExistingCustomer = !!opts?.hasExistingCustomer;
  const lookup = opts?.lookup ?? null;

  // ต้องมีทะเบียนเสมอ
  if (!form.registration?.trim()) errors.push("กรุณากรอกทะเบียนรถ");

  // ตรวจวัน (เทียบเวลาแบบจริง)
  // if (form.startDate && form.estimatedEndDate) {
  //   const startIso = toIsoDateTime(form.startDate);
  //   const endIso = toIsoDateTime(form.estimatedEndDate);

  //   const startMs = new Date(startIso).getTime();
  //   const endMs = new Date(endIso).getTime();

  //   if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
  //     errors.push("รูปแบบวันที่ไม่ถูกต้อง");
  //   } else if (endMs <= startMs) {
  //     errors.push(
  //       "กำหนดซ่อมเสร็จ/นัดรับรถ ต้องหลังวันที่นำรถเข้าจอดซ่อมอย่างน้อย 1 วัน",
  //     );
  //   }
  // }

  // ถ้า “ไม่เจอรถในระบบ” -> บังคับรายละเอียดรถ
  if (!hasExistingVehicle) {
    if (!form.chassisNumber?.trim()) errors.push("กรุณากรอกเลขตัวถัง");
    if (!form.type?.trim()) errors.push("กรุณาเลือกประเภทรถ");
    if (!form.brand?.trim()) errors.push("กรุณาเลือกยี่ห้อ/แบรนด์");
    if (!form.model?.trim()) errors.push("กรุณาเลือกรุ่น");
    if (!form.year?.trim()) errors.push("กรุณาเลือกปี");
    if (!form.color?.trim()) errors.push("กรุณากรอกสี");
  }

  // ถ้า “ไม่เจอลูกค้าในระบบ” -> บังคับรายละเอียดลูกค้า
  if (!hasExistingCustomer) {
    if (!form.customerName?.trim()) errors.push("กรุณากรอกชื่อ-นามสกุลลูกค้า");
    if (!form.customerPhone?.trim())
      errors.push("กรุณากรอกเบอร์โทรศัพท์ลูกค้า");
  }

  // ข้อมูลงานซ่อม
  if (!form.startDate) errors.push("กรุณาเลือกวันที่นำรถเข้าจอดซ่อม");
  if (!form.estimatedEndDate) errors.push("กรุณาเลือกกำหนดซ่อมเสร็จ/นัดรับรถ");
  if (!form.receiver?.trim()) errors.push("กรุณากรอกเจ้าหน้าที่รับรถ");

  // การจ่ายเงิน: Insurance ต้องมีบริษัทประกัน (id หรือ name)
  const insuranceCompanyIdFromForm = readOptionalNumberField(
    form,
    "insuranceCompanyId",
  );
  const hasInsuranceId =
    typeof insuranceCompanyIdFromForm === "number" ||
    typeof lookup?.insuranceCompanyId === "number";

  if (form.paymentType === "Insurance" && !hasInsuranceId) {
    errors.push("กรุณาเลือกบริษัทประกันภัย");
  }

  return { ok: errors.length === 0, errors };
}
