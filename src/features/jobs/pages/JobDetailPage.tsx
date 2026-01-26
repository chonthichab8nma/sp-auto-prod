import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, CarFront } from "lucide-react";


import type { JobApi } from "../api/job.api";
import { formatThaiDate } from "../../../shared/lib/date";

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
    className={`flex flex-col md:flex-row py-8 ${hasBorder ? "border-b border-gray-100" : ""
      }`}
  >
    <div className="w-full md:w-1/3 mb-6 md:mb-0">
      <h3 className="font-bold text-slate-800 text-base">{title}</h3>
      <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
    </div>
    <div className="w-full md:w-2/3">{children}</div>
  </div>
);

const RowItem = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => (
  <div className="flex items-start py-1">
    <span className="w-40 text-slate-400 font-light text-sm">{label}</span>
    <span className="flex-1 text-slate-900 font-medium text-sm">
      {value || "-"}
    </span>
  </div>
);

const StackItem = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-slate-400 font-light text-sm">{label}</span>
    <span className="text-slate-900 font-medium text-base">{value || "-"}</span>
  </div>
);

function buildTimelineStages(job: JobApi) {
  return job?.jobStages
    .slice()
    .sort((a, b) => a.stage.orderIndex - b.stage.orderIndex)
    .map((s) => ({
      id: String(s.id),
      name: s.stage.name,
      isCompleted: s.isCompleted,
    }));
}

export default function JobDetailPage({ job }: { job: JobApi | null }) {
  const navigate = useNavigate();

  const handleBack = () => navigate(-1);



  const handleCheckStation = () => navigate(`/stations/${job?.id}`);

  const stages = buildTimelineStages(job!);
  console.log({
    job
  })

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
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-500"
                      }`}
                  >
                    {isCompleted ? <Check size={12} /> : idx + 1}
                  </span>
                  <span
                    className={`font-medium ${isCompleted || isActive
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

        <button
          onClick={handleCheckStation}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700"
        >
          เช็กสถานะรถ
        </button>
      </div>

      <div className="mb-6 text-slate-500 text-sm">
        สเตชั่น /{" "}
        <span className="text-slate-900 font-medium">
          รายละเอียด {job?.vehicle.registration}
        </span>
      </div>

      <div className="bg-white py-2">
        <Section title="รายละเอียดรถ" subtitle="ข้อมูลรถ">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <CarFront size={40} className="text-slate-800" />
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  {job?.vehicle.brand}
                </h1>
                <p className="text-slate-400 text-sm">
                  {job?.vehicle.model} {job?.vehicle.year} {job?.vehicle.type}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <RowItem label="ทะเบียนรถ" value={job?.vehicle.registration} />
            <RowItem
              label="เลขตัวถัง"
              value={job?.vehicle.chassisNumber ?? "-"}
            />
            <RowItem label="ยี่ห้อ/แบรนด์" value={job?.vehicle.brand} />
            <RowItem label="รุ่น" value={job?.vehicle.model} />
            <RowItem label="ปี" value={job?.vehicle.year} />
            <RowItem label="สี" value={job?.vehicle.color} />
          </div>
        </Section>

        <Section title="รายละเอียดการซ่อม" subtitle="ข้อมูลการซ่อม">
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
            <StackItem label="เจ้าหน้าที่รับรถ" value={job?.receiver?.name ?? "-"} />
          </div>
        </Section>

        <Section title="รายละเอียดลูกค้า" subtitle="ข้อมูลลูกค้า">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <StackItem
              label="ชื่อ-นามสกุล"
              value={job?.customer.name || "ไม่ระบุ"}
            />
            <StackItem
              label="เบอร์โทรศัพท์"
              value={job?.customer.phone || "ไม่ระบุ"}
            />
            <div className="md:col-span-2">
              <StackItem
                label="ที่อยู่"
                value={job?.customer.address || "ไม่ระบุ"}
              />
            </div>
          </div>
        </Section>

        <Section
          title="รายละเอียดการชำระเงิน"
          subtitle="ข้อมูลการชำระเงิน"
          hasBorder={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <StackItem
              label="ประเภทการชำระเงิน"
              value={
                job?.paymentType === "Insurance" ? "ประกันภัย (เคลม)" : "เงินสด"
              }
            />
            <StackItem
              label="ชื่อบริษัทประกันภัย"
              value={job?.insuranceCompany?.name ?? "-"}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}
