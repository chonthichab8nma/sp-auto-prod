import axios from "axios";

type ApiErrorBody = {
  message?: unknown;
  error?: unknown;
  detail?: unknown;
};

function readApiMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    const msg = data?.message ?? data?.error ?? data?.detail;
    if (typeof msg === "string" && msg.trim()) return msg.trim();
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  return "";
}

function isThaiText(text: string) {
  return /[ก-๙]/.test(text);
}

export function toThaiErrorMessage(error: unknown, fallback: string): string {
  const raw = readApiMessage(error);
  if (!raw) return fallback;
  if (isThaiText(raw)) return raw;

  const text = raw.toLowerCase();

  if (text.includes("network")) return "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้";
  if (text.includes("timeout")) return "การเชื่อมต่อล่าช้าเกินกำหนด";
  if (text.includes("unauthorized") || text.includes("401")) return "กรุณาเข้าสู่ระบบใหม่";
  if (text.includes("forbidden") || text.includes("403")) return "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้";
  if (text.includes("not found") || text.includes("404")) return "ไม่พบข้อมูลที่ต้องการ";
  if (text.includes("invalid")) return "ข้อมูลไม่ถูกต้อง";
  if (text.includes("required")) return "กรุณากรอกข้อมูลให้ครบ";
  if (text.includes("failed") || text.includes("error")) return fallback;

  return fallback;
}
