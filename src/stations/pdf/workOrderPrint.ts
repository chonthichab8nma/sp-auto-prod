import type {
  JobApi,
  JobStageApi,
  JobStepApi,
  JobStepStatusApi,
} from "../../features/jobs/api/job.api";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { formatThaiDate, formatThaiDateTime } from "../../shared/lib/date";

type StepCell = {
  name: string;
  employee: string;
  signedAt: string;
};

function sortStages(stages: JobStageApi[]) {
  return stages.slice().sort((a, b) => a.stage.orderIndex - b.stage.orderIndex);
}

function sortSteps(steps: JobStepApi[]) {
  return steps
    .slice()
    .sort((a, b) => a.stepTemplate.orderIndex - b.stepTemplate.orderIndex);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function text(value: unknown, fallback = "-"): string {
  if (value == null) return fallback;
  const stringValue = String(value).trim();
  if (!stringValue) return fallback;
  return escapeHtml(stringValue);
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return "-";
}

function resolveVehicleType(job: JobApi): string {
  const v = job.vehicle as JobApi["vehicle"] & {
    typeName?: string | null;
    vehicleType?: { name?: string | null } | string | null;
    bodyType?: string | null;
  };
  const anyJob = job as JobApi & {
    vehicleType?: { name?: string | null } | string | null;
    type?: string | null;
  };

  return pickString(
    v.type,
    v.typeName,
    typeof v.vehicleType === "string" ? v.vehicleType : v.vehicleType?.name,
    v.bodyType,
    typeof anyJob.vehicleType === "string"
      ? anyJob.vehicleType
      : anyJob.vehicleType?.name,
    anyJob.type,
  );
}

function isDone(status: JobStepStatusApi): boolean {
  return status === "completed" || status === "skipped";
}

function getStage(
  job: JobApi,
  stageCode: "CLAIM" | "REPAIR" | "BILLING",
): JobStageApi | null {
  const stages = sortStages(job.jobStages ?? []);
  const found = stages.find(
    (stage) => (stage.stage.code ?? "").toUpperCase() === stageCode,
  );
  return found ?? null;
}

function toStepCells(steps: JobStepApi[]): StepCell[] {
  return sortSteps(steps).map((step) => ({
    name: step.stepTemplate?.name ?? "-",
    employee: isDone(step.status) ? (step.employee?.name ?? "-") : "-",
    signedAt:
      isDone(step.status) && step.completedAt
        ? formatThaiDateTime(step.completedAt)
        : "-",
  }));
}

function renderCheckbox(checked: boolean, label: string): string {
  return `<span class="font-sans mr-1.5">${checked ? "☑" : "☐"}</span>${text(label)}`;
}

function renderStepProgressTable(title: string, cells: StepCell[]): string {
  if (!cells.length) {
    return `
      <table class="w-full table-fixed border-collapse mb-1.5 text-[10px] leading-tight">
        <thead>
          <tr>
            <th class="border border-black px-2 py-1.5 w-[78px] font-bold text-center align-middle">${text(title)}</th>
            <th class="border border-black px-2 py-1.5 font-bold text-center align-middle">ไม่พบขั้นตอน</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-black px-2 py-1.5 w-[78px] font-bold text-center align-middle">เจ้าหน้าที่</td>
            <td class="border border-black px-2 py-1.5 text-center align-middle h-[24px]">-</td>
          </tr>
          <tr>
            <td class="border border-black px-2 py-1.5 w-[78px] font-bold text-center align-middle">วันที่/เวลา</td>
            <td class="border border-black px-2 py-1.5 text-center align-middle h-[24px]">-</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  const headCols = cells
    .map(
      (c) =>
        `<th class="border border-black px-2 py-1.5 font-bold text-center align-middle">${text(c.name)}</th>`,
    )
    .join("");
  const empCols = cells
    .map((c) => `<td class="border border-black px-2 py-1.5 text-center align-middle h-[24px]">${text(c.employee)}</td>`)
    .join("");
  const timeCols = cells
    .map((c) => `<td class="border border-black px-2 py-1.5 text-center align-middle h-[24px]">${text(c.signedAt)}</td>`)
    .join("");

  return `
    <table class="w-full table-fixed border-collapse mb-1.5 text-[10px] leading-tight">
      <thead>
        <tr>
          <th class="border border-black px-2 py-1.5 w-[78px] font-bold text-center align-middle">${text(title)}</th>
          ${headCols}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border border-black px-2 py-1.5 w-[78px] font-bold text-center align-middle">เจ้าหน้าที่</td>
          ${empCols}
        </tr>
        <tr>
          <td class="border border-black px-2 py-1.5 w-[78px] font-bold text-center align-middle">วันที่/เวลา</td>
          ${timeCols}
        </tr>
      </tbody>
    </table>
  `;
}

function renderSheetInner(job: JobApi): string {
  const claimStage = getStage(job, "CLAIM");
  const repairStage = getStage(job, "REPAIR");
  const billingStage = getStage(job, "BILLING");

  const claimCells = toStepCells(claimStage?.jobSteps ?? []);
  const repairCells = toStepCells(repairStage?.jobSteps ?? []);
  const billingCells = toStepCells(billingStage?.jobSteps ?? []);

  return `
    <div data-work-order-sheet class="bg-[#ffffff] text-[#111] w-[1122px] min-h-[793px] border-2 border-black p-2 font-[\"TH_Sarabun_New\",\"Sarabun\",sans-serif]">
      <h1 class="text-center text-[22px] leading-none font-bold mb-6">ใบปฏิบัติงาน</h1>

      <div class="grid grid-cols-[2fr_2fr_1.2fr] gap-1.5 mb-1.5">
        <div class="border border-black px-2 py-1.5 text-[10px] leading-snug min-h-[72px]">
          <div class="mb-0.5"><strong>บริษัท เอส.พี.ออโต้เพ้นท์ เซอร์วิส จำกัด</strong></div>
          <div class="mb-0.5"><strong>ที่อยู่</strong> 142/3 หมู่ 16 ตำบลรังงาม อำเภอเนินสง่า จังหวัดชัยภูมิ 36130</div>
          <div><strong>โทร</strong> 064-3544141 <strong>อีเมล์</strong> SP.AutoPaint88@gmail.com</div>
        </div>
        <div class="border border-black px-2 py-1.5 text-[10px] leading-snug min-h-[72px]">
          <div class="mb-0.5"><strong>วันที่นำรถเข้าจอดซ่อม</strong> <span class="inline-block min-w-[140px] px-1 border-b border-dotted border-black text-center">${text(formatThaiDate(job.startDate))}</span></div>
          <div class="mb-0.5"><strong>กำหนดซ่อมเสร็จ/นัดรับรถ</strong> <span class="inline-block min-w-[140px] px-1 border-b border-dotted border-black text-center">${text(formatThaiDate(job.estimatedEndDate))}</span></div>
          <div class="mb-0.5"><strong>เจ้าหน้าที่รับรถ</strong> <span class="inline-block min-w-[140px] px-1 border-b border-dotted border-black text-center">${text(job.receiver?.name ?? "-")}</span></div>
          <div><strong>ค่าความเสียหายส่วนแรก</strong> <span class="inline-block min-w-[140px] px-1 border-b border-dotted border-black text-center">${text(Number(job.excessFee ?? 0).toLocaleString("th-TH"))}</span></div>
        </div>
        <div class="border border-black px-2 py-1.5 text-[10px] leading-snug min-h-[72px]">
          <div class="mb-0.5 text-start font-bold">ประเภทการชำระ</div>
          <div class="grid grid-cols-1 gap-y-0.5">
            <div class="text-start">${renderCheckbox(job.paymentType === "Insurance", "ประกัน")}</div>
            <div class="text-start">${renderCheckbox(job.paymentType !== "Insurance", "เงินสด")}</div>
          </div>
        </div>
      </div>

      <div class="mb-1.5 text-[10px] leading-snug w-full">
        <table class="w-full border-collapse">
          <tr>
            <td class="border border-black px-2 py-1.5 w-[96px] font-bold text-center align-middle">ทะเบียนรถ</td>
            <td class="border border-black px-2 py-1.5 text-center align-middle">${text(job.vehicle.registration)}</td>
            <td class="border border-black px-2 py-1.5 w-[96px] font-bold text-center align-middle">ประเภทรถ</td>
            <td class="border border-black px-2 py-1.5 text-center align-middle">${text(resolveVehicleType(job))}</td>
          </tr>
          <tr>
            <td class="border border-black px-2 py-1.5 font-bold text-center align-middle">เลขตัวถัง</td>
            <td class="border border-black px-2 py-1.5 text-center align-middle" colspan="3">${text(job.vehicle.chassisNumber ?? "")}</td>
          </tr>
          <tr>
            <td class="border border-black px-2 py-1.5 font-bold text-center align-middle">ยี่ห้อ</td>
            <td class="border border-black px-2 py-1.5 text-center align-middle">${text(job.vehicle.brand)}</td>
            <td class="border border-black px-2 py-1.5 font-bold text-center align-middle">รุ่น</td>
            <td class="border border-black px-2 py-1.5 text-center align-middle">${text(job.vehicle.model)} / ปี ${text(job.vehicle.year)} / สี ${text(job.vehicle.color)}</td>
          </tr>
        </table>
      </div>

      ${renderStepProgressTable("เคลม", claimCells)}
      ${renderStepProgressTable("ซ่อม", repairCells)}
      ${renderStepProgressTable("ตั้งเบิก", billingCells)}

      <div class="grid grid-cols-[2fr_1fr] gap-0 text-[10px] leading-snug">
        <div class="border border-black p-1.5 min-h-[78px]">
          <div class="font-bold mb-0.5">ความต้องการซ่อม :</div>
          <div class="whitespace-pre-wrap">${text(job.repairDescription || "")}</div>
        </div>
        <div class="border border-black p-1.5 min-h-[78px]">
          <div class="font-bold mb-0.5">หมายเหตุ :</div>          <div class="whitespace-pre-wrap">${text(job.notes || "")}</div>
        </div>
      </div>
    </div>
  `;
}

function buildFileName(job: JobApi): string {
  const raw = `${job.jobNumber || job.vehicle.registration || "work-order"}`.trim();
  const safe = raw.replace(/[^\wก-๙-]+/g, "_");
  return `${safe || "work-order"}.pdf`;
}

export async function printWorkOrder(job: JobApi): Promise<void> {
  let host: HTMLDivElement | null = null;

  try {
    host = document.createElement("div");
    host.className = "fixed -left-[2000px] top-0 opacity-0 pointer-events-none";
    host.innerHTML = renderSheetInner(job);
    document.body.appendChild(host);

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const sheetEl = host.querySelector("[data-work-order-sheet]") as HTMLElement | null;
    if (!sheetEl) throw new Error("ไม่พบฟอร์มสำหรับสร้าง PDF");

    const canvas = await html2canvas(sheetEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: 1122,
      height: 793,
      windowWidth: 1200,
      windowHeight: 900,
    });

    const imageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = 297;
    const pageHeight = 210;
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
    const drawWidth = imgWidth * ratio;
    const drawHeight = imgHeight * ratio;
    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2;

    pdf.addImage(imageData, "PNG", x, y, drawWidth, drawHeight, undefined, "FAST");
    pdf.save(buildFileName(job));
  } catch (error) {
    console.error("printWorkOrder failed:", error);
    throw error;
  } finally {
    host?.remove();
    window.focus();
  }
}
