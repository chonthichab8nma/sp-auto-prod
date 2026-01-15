import type { Stage, Job } from "./Type";

const CLAIM_STEPS = [
  "ยื่นเคลม",
  "เช็ครายการ",
  "ขอราคา",
  "เสนอราคา",
  "ส่งประกัน",
  "อนุมัติ",
  "หาอะไหล่",
  "สั่งอะไหล่",
  "อะไหล่ครบ",
  "นัดคิวเข้า",
  "ลูกค้าเข้าจอด",
  "เสนอเพิ่ม",
  "รถเสร็จ(เตรียมซ่อม)",
];
const REPAIR_STEPS = [
  "รื้อถอน",
  "เคาะ",
  "เบิกอะไหล่",
  "โป้วสี",
  "พ่นสีพื้น",
  "พ่นสีจริง",
  "ประกอบ",
  "ขัดสี",
  "ล้างรถ",
  "QC",
  "ลูกค้ารับรถ",
];
const BILLING_STEPS = [
  "รถเสร็จสมบูรณ์",
  "เรียงรูป",
  "ส่งอนุมัติ",
  "ส่งอนุมัติเสร็จ",
  "ออกใบกำกับภาษี",
  "เรียงเรื่อง",
  "นำเรื่องตั้งเบิก",
  "วันตั้งเบิก",
];
export const CAR_TYPES = ["รถยนต์", "รถกระบะ", "รถมอเตอร์ไซค์"];
export const CAR_BRANDS = [
  "Toyota",
  "Honda",
  "Ford",
  "Chevrolet",
  "Nissan",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Volkswagen",
  "Hyundai",
  "Mazda",
  "Mitsubishi",
  "Suzuki",
  "Isuzu",
  "Kia",
];
export const CAR_MODELS = [
  "Model A",
  "Model B",
  "Model C",
  "Model D",
  "Model E",
  "Model F",
  "Model G",
  "Model H",
  "Model I",
  "Model J",
];
export const YEARS = [
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
  "2019",
  "2018",
  "2017",
  "2016",
  "2015",
];
export const INITIAL_STAGES: Stage[] = [
  {
    id: "claim",
    name: "เคลม",
    isLocked: false,
    isCompleted: false,
    steps: CLAIM_STEPS.map((name, idx) => ({
      id: `c-${idx}`,
      name,
      status: "pending",
    })),
  },
  {
    id: "repair",
    name: "ซ่อม",
    isLocked: true,
    isCompleted: false,
    steps: REPAIR_STEPS.map((name, idx) => ({
      id: `r-${idx}`,
      name,
      status: "pending",
    })),
  },
  {
    id: "billing",
    name: "ตั้งเบิก",
    isLocked: true,
    isCompleted: false,
    steps: BILLING_STEPS.map((name, idx) => ({
      id: `b-${idx}`,
      name,
      status: "pending",
    })),
  },
];

function randomDate(start: Date, end: Date): string {
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return date.toISOString().split("T")[0];
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

const THAI_FIRSTNAMES = [
  "สมชาย",
  "วิชัย",
  "สุธี",
  "ประเสริฐ",
  "กฤษณ์",
  "อนุชิต",
  "ธนา",
  "พิชัย",
  "เกริก",
  "สุรศักดิ์",
  "วิเชียร",
  "ยุทธ",
  "รัก",
  "ชาติ",
  "ศักดิ์",
  "ดำรง",
  "ธีระ",
  "วีระ",
  "ไพรัช",
  "อดิสัร์",
  "สมหญิง",
  "มาลี",
  "วิไล",
  "สุดา",
  "นภา",
  "รัตนา",
  "อรทัย",
  "กนกวรรณ",
  "สุภา",
  "พัชรี",
  "จิตรา",
  "ณัฐฐา",
  "ฐิตา",
  "ชนาภา",
  "อลิษา",
  "กานดา",
  "ดวงแข",
  "บุษบา",
  "มินตรา",
];
const THAI_LASTNAMES = [
  "ใจดี",
  "รักษ์",
  "สุข",
  "มีสุข",
  "เจริญ",
  "โชคดี",
  "ศรีสุข",
  "บุรินทร์",
  "วิริยะ",
  "กิตติ",
  "เก่ง",
  "หาญ",
  "แก้ว",
  "ทอง",
  "เพ็ชร",
  "มาก",
  "มี",
  "ดี",
  "งาม",
  "สวัสดิ์",
  "อยู่",
  "สุข",
  "รมย์",
  "อารมณ์",
  "วาที",
  "คำ",
  "จันทร์",
  "ไชย",
  "ณ โกเมศ",
  "ณ ป้อมเพชร",
  "ณ นคร",
  "ณรงค์",
  "ฤทธิ์",
  "เดชา",
  "ชู",
  "กล้า",
  "แข็ง",
  "แรง",
  "เมตตา",
  "กรุณา",
];
const THAI_COLORS = [
  "ขาว",
  "ดำ",
  "เทา",
  "เงิน",
  "แดง",
  "น้ำเงิน",
  "ฟ้า",
  "เขียว",
  "เหลือง",
  "ส้ม",
  "ชมพู",
  "ม่วง",
  "น้ำตาล",
  "ทอง",
  "ครีม",
  "เบจ",
  "กรมท่า",
  "กากี",
  "ฟ้าอ่อน",
  "เขียวอ่อน",
  "เทาเข้ม",
  "ดำเงิน",
  "แดงเข้ม",
  "น้ำเงินเข้ม",
];
const INSURANCE_COMPANIES = [
  "วิริยะประกันภัย",
  "เคเอ็นเค ประกันภัย",
  "ทิพยประกันภัย",
  "ธนชาตประกันภัย",
  "อาคเนย์ประกันภัย",
  "แอลเอ็มจี ประกันภัย",
  "เมืองไทยประกันภัย",
  "สินมั่นคงประกันภัย",
  "หาญ บรอเธอร์ส ประกันภัย",
  "จักรยานยนต์ไทยประกันภัย",
  "อัลบั้น ประกันภัย",
  "ไทยศรีประกันภัย",
  "เจมินี่ ประกันภัย",
  "ประกันภัยกลางคัน",
  "ชับบ์ซัมมิท ประกันภัย",
];
const RECEIVERS = [
  "สมชาย มีสุข",
  "วิชัย เก่ง",
  "สุธี แก้ว",
  "ประเสริฐ ทอง",
  "กฤษณ์ เดชา",
  "อนุชิต รักษ์",
  "ธนา วิริยะ",
  "พิชัย หาญ",
  "เกริก แข็ง",
  "สุรศักดิ์ แรง",
  "วิเชียร เมตตา",
  "ยุทธ กรุณา",
  "รัก ศรีสุข",
  "ชาติ บุรินทร์",
  "ศักดิ์ คำ",
  "ดำรง จันทร์",
  "ธีระ ไชย",
  "วีระ ณรงค์",
  "ไพรัช ฤทธิ์",
  "อดิสัร์ กล้า",
];
const PROVINCES = [
  "กรุงเทพมหานคร",
  "ประจวบคีรีขันธ์",
  "ชลบุรี",
  "ภูเก็ต",
  "เชียงใหม่",
  "เชียงราย",
  "ขอนแก่น",
  "นนทบุรี",
  "สมุทรปราการ",
  "พัทยา",
  "ระยอง",
  "จันทบุรี",
  "นครราชสีมา",
  "อยุธยา",
  "สุโขทัย",
  "พิษณุโลก",
  "เชียงคาน",
  "หาดใหญ่",
  "สุราษฎร์ธานี",
  "กระบี่",
];

function generateLicensePlate(index: number): string {
  const seed = index;
  const letters = ["กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ"];
  const randomLetter = () =>
    letters[0][
      (Math.floor(Math.random() * letters[0].length) + seed) % letters[0].length
    ];
  const randomLetters = (count: number) =>
    Array.from({ length: count }, () => randomLetter()).join("");
  const randomNumber = (digits: number) =>
    Math.floor(Math.random() * Math.pow(10, digits))
      .toString()
      .padStart(digits, "0");

  const patterns = [
    () => `${randomNumber(1)}${randomLetters(2)} ${randomNumber(4)}`,
    () => `${randomNumber(2)}${randomLetters(2)} ${randomNumber(4)}`,
    () => `${randomNumber(3)}${randomLetters(2)} ${randomNumber(3)}`,
  ];

  return patterns[Math.floor(Math.random() * patterns.length)]();
}

function generatePhoneNumber(): string {
  const prefixes = [
    "081",
    "082",
    "083",
    "085",
    "086",
    "087",
    "089",
    "061",
    "062",
    "063",
    "064",
    "065",
    "091",
    "092",
    "093",
    "094",
    "095",
    "096",
    "097",
    "098",
  ];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, "0");
  return `${prefix}-${suffix.substring(0, 3)}-${suffix.substring(3, 7)}`;
}

function generateStages(): Stage[] {
  const stageStatus = Math.random();
  let stages: Stage[];

  if (stageStatus < 0.3) {
    stages = [
      { ...INITIAL_STAGES[0], isLocked: false, isCompleted: false },
      { ...INITIAL_STAGES[1] },
      { ...INITIAL_STAGES[2] },
    ];
  } else if (stageStatus < 0.6) {
    stages = [
      {
        ...INITIAL_STAGES[0],
        isLocked: true,
        isCompleted: true,
        steps: INITIAL_STAGES[0].steps.map((s) => ({
          ...s,
          status: "completed",
          timestamp: "10/01/2026 10:00",
          employee: RECEIVERS[Math.floor(Math.random() * RECEIVERS.length)],
        })),
      },
      { ...INITIAL_STAGES[1], isLocked: false, isCompleted: false },
      { ...INITIAL_STAGES[2] },
    ];
  } else if (stageStatus < 0.85) {
    stages = [
      {
        ...INITIAL_STAGES[0],
        isLocked: true,
        isCompleted: true,
        steps: INITIAL_STAGES[0].steps.map((s) => ({
          ...s,
          status: "completed",
          timestamp: "10/01/2026 10:00",
          employee: RECEIVERS[Math.floor(Math.random() * RECEIVERS.length)],
        })),
      },
      {
        ...INITIAL_STAGES[1],
        isLocked: true,
        isCompleted: true,
        steps: INITIAL_STAGES[1].steps.map((s) => ({
          ...s,
          status: "completed",
          timestamp: "10/01/2026 10:00",
          employee: RECEIVERS[Math.floor(Math.random() * RECEIVERS.length)],
        })),
      },
      { ...INITIAL_STAGES[2], isLocked: false, isCompleted: false },
    ];
  } else {
    stages = [
      {
        ...INITIAL_STAGES[0],
        isLocked: true,
        isCompleted: true,
        steps: INITIAL_STAGES[0].steps.map((s) => ({
          ...s,
          status: "completed",
          timestamp: "10/01/2026 10:00",
          employee: RECEIVERS[Math.floor(Math.random() * RECEIVERS.length)],
        })),
      },
      {
        ...INITIAL_STAGES[1],
        isLocked: true,
        isCompleted: true,
        steps: INITIAL_STAGES[1].steps.map((s) => ({
          ...s,
          status: "completed",
          timestamp: "10/01/2026 10:00",
          employee: RECEIVERS[Math.floor(Math.random() * RECEIVERS.length)],
        })),
      },
      {
        ...INITIAL_STAGES[2],
        isLocked: true,
        isCompleted: true,
        steps: INITIAL_STAGES[2].steps.map((s) => ({
          ...s,
          status: "completed",
          timestamp: "10/01/2026 10:00",
          employee: RECEIVERS[Math.floor(Math.random() * RECEIVERS.length)],
        })),
      },
    ];
  }

  return stages;
}

export const MOCK_JOBS: Job[] = Array.from({ length: 120 }, (_, index) => {
  const startDate = randomDate(new Date("2025-10-01"), new Date("2026-01-15"));
  const estimatedEndDate = addDays(
    startDate,
    Math.floor(Math.random() * 30) + 3
  );
  const stages = generateStages();
  const isFinished = stages[2].isCompleted;
  const currentStageIndex = isFinished
    ? 2
    : stages[0].isCompleted && stages[1].isCompleted
    ? 2
    : stages[0].isCompleted
    ? 1
    : 0;
  const paymentType: "Insurance" | "Cash" =
    Math.random() > 0.3 ? "Insurance" : "Cash";

  return {
    id: `JOB-${String(index + 1).padStart(3, "0")}`,
    registration: generateLicensePlate(index),
    bagNumber: `MR${Math.floor(Math.random() * 1000000000)
      .toString()
      .padStart(9, "0")}`,
    brand: CAR_BRANDS[Math.floor(Math.random() * CAR_BRANDS.length)],
    type: CAR_TYPES[Math.floor(Math.random() * CAR_TYPES.length)],
    model: CAR_MODELS[Math.floor(Math.random() * CAR_MODELS.length)],
    year: YEARS[Math.floor(Math.random() * YEARS.length)],
    color: THAI_COLORS[Math.floor(Math.random() * THAI_COLORS.length)],
    startDate,
    estimatedEndDate,
    receiver: RECEIVERS[Math.floor(Math.random() * RECEIVERS.length)],
    excessFee: Math.floor(Math.random() * 5000) + 500,
    paymentType,
    insuranceCompany:
      paymentType === "Insurance"
        ? INSURANCE_COMPANIES[
            Math.floor(Math.random() * INSURANCE_COMPANIES.length)
          ]
        : undefined,
    customerName: `${
      THAI_FIRSTNAMES[Math.floor(Math.random() * THAI_FIRSTNAMES.length)]
    } ${THAI_LASTNAMES[Math.floor(Math.random() * THAI_LASTNAMES.length)]}`,
    customerPhone: generatePhoneNumber(),
    customerAddress: `${Math.floor(Math.random() * 500) + 1} ${
      PROVINCES[Math.floor(Math.random() * PROVINCES.length)]
    }`,
    currentStageIndex,
    isFinished,
    stages,
  };
});
