
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

export type CustomerCreateInput = {
  name: string;
  phone: string;
  address: string;
};

export type InsuranceCompanyRef =
  | { insuranceCompanyId: number; insuranceCompany?: never }
  | { insuranceCompanyId?: never; insuranceCompany?: never };

export type VehicleRef =
  | { vehicleId: number; vehicle?: never }
  | { vehicleId?: never; vehicle: VehicleCreateInput };

export type CustomerRef =
  | { customerId: number; customer?: never }
  | { customerId?: never; customer: CustomerCreateInput };


export type CreateJobPayloadBase = {
  jobNumber?: string;

  startDate: string; 
  estimatedEndDate: string; 
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

export type RegistrationLookupResult = {
  vehicleId: number;
  customerId: number;
  insuranceCompanyId?: number | null;
};

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
  receiverId: null,
  excessFee: 0,
  paymentType: "Insurance",
  insuranceCompany: "",
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  insuranceCompanyId: null,
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

function toIsoDateTime(dateString: string): string {
  const fixed = fixBuddhistYearToAD(dateString); 
  if (!fixed) return "";

  const date = new Date(`${fixed}T12:00:00:000Z`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

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

export function normalizeCreateJobPayload(
  form: JobFormData,
  lookup: RegistrationLookupResult | null,
): CreateJobPayload {

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

  const insurancePart: InsuranceCompanyRef =
    form.paymentType === "Insurance"
      ? typeof insuranceCompanyIdFromForm === "number"
        ? { insuranceCompanyId: insuranceCompanyIdFromForm }
        : typeof lookup?.insuranceCompanyId === "number"
          ? { insuranceCompanyId: lookup.insuranceCompanyId }
          : {}
      : {};

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

  if (!form.registration?.trim()) errors.push("กรุณากรอกทะเบียนรถ");

  if (!hasExistingVehicle) {
    if (!form.chassisNumber?.trim()) errors.push("กรุณากรอกเลขตัวถัง");
    if (!form.type?.trim()) errors.push("กรุณาเลือกประเภทรถ");
    if (!form.brand?.trim()) errors.push("กรุณาเลือกยี่ห้อ/แบรนด์");
    if (!form.model?.trim()) errors.push("กรุณาเลือกรุ่น");
    if (!form.year?.trim()) errors.push("กรุณาเลือกปี");
    if (!form.color?.trim()) errors.push("กรุณากรอกสี");
  }

  if (!hasExistingCustomer) {
    if (!form.customerName?.trim()) errors.push("กรุณากรอกชื่อ-นามสกุลลูกค้า");
    if (!form.customerPhone?.trim())
      errors.push("กรุณากรอกเบอร์โทรศัพท์ลูกค้า");
  }

  if (!form.startDate) errors.push("กรุณาเลือกวันที่นำรถเข้าจอดซ่อม");
  if (!form.estimatedEndDate) errors.push("กรุณาเลือกกำหนดซ่อมเสร็จ/นัดรับรถ");
  if (!form.receiver?.trim()) errors.push("กรุณากรอกเจ้าหน้าที่รับรถ");

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
