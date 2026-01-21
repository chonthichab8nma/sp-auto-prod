// src/features/jobs/services/vehicles.service.ts
import { http } from "../../../shared/lib/http";

export type VehicleApi = {
  id: number;
  registration: string;
  brand?: string;
  model?: string;
  type?: string;
  year?: string;
  color?: string;
  chassisNumber?: string;
  vinNumber?: string;
};

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

function isHttpNotFound(err: unknown): boolean {
  // รองรับ axios-style error แบบกว้าง ๆ โดยไม่ใช้ any
  if (typeof err !== "object" || err === null) return false;

  const maybe = err as { response?: { status?: unknown } };
  return maybe.response?.status === 404;
}

export const vehiclesService = {
  async findByRegistration(registration: string): Promise<VehicleApi | null> {
    const reg = registration.trim();
    if (!reg) return null;

    try {
      const encoded = encodeURIComponent(reg);

      // แนะนำ endpoint แบบไม่ชน /vehicles/:id
      const { data } = await http.get<VehicleApi>(
        `/private/vehicles/by-registration/${encoded}`,
      );

      return data;
    } catch (err: unknown) {
      if (isHttpNotFound(err)) return null;
      throw err;
    }
  },

  async create(input: VehicleCreateInput): Promise<VehicleApi> {
    const { data } = await http.post<VehicleApi>("/private/vehicles", input);
    return data;
  },
};
