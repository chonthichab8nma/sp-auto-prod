import type { JobApi } from "../api/job.api";

export type JobDetailEditForm = {
  registration: string;
  chassisNumber: string;
  vinNumber: string;
  brand: string;
  model: string;
  type: string;
  year: string;
  color: string;
  startDate: string;
  estimatedEndDate: string;
  excessFee: number;
  receiverId: number | null;
  receiverName: string;
  repairDescription: string;
  notes: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentType: "Insurance" | "Cash";
  insuranceCompanyId: number | null;
};

function toYmd(isoLike: string | null | undefined): string {
  if (!isoLike) return "";
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toIsoOrNull(ymd: string): string | null {
  if (!ymd) return null;
  const d = new Date(`${ymd}T12:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function mapJobToDetailEditForm(job: JobApi): JobDetailEditForm {
  return {
    registration: job.vehicle.registration || "",
    chassisNumber: job.vehicle.chassisNumber || "",
    vinNumber: job.vehicle.vinNumber || "",
    brand: job.vehicle.brand || "",
    model: job.vehicle.model || "",
    type: job.vehicle.type || "",
    year: job.vehicle.year || "",
    color: job.vehicle.color || "",
    startDate: toYmd(job.startDate),
    estimatedEndDate: toYmd(job.estimatedEndDate),
    excessFee: Number(job.excessFee || 0),
    receiverId: job.receiverId ?? null,
    receiverName: job.receiver?.name || "",
    repairDescription: job.repairDescription || "",
    notes: job.notes || "",
    customerName: job.customer?.name || "",
    customerPhone: job.customer?.phone || "",
    customerAddress: job.customer?.address || "",
    paymentType: job.paymentType === "Insurance" ? "Insurance" : "Cash",
    insuranceCompanyId: job.insuranceCompanyId ?? null,
  };
}

export function buildJobUpdatePayload(job: JobApi, form: JobDetailEditForm) {
  return {
    receiver: form.receiverName.trim(),
    receiverId: form.receiverId,
    paymentType: form.paymentType,
    insuranceCompanyId:
      form.paymentType === "Insurance" ? form.insuranceCompanyId : null,
    repairDescription: form.repairDescription.trim(),
    excessFee: Number(form.excessFee) || 0,
    notes: form.notes.trim() ? form.notes.trim() : null,
    startDate: toIsoOrNull(form.startDate),
    estimatedEndDate: toIsoOrNull(form.estimatedEndDate),
    vehicleId: job.vehicleId,
    customerId: job.customerId,
    vehicle: {
      registration: form.registration.trim(),
      chassisNumber: form.chassisNumber.trim() || null,
      vinNumber: form.vinNumber.trim() || null,
      brand: form.brand.trim(),
      model: form.model.trim(),
      type: form.type.trim(),
      year: form.year.trim(),
      color: form.color.trim(),
    },
    customer: {
      name: form.customerName.trim(),
      phone: form.customerPhone.trim(),
      address: form.customerAddress.trim(),
    },
  };
}

export function validateJobDetailEdit(form: JobDetailEditForm) {
  const errors: Partial<Record<keyof JobDetailEditForm, string>> = {};

  const req = (field: keyof JobDetailEditForm, message: string) => {
    const value = form[field];
    if (typeof value === "number") {
      if (!Number.isFinite(value)) errors[field] = message;
      return;
    }
    if (value === null || value === undefined || !String(value).trim()) {
      errors[field] = message;
    }
  };

  req("registration", "กรุณากรอกทะเบียนรถ");
  req("chassisNumber", "กรุณากรอกเลขตัวถัง");
  req("brand", "กรุณาเลือกยี่ห้อ/แบรนด์");
  req("model", "กรุณาเลือกรุ่น");
  req("type", "กรุณาระบุประเภทรถ");
  req("year", "กรุณาเลือกปี");
  req("color", "กรุณาระบุสี");
  req("startDate", "กรุณาเลือกวันที่นำรถเข้าจอดซ่อม");
  req("estimatedEndDate", "กรุณาเลือกกำหนดซ่อมเสร็จ/นัดรับรถ");
  req("receiverName", "กรุณาเลือกเจ้าหน้าที่รับรถ");
  req("customerName", "กรุณากรอกชื่อ-นามสกุลลูกค้า");
  req("customerPhone", "กรุณากรอกเบอร์โทรศัพท์ลูกค้า");
  req("customerAddress", "กรุณากรอกที่อยู่ลูกค้า");

  if (form.paymentType === "Insurance" && !form.insuranceCompanyId) {
    errors.insuranceCompanyId = "กรุณาเลือกบริษัทประกัน";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  };
}
