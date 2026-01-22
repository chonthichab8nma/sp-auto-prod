import { http } from "../../../shared/lib/http";

export type VehicleApi = {
  id: number;
  registration: string;

  brand?: string | null;
  model?: string | null;
  type?: string | null;
  year?: string | null;

  color?: string | null;
  chassisNumber?: string | null;
  vinNumber?: string | null;
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

export type VehicleTypeApi = {
  id: number;
  name: string;
};

export type VehicleTypeRefApi = {
  id: number;
  code: string;
  name: string;
  nameEn?: string | null;
};

export type VehicleModelApi = {
  id: number;
  name: string;
  typeId?: number;
  type?: VehicleTypeRefApi;
};

export type VehicleBrandApi = {
  id: number;
  code: string;
  name: string;
  nameEn?: string | null;
  country?: string | null;
  logoUrl?: string | null;

  models?: VehicleModelApi[];

  createdAt?: string;
  updatedAt?: string;
};

export type InsuranceCompanyApi = {
  id: number;
  name: string;
  nameEn?: string | null;
  code?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export function normalizeRegistration(input: string) {
  return input.trim().replace(/\s+/g, "");
}

export const vehiclesService = {
  async listVehicles(): Promise<VehicleApi[]> {
    const { data } = await http.get<VehicleApi[]>("/private/vehicles");
    return data ?? [];
  },

  async listBrands(): Promise<VehicleBrandApi[]> {
    const { data } = await http.get<VehicleBrandApi[]>(
      "/private/vehicles/brands",
    );
    return data ?? [];
  },
  //ดึงรุ่น
  async getBrandById(id: number): Promise<VehicleBrandApi> {
    const { data } = await http.get<VehicleBrandApi>(
      `/private/vehicles/brands/${id}`,
    );
    return data as VehicleBrandApi;
  },
  async fetchCarType(): Promise<VehicleTypeApi[]> {
    const { data } = await http.get<VehicleTypeApi[]>(
      "/private/vehicles/types",
    );
    return data ?? [];
  },

  async createVehicle(input: VehicleCreateInput): Promise<VehicleApi> {
    const { data } = await http.post<VehicleApi>("/private/vehicles", input);
    return data;
  },
  async listInsurances(): Promise<{
    data: InsuranceCompanyApi[];
  }> {
    const { data } = await http.get<{
      data: InsuranceCompanyApi[];
    }>("/private/insurances");
    return data ?? []
  },
};
export const insurancesService = {
  listInsurances: async (): Promise<InsuranceCompanyApi[]> => {
    const res = await http.get("/private/insurances");
    return res.data;
  },
};
