import type { Stage, Job } from "./Type"; 

const CLAIM_STEPS = ["ยื่นเคลม", "เช็ครายการ", "ขอราคา", "เสนอราคา", "ส่งประกัน", "อนุมัติ", "หาอะไหล่", "สั่งอะไหล่", "อะไหล่ครบ", "นัดคิวเข้า", "ลูกค้าเข้าจอด", "เสนอเพิ่ม", "รถเสร็จ(เตรียมซ่อม)"];
const REPAIR_STEPS = ["รื้อถอน", "เคาะ", "เบิกอะไหล่", "โป้วสี", "พ่นสีพื้น", "พ่นสีจริง", "ประกอบ", "ขัดสี", "ล้างรถ", "QC", "ลูกค้ารับรถ"];
const BILLING_STEPS = ["รถเสร็จสมบูรณ์", "เรียงรูป", "ส่งอนุมัติ", "ส่งอนุมัติเสร็จ", "ออกใบกำกับภาษี", "เรียงเรื่อง", "นำเรื่องตั้งเบิก", "วันตั้งเบิก"];
export const CAR_TYPES = ["รถยนต์", "รถกระบะ", "รถมอเตอร์ไซค์"];
export const CAR_BRANDS = ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Hyundai"];
export const CAR_MODELS = ["Model A", "Model B", "Model C", "Model D", "Model E", "Model F", "Model G", "Model H", "Model I", "Model J"];
export const YEARS = ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015"];
export const INITIAL_STAGES: Stage[] = [
  { id: "claim", name: "เคลม", isLocked: false, isCompleted: false, steps: CLAIM_STEPS.map((name, idx) => ({ id: `c-${idx}`, name, status: "pending" })) },
  { id: "repair", name: "ซ่อม", isLocked: true, isCompleted: false, steps: REPAIR_STEPS.map((name, idx) => ({ id: `r-${idx}`, name, status: "pending" })) },
  { id: "billing", name: "เบิก", isLocked: true, isCompleted: false, steps: BILLING_STEPS.map((name, idx) => ({ id: `b-${idx}`, name, status: "pending" })) },
];

export const MOCK_JOBS: Job[] = [
  {
    id: "JOB-001",
    registration: "1กท 9999",
    bagNumber: "MR987654321",
    brand: "Honda",
    type: "Coupe",
    model: "Prelude",
    year: "2026",
    color: "ขาว",
    startDate: "2026-01-01",
    estimatedEndDate: "2026-01-15",
    receiver: "Teach Tichan",
    excessFee: 1000,
    paymentType: "Insurance",
    insuranceCompany: "วิริยะประกันภัย",
    customerName: "สมชาย ใจดี",
    customerPhone: "0812345678",
    customerAddress: "กรุงเทพมหานคร",
    currentStageIndex: 1, 
    isFinished: false,
    stages: [
      {
        ...INITIAL_STAGES[0],
        isCompleted: true,
        steps: INITIAL_STAGES[0].steps.map((s) => ({ ...s, status: "completed", employee: "Somchai", timestamp: "01/01/2026 10:00" })),
      },
      { ...INITIAL_STAGES[1], isLocked: false },
      { ...INITIAL_STAGES[2] },
    ],
  },
];