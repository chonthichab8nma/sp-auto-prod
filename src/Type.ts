// types.ts
export type StepStatus = "pending" | "completed" | "skipped";
export type PaymentType = "Insurance" | "Cash";

export interface Step {
  id: string;
  name: string;
  status: StepStatus;
  timestamp?: string;
  employee?: string;
}

export interface Stage {
  id: "claim" | "repair" | "billing";
  name: string;
  steps: Step[];
  isLocked: boolean;
  isCompleted: boolean;
}

export interface JobFormData {
  registration: string;
  bagNumber: string;
  brand: string;
  type: string;
  model: string;
  year: string;
  color: string;
  startDate: string;
  estimatedEndDate: string;
  receiver: string;
  excessFee: number;
  paymentType: PaymentType;
  insuranceCompany?: string; 
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  
}

export interface Job extends JobFormData {
  id: string;
  stages: Stage[];
  currentStageIndex: number;
  isFinished: boolean;
}

// --- Constants & Mocks ---

const CLAIM_STEPS = [
  "ยื่นเคลม", "เช็ครายการ", "ขอราคา", "เสนอราคา", "ส่งประกัน",
  "อนุมัติ", "หาอะไหล่", "สั่งอะไหล่", "อะไหล่ครบ", "นัดคิวเข้า",
  "ลูกค้าเข้าจอด", "เสนอเพิ่ม", "รถเสร็จ(เตรียมซ่อม)",
];

const REPAIR_STEPS = [
  "รื้อถอน", "เคาะ", "เบิกอะไหล่", "โป้วสี", "พ่นสีพื้น",
  "พ่นสีจริง", "ประกอบ", "ขัดสี", "ล้างรถ", "QC", "ลูกค้ารับรถ",
];

const BILLING_STEPS = [
  "รถเสร็จสมบูรณ์", "เรียงรูป", "ส่งอนุมัติ", "ส่งอนุมัติเสร็จ",
  "ออกใบกำกับภาษี", "เรียงเรื่อง", "นำเรื่องตั้งเบิก", "วันตั้งเบิก",
];

export const INITIAL_STAGES: Stage[] = [
  {
    id: "claim",
    name: "1. ขั้นตอนการเคลม",
    isLocked: false,
    isCompleted: false,
    steps: CLAIM_STEPS.map((name, idx) => ({ id: `c-${idx}`, name, status: "pending" })),
  },
  {
    id: "repair",
    name: "2. ขั้นตอนการซ่อม",
    isLocked: true,
    isCompleted: false,
    steps: REPAIR_STEPS.map((name, idx) => ({ id: `r-${idx}`, name, status: "pending" })),
  },
  {
    id: "billing",
    name: "3. ขั้นตอนตั้งเบิก",
    isLocked: true,
    isCompleted: false,
    steps: BILLING_STEPS.map((name, idx) => ({ id: `b-${idx}`, name, status: "pending" })),
  },
];

export const MOCK_JOBS: Job[] = [
  {
    id: "1",
    registration: "กข 1234",
    bagNumber: "B001",
    brand: "Toyota",
    type: "Sedan",
    model: "Vios",
    year: "2020",
    color: "ขาว",
    startDate: "2023-10-01",
    estimatedEndDate: "2023-10-15",
    receiver: "สมชาย",
    excessFee: 1000,
    paymentType: "Insurance",
    currentStageIndex: 1,
    isFinished: false,
    stages: [
      {
        ...INITIAL_STAGES[0],
        isCompleted: true,
        steps: INITIAL_STAGES[0].steps.map((s) => ({
          ...s,
          status: "completed",
          employee: "สมชาย",
          timestamp: new Date().toLocaleString(),
        })),
      },
      { ...INITIAL_STAGES[1], isLocked: false },
      { ...INITIAL_STAGES[2] },
    ],
  },
];