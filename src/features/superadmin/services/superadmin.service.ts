import { http } from "../../../shared/lib/http";

export type EmployeeRole = "admin" | "staff";

export type EmployeeItem = {
  id: number;
  name: string;
  role: EmployeeRole;
  phone: string;
  username: string;
  isActive?: boolean;
};

export type CreateEmployeeInput = {
  name: string;
  role: EmployeeRole;
  phone: string;
  username: string;
  password: string;
};

export type InsuranceCompanyItem = {
  id: number;
  name: string;
  contactPhone?: string | null;
  logoUrl?: string | null;
  isActive?: boolean;
};

export type CreateInsuranceCompanyInput = {
  name: string;
  contactPhone: string;
  logoUrl: string;
  isActive: boolean;
};

export type VehicleBrandItem = {
  id: number;
  code: string;
  name: string;
  nameEn?: string | null;
  country?: string | null;
  logoUrl?: string | null;
};

export type CreateVehicleBrandInput = {
  code: string;
  name: string;
  nameEn: string;
  country: string;
  logoUrl: string;
};

type WrappedListResponse<T> = {
  data?: T[];
};

type EmployeesListResponse =
  | EmployeeItem[]
  | WrappedListResponse<EmployeeItem>
  | { data?: EmployeeItem[]; page?: number; limit?: number; total?: number };

type InsurancesListResponse =
  | InsuranceCompanyItem[]
  | WrappedListResponse<InsuranceCompanyItem>;

function extractList<T>(data: T[] | WrappedListResponse<T>): T[] {
  if (Array.isArray(data)) return data;
  return data?.data ?? [];
}

export const superadminService = {
  async listEmployees(): Promise<EmployeeItem[]> {
    const { data } = await http.get<EmployeesListResponse>("/private/employees", {
      params: { page: 1, limit: 200 },
    });
    return extractList(data as EmployeeItem[] | WrappedListResponse<EmployeeItem>);
  },

  async createEmployee(payload: CreateEmployeeInput): Promise<EmployeeItem> {
    const { data } = await http.post<EmployeeItem>("/private/employees", payload);
    return data;
  },

  async deleteEmployee(id: number): Promise<void> {
    await http.delete(`/private/employees/${id}`);
  },

  async listInsurances(): Promise<InsuranceCompanyItem[]> {
    const { data } = await http.get<InsurancesListResponse>("/private/insurances",{
      params: { page: 1, limit: 200 },
    });
    return extractList(data as InsuranceCompanyItem[] | WrappedListResponse<InsuranceCompanyItem>);
  },

  async createInsurance(payload: CreateInsuranceCompanyInput): Promise<InsuranceCompanyItem> {
    const { data } = await http.post<InsuranceCompanyItem>("/private/insurances", payload);
    return data;
  },

  async deleteInsurance(id: number): Promise<void> {
    await http.delete(`/private/insurances/${id}`);
  },

  async listVehicleBrands(): Promise<VehicleBrandItem[]> {
    const { data } = await http.get<VehicleBrandItem[]>("/private/vehicles/brands");
    return data ?? [];
  },

  async createVehicleBrand(payload: CreateVehicleBrandInput): Promise<VehicleBrandItem> {
    const { data } = await http.post<VehicleBrandItem>("/private/vehicles/brands", payload);
    return data;
  },

  async deleteVehicleBrand(id: number): Promise<void> {
    await http.delete(`/private/vehicles/brands/${id}`);
  },
};
