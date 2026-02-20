import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  CarFront,
  CalendarIcon,
} from "lucide-react";

import type { JobApi } from "../api/job.api";
import { formatThaiDate } from "../../../shared/lib/date";
import {
  vehiclesService,
  type VehicleBrandApi,
} from "../services/vehicles.service";
import { buildJobTimelineStages } from "../lib/stage";
import {
  resolveBrandLogoUrl,
  resolveVehicleTypeFromCatalog,
} from "../lib/vehicleCatalog";
import FormInput from "../../../shared/components/form/FormInput";
import FormSelect from "../../../shared/components/form/FormSelect";
import DatePickerPopover from "../../../shared/components/ui/DateRangePickerPopover";
import EmployeeAutocomplete from "../../../shared/components/ui/EmployeeAutocomplete";
import { useJobDetailEditForm } from "../hooks/useJobDetailEditForm";
import type { JobDetailEditForm } from "../types/jobDetailEdit";
import { useAuth } from "../../../shared/auth/useAuth";
import { getJobReceipt } from "../api/receipt.api";

const Section = ({
  title,
  subtitle,
  children,
  hasBorder = true,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  hasBorder?: boolean;
}) => (
  <div
    className={`flex flex-col md:flex-row py-8 ${hasBorder ? "border-b border-gray-100" : ""}`}
  >
    <div className="w-full md:w-1/3 mb-6 md:mb-0">
      <h3 className="font-bold text-slate-800 text-base">{title}</h3>
      <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
    </div>
    <div className="w-full md:w-2/3">
      <div className="w-full md:max-w-xl md:mx-auto">{children}</div>
    </div>
  </div>
);

const RowItem = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => (
  <>
    <span className="text-slate-400 text-sm leading-5">{label}</span>
    <span className="text-slate-900 font-medium text-sm leading-5">
      {value || "-"}
    </span>
  </>
);

const StackItem = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-slate-400 font-light text-sm leading-5">{label}</span>
    <span className="text-slate-900 font-medium text-sm leading-5">
      {value || "-"}
    </span>
  </div>
);

const LabelWithStar = ({ text }: { text: string }) => (
  <span className="inline-flex items-center gap-1">
    {text}
    <span className="text-red-500">*</span>
  </span>
);

function toAbsoluteUrl(raw?: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/")) return `${import.meta.env.VITE_API_BASE_URL}${raw}`;
  return raw;
}

export default function JobDetailPage({
  job,
  onRefresh,
}: {
  job: JobApi | null;
  onRefresh?: () => void;
}) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [brands, setBrands] = useState<VehicleBrandApi[]>([]);
  const [logoLoadError, setLogoLoadError] = useState(false);
  const [vehicleTypeFromDb, setVehicleTypeFromDb] = useState<string>("");
  const [savedPreview, setSavedPreview] = useState<JobDetailEditForm | null>(
    null,
  );
  const [receiptViewUrl, setReceiptViewUrl] = useState<string | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  const {
    editing,
    saving,
    errors,
    form,
    brandOptions,
    modelOptions,
    yearOptions,
    insuranceOptions,
    isLoadingModels,
    receiverEmployee,
    handleInputChange,
    onChangeField,
    onChangeEmployee,
    startEdit,
    cancelEdit,
    submit,
  } = useJobDetailEditForm(job, (savedForm) => {
    setSavedPreview(savedForm);
    onRefresh?.();
  });

  const handleBack = () => navigate(-1);
  const handleCheckStation = () => navigate(`/stations/${job?.id}`);
  const canEditJob = role === "superadmin";
  const canEditVehicleDetails = false;

  const stages = useMemo(() => (job ? buildJobTimelineStages(job) : []), [job]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await vehiclesService.listBrands();
        if (!alive) return;
        setBrands(data);
      } catch {
        if (!alive) return;
        setBrands([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const brandLogoUrl = useMemo(() => {
    return resolveBrandLogoUrl(brands, job?.vehicle?.brand);
  }, [brands, job?.vehicle?.brand]);

  const vehicleTypeFromCatalog = useMemo(() => {
    return resolveVehicleTypeFromCatalog(
      brands,
      job?.vehicle?.brand,
      job?.vehicle?.model,
    );
  }, [brands, job?.vehicle?.brand, job?.vehicle?.model]);

  useEffect(() => {
    setLogoLoadError(false);
  }, [brandLogoUrl]);

  useEffect(() => {
    setSavedPreview(null);
  }, [job?.id, job?.updatedAt]);

  useEffect(() => {
    if (!canEditJob && editing) {
      cancelEdit();
    }
  }, [canEditJob, editing, cancelEdit]);

  useEffect(() => {
    let alive = true;
    const registration = job?.vehicle?.registration?.trim();

    if (!registration) {
      setVehicleTypeFromDb("");
      return;
    }

    (async () => {
      try {
        const vehicle = await vehiclesService.findVehicleByReg(registration);
        if (!alive) return;
        setVehicleTypeFromDb(vehicle?.type ?? "");
      } catch {
        if (!alive) return;
        setVehicleTypeFromDb("");
      }
    })();

    return () => {
      alive = false;
    };
  }, [job?.vehicle?.registration]);

  useEffect(() => {
    let alive = true;

    if (!job?.id) {
      setReceiptViewUrl(null);
      setReceiptLoading(false);
      return;
    }

    (async () => {
      setReceiptLoading(true);
      try {
        const receipt = await getJobReceipt(job.id);
        if (!alive) return;
        const rawUrl = receipt.receiptViewUrl || receipt.receiptUrl || "";
        setReceiptViewUrl(toAbsoluteUrl(rawUrl));
      } catch {
        if (!alive) return;
        const jobReceipt = (job as JobApi & {
          receiptViewUrl?: string;
          receiptUrl?: string;
        });
        const photoReceipt = (job?.jobPhotos as Array<Record<string, unknown>> | undefined)
          ?.find((img) => String(img?.fileName ?? "").startsWith("__receipt__"));

        const fallbackRaw = jobReceipt.receiptViewUrl
          || jobReceipt.receiptUrl
          || (photoReceipt?.viewUrl as string | undefined)
          || (photoReceipt?.url as string | undefined)
          || null;
        setReceiptViewUrl(toAbsoluteUrl(fallbackRaw));
      } finally {
        if (alive) setReceiptLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [job]);

  const displayVehicleType =
    vehicleTypeFromDb || job?.vehicle?.type || vehicleTypeFromCatalog || "-";

  const selectedInsuranceOption = useMemo(() => {
    if (!form?.insuranceCompanyId) return "";
    return (
      insuranceOptions.find((o) => o.startsWith(`${form.insuranceCompanyId}::`)) ||
      ""
    );
  }, [form?.insuranceCompanyId, insuranceOptions]);

  const displayCustomerName = savedPreview?.customerName || job?.customer?.name || "ไม่ระบุ";
  const displayCustomerPhone = savedPreview?.customerPhone || job?.customer?.phone || "ไม่ระบุ";
  const displayCustomerAddress = savedPreview?.customerAddress || job?.customer?.address || "ไม่ระบุ";
  const displayPaymentType =
    (savedPreview?.paymentType || job?.paymentType) === "Insurance"
      ? "ประกันภัย (เคลม)"
      : "เงินสด";
  const displayInsuranceCompanyName = (() => {
    const selectedId = savedPreview?.insuranceCompanyId ?? job?.insuranceCompanyId;
    if (!selectedId) return "-";
    const matched = insuranceOptions.find((o) => o.startsWith(`${selectedId}::`));
    return matched ? matched.split("::").slice(1).join("::") : job?.insuranceCompany?.name ?? "-";
  })();
  const displayClaimAmount = `฿ ${Number(savedPreview?.claimAmount ?? job?.claimAmount ?? 0).toLocaleString("th-TH")}`;

  if (!job || !form) {
    return (
      <div className="p-6 min-h-screen bg-white">
        <p className="text-slate-500">ไม่พบข้อมูลงาน</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 text-slate-500"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            {stages?.map((stage, idx) => {
              const isActive = idx === job?.currentStageIndex;
              const isCompleted = stage.isCompleted;

              return (
                <div key={stage.id} className="flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 text-gray-500"
                    }`}
                  >
                    {isCompleted ? <Check size={12} /> : idx + 1}
                  </span>
                  <span
                    className={`font-medium ${
                      isCompleted || isActive
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    {stage.name}
                  </span>
                  {idx < stages.length - 1 && (
                    <ChevronRight size={16} className="text-gray-300" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEditJob && editing ? (
            <>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                disabled={saving}
              >
                ยกเลิก
              </button>
              <button
                onClick={submit}
                className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </>
          ) : canEditJob ? (
            <button
              onClick={startEdit}
              className="px-5 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              แก้ไขข้อมูล
            </button>
          ) : null}

          <button
            onClick={handleCheckStation}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700"
          >
            เช็กสถานะรถ
          </button>
        </div>
      </div>

      <div className="mb-6 text-slate-500 text-sm">
        สเตชั่น /{" "}
        <span className="text-slate-900 font-medium">
          รายละเอียด {job?.vehicle.registration}
        </span>
      </div>

      <div className="bg-white py-2">
        <Section title="รายละเอียดรถ" subtitle="ข้อมูลรถ">
          {!editing || !canEditVehicleDetails ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {brandLogoUrl && !logoLoadError ? (
                    <img
                      src={brandLogoUrl}
                      alt={job?.vehicle.brand || "vehicle brand"}
                      className="h-10 w-10 object-contain"
                      onError={() => setLogoLoadError(true)}
                    />
                  ) : (
                    <CarFront size={40} className="text-slate-800" />
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-lg font-bold text-slate-900">
                        {job?.vehicle.brand}
                      </h1>
                      {receiptLoading ? (
                        <span className="rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-500">
                          กำลังโหลดใบเสร็จ...
                        </span>
                      ) : receiptViewUrl ? (
                        <a
                          href={receiptViewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                        >
                          ใบเสร็จ
                        </a>
                      ) : null}
                    </div>
                    <p className="text-slate-400 text-sm">
                      {job?.vehicle.model} {job?.vehicle.year} {displayVehicleType}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                <RowItem label="ทะเบียนรถ" value={job?.vehicle.registration} />
                <RowItem
                  label="เลขตัวถัง"
                  value={job?.vehicle.chassisNumber ?? "-"}
                />
                <RowItem label="ยี่ห้อ/แบรนด์" value={job?.vehicle.brand} />
                <RowItem label="รุ่น" value={job?.vehicle.model} />
                <RowItem label="ประเภทรถ" value={displayVehicleType} />
                <RowItem label="ปี" value={job?.vehicle.year} />
                <RowItem label="สี" value={job?.vehicle.color} />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label={<LabelWithStar text="ทะเบียนรถ" />}
                name="registration"
                value={form.registration}
                onChange={handleInputChange}
                error={errors.registration}
              />
              <FormInput
                label={<LabelWithStar text="เลขตัวถัง" />}
                name="chassisNumber"
                value={form.chassisNumber}
                onChange={handleInputChange}
                error={errors.chassisNumber}
              />
              <FormInput
                label="VIN"
                name="vinNumber"
                value={form.vinNumber}
                onChange={handleInputChange}
                error={errors.vinNumber}
              />
              <FormSelect
                options={brandOptions}
                label={<LabelWithStar text="ยี่ห้อ/แบรนด์" />}
                name="brand"
                value={form.brand}
                onChange={handleInputChange}
                placeholder="เลือกยี่ห้อ"
                error={errors.brand}
              />
              <FormSelect
                options={modelOptions}
                label={<LabelWithStar text="รุ่น" />}
                name="model"
                value={form.model}
                onChange={handleInputChange}
                placeholder={isLoadingModels ? "กำลังโหลดรุ่น..." : "เลือกรุ่น"}
                error={errors.model}
              />
              <FormInput
                label={<LabelWithStar text="ประเภทรถ" />}
                name="type"
                value={form.type}
                onChange={handleInputChange}
                error={errors.type}
              />
              <FormSelect
                options={yearOptions}
                label={<LabelWithStar text="ปี" />}
                name="year"
                value={form.year}
                onChange={handleInputChange}
                placeholder="ปี"
                error={errors.year}
              />
              <FormInput
                label={<LabelWithStar text="สี" />}
                name="color"
                value={form.color}
                onChange={handleInputChange}
                error={errors.color}
              />
            </div>
          )}
        </Section>

        <Section title="รายละเอียดการซ่อม" subtitle="ข้อมูลการซ่อม">
          {!editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <StackItem
                label="วันที่นำรถเข้าจอดซ่อม"
                value={formatThaiDate(job?.startDate)}
              />
              <StackItem
                label="กำหนดซ่อมเสร็จ/นัดรับรถ"
                value={formatThaiDate(job?.estimatedEndDate)}
              />
              <StackItem
                label="ค่าความเสียหายส่วนแรก"
                value={`฿ ${Number(job?.excessFee ?? 0).toLocaleString("th-TH")}`}
              />
              <StackItem
                label="เจ้าหน้าที่รับรถ"
                value={job?.receiver?.name ?? "-"}
              />
              <div className="md:col-span-2">
                <StackItem
                  label="ความต้องการซ่อม"
                  value={job?.repairDescription ?? ""}
                />
              </div>
              <div className="md:col-span-2">
                <StackItem label="หมายเหตุ" value={job?.notes ?? ""} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePickerPopover
                mode="single"
                label="วันที่นำรถเข้าจอดซ่อม"
                value={form.startDate}
                onChange={(v) => onChangeField("startDate", v)}
                error={errors.startDate}
                icon={<CalendarIcon className="h-4 w-4" />}
              />
              <DatePickerPopover
                mode="single"
                label="กำหนดซ่อมเสร็จ/นัดรับรถ"
                value={form.estimatedEndDate}
                onChange={(v) => onChangeField("estimatedEndDate", v)}
                error={errors.estimatedEndDate}
                icon={<CalendarIcon className="h-4 w-4" />}
              />
              <FormInput
                label={<LabelWithStar text="ค่าความเสียหายส่วนแรก" />}
                name="excessFee"
                type="number"
                value={String(form.excessFee)}
                onChange={handleInputChange}
                error={errors.excessFee}
              />
              <EmployeeAutocomplete
                label={<LabelWithStar text="เจ้าหน้าที่รับรถ" />}
                value={receiverEmployee}
                onChange={onChangeEmployee}
                error={errors.receiverName ?? null}
                placeholder="เลือกพนักงาน"
              />
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-800">ความต้องการซ่อม</label>
                <textarea
                  name="repairDescription"
                  rows={3}
                  value={form.repairDescription}
                  onChange={(e) => onChangeField("repairDescription", e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:bg-slate-50 hover:border-slate-300 focus:border-blue-600 resize-y min-h-[88px]"
                />
              </div>
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-800">หมายเหตุ</label>
                <textarea
                  name="notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => onChangeField("notes", e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:bg-slate-50 hover:border-slate-300 focus:border-blue-600 resize-y min-h-[88px]"
                />
              </div>
            </div>
          )}
        </Section>

        <Section title="รายละเอียดลูกค้า" subtitle="ข้อมูลลูกค้า">
          {!editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <StackItem
                label="ชื่อ-นามสกุล"
                value={displayCustomerName}
              />
              <StackItem
                label="เบอร์โทรศัพท์"
                value={displayCustomerPhone}
              />
              <div className="md:col-span-2">
                <StackItem
                  label="ที่อยู่"
                  value={displayCustomerAddress}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label={<LabelWithStar text="ชื่อ-นามสกุล" />}
                name="customerName"
                value={form.customerName}
                onChange={handleInputChange}
                error={errors.customerName}
              />
              <FormInput
                label={<LabelWithStar text="เบอร์โทรศัพท์" />}
                name="customerPhone"
                value={form.customerPhone}
                onChange={handleInputChange}
                error={errors.customerPhone}
              />
              <div className="md:col-span-2">
                <FormInput
                  label={<LabelWithStar text="ที่อยู่" />}
                  name="customerAddress"
                  value={form.customerAddress}
                  onChange={handleInputChange}
                  error={errors.customerAddress}
                />
              </div>
            </div>
          )}
        </Section>

        <Section
          title="รายละเอียดการชำระเงิน"
          subtitle="ข้อมูลการชำระเงิน"
          hasBorder={false}
        >
          {!editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <StackItem
                label="ประเภทการชำระเงิน"
                value={displayPaymentType}
              />
              <StackItem
                label="ชื่อบริษัทประกันภัย"
                value={displayInsuranceCompanyName}
              />
              <StackItem
                label="จำนวนเงินประกัน"
                value={displayPaymentType === "ประกันภัย (เคลม)" ? displayClaimAmount : "-"}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label
                  className={`relative flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                    form.paymentType === "Insurance"
                      ? "border-blue-600 bg-white"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="font-medium text-slate-800 text-sm">ประกันภัย (เคลม)</span>
                  <input
                    type="radio"
                    name="paymentType"
                    value="Insurance"
                    checked={form.paymentType === "Insurance"}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      form.paymentType === "Insurance"
                        ? "border-blue-600"
                        : "border-slate-300"
                    }`}
                  >
                    {form.paymentType === "Insurance" && (
                      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                    )}
                  </div>
                </label>

                <label
                  className={`relative flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                    form.paymentType === "Cash"
                      ? "border-blue-600 bg-white"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="font-medium text-slate-800 text-sm">เงินสด</span>
                  <input
                    type="radio"
                    name="paymentType"
                    value="Cash"
                    checked={form.paymentType === "Cash"}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      form.paymentType === "Cash"
                        ? "border-blue-600"
                        : "border-slate-300"
                    }`}
                  >
                    {form.paymentType === "Cash" && (
                      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                    )}
                  </div>
                </label>
              </div>

              {form.paymentType === "Insurance" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect
                    label={<LabelWithStar text="บริษัทประกันภัย" />}
                    name="insuranceCompanyId"
                    value={selectedInsuranceOption}
                    options={insuranceOptions}
                    placeholder="เลือกบริษัทประกัน"
                    onChange={handleInputChange}
                    error={errors.insuranceCompanyId}
                  />
                  <FormInput
                    label={<LabelWithStar text="จำนวนเงินประกัน" />}
                    name="claimAmount"
                    type="number"
                    value={String(form.claimAmount)}
                    onChange={handleInputChange}
                    error={errors.claimAmount}
                  />
                </div>
              ) : null}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
