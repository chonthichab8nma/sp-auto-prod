import { useState } from "react";
import { ChevronLeft, Save, X } from "lucide-react";
import type { Job } from "../../../Type";

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
    className={`flex flex-col md:flex-row py-8 ${
      hasBorder ? "border-b border-gray-100" : ""
    }`}
  >
    <div className="w-full md:w-1/3 mb-6 md:mb-0">
      <h3 className="font-bold text-slate-800 text-base">{title}</h3>
      <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
    </div>
    <div className="w-full md:w-2/3">{children}</div>
  </div>
);

function FormRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start py-2">
      <span className="w-40 text-slate-400 font-light text-sm pt-2">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Input({
  readOnly,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { readOnly?: boolean }) {
  return (
    <input
      {...props}
      disabled={readOnly || props.disabled}
      className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none
        ${
          readOnly
            ? "bg-slate-50 text-slate-600 cursor-not-allowed"
            : "bg-white focus:ring-2 focus:ring-blue-500"
        }
      `}
    />
  );
}

function TextArea({
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm
                 focus:ring-2 focus:ring-blue-500 outline-none bg-white min-h-24"
    />
  );
}

function ReadOnlyValue({ value }: { value?: React.ReactNode }) {
  return (
    <div className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
      {value || "-"}
    </div>
  );
}

interface Props {
  job: Job;
  onSave: (job: Job) => void;
  onCancel: () => void;
}

export default function JobEditPage({ job, onSave, onCancel }: Props) {
  const [form, setForm] = useState<Job>({ ...job });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    setForm((prev) => {
      if (type === "number") {
        return {
          ...prev,
          [name]: value === "" ? undefined : Number(value),
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  return (
    <div className="p-6 min-h-screen bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="w-8 h-8   rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 text-slate-500"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">แก้ไขข้อมูลรถ</h1>
            <p className="text-slate-400 text-sm">
              ปรับข้อมูลให้ถูกต้องก่อนบันทึก
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <X size={16} /> ยกเลิก
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700"
          >
            <Save size={16} /> บันทึก
          </button>
        </div>
      </div>

      <div className="mb-6 text-slate-500 text-sm">
        สเตชั่น /{" "}
        <span className="text-slate-900 font-medium">
          แก้ไข {job.registration}
        </span>
      </div>

      <div className="bg-white py-2">
        <Section title="รายละเอียดรถ" subtitle="ข้อมูลรถ">
          <div className="space-y-1">
            <FormRow label="ทะเบียนรถ">
              <Input
                name="registration"
                value={form.registration}
                onChange={handleChange}
                placeholder="เช่น กข-1234"
              />
            </FormRow>

            <FormRow label="เลขตัวถัง">
              <Input
                name="bagNumber"
                value={form.bagNumber}
                onChange={handleChange}
                placeholder="ระบุเลขตัวถัง"
              />
            </FormRow>

            <FormRow label="ยี่ห้อ/แบรนด์">
              <Input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="เช่น Toyota"
              />
            </FormRow>

            <FormRow label="รุ่น">
              <Input
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="เช่น Camry"
              />
            </FormRow>

            <FormRow label="ปี">
              <Input
                name="year"
                value={form.year}
                onChange={handleChange}
                placeholder="เช่น 2020"
              />
            </FormRow>

            <FormRow label="สี">
              <Input
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="เช่น ดำ"
              />
            </FormRow>
          </div>
        </Section>

        <Section title="รายละเอียดการซ่อม" subtitle="ข้อมูลการซ่อม">
          <div className="space-y-1">
            <FormRow label="วันที่นำรถเข้าจอดซ่อม">
              <ReadOnlyValue value={form.startDate || "ไม่ระบุ"} />
            </FormRow>

            <FormRow label="กำหนดซ่อมเสร็จ/นัดรับรถ">
              <ReadOnlyValue value={form.estimatedEndDate || "ไม่ระบุ"} />
            </FormRow>

            <FormRow label="ค่าความเสียหายส่วนแรก (บาท)">
              <ReadOnlyValue
                value={
                  form.excessFee !== undefined && form.excessFee !== null
                    ? `฿ ${Number(form.excessFee).toLocaleString("th-TH")}`
                    : "ไม่ระบุ"
                }
              />
            </FormRow>

            <FormRow label="เจ้าหน้าที่รับรถ">
              <ReadOnlyValue value="พนักงานรับรถ (ตัวอย่าง)" />
            </FormRow>
          </div>

          <p className="text-xs text-slate-400 mt-3">
            * ข้อมูลส่วนนี้แสดงเพื่ออ้างอิง ไม่สามารถแก้ไขได้
          </p>
        </Section>

        {/* รายละเอียดลูกค้า */}
        <Section title="รายละเอียดลูกค้า" subtitle="ข้อมูลลูกค้า">
          <div className="space-y-1">
            <FormRow label="ชื่อ-นามสกุล">
              <Input
                name="customerName"
                value={form.customerName || ""}
                onChange={handleChange}
                placeholder="ไม่ระบุ"
              />
            </FormRow>

            <FormRow label="เบอร์โทรศัพท์">
              <Input
                name="customerPhone"
                value={form.customerPhone || ""}
                onChange={handleChange}
                placeholder="ไม่ระบุ"
              />
            </FormRow>

            <FormRow label="ที่อยู่">
              <TextArea
                name="customerAddress"
                value={form.customerAddress || ""}
                onChange={handleChange}
                placeholder="ไม่ระบุ"
              />
            </FormRow>
          </div>
        </Section>

        <Section
          title="รายละเอียดการชำระเงิน"
          subtitle="ข้อมูลการชำระเงิน"
          hasBorder={false}
        >
          <div className="space-y-1">
            <FormRow label="ประเภทการชำระเงิน">
              <ReadOnlyValue
                value={
                  form.paymentType === "Insurance"
                    ? "ประกันภัย (เคลม)"
                    : "เงินสด"
                }
              />
            </FormRow>

            <FormRow label="ชื่อบริษัทประกันภัย">
              <ReadOnlyValue
                value={
                  form.paymentType === "Insurance"
                    ? form.insuranceCompany || "ไม่ระบุ"
                    : "-"
                }
              />
            </FormRow>
          </div>
        </Section>
      </div>
    </div>
  );
}
