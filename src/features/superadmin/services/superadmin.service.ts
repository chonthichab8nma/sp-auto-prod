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

export type UpdateEmployeeInput = {
  name: string;
  role: EmployeeRole;
  phone: string;
  username: string;
  password?: string;
  isActive?: boolean;
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

export type UpsertVehicleBrandInput = {
  code: string;
  name: string;
  nameEn?: string;
  country?: string;
  logoUrl?: string;
};

export type VehicleTypeItem = {
  id: number;
  code: string;
  name: string;
  nameEn?: string | null;
};

export type CreateVehicleTypeInput = {
  code: string;
  name: string;
  nameEn: string;
};

export type VehicleModelItem = {
  id: number;
  name: string;
  brandId?: number;
  typeId?: number | null;
  type?: VehicleTypeItem | null;
};

export type CreateVehicleModelInput = {
  brandId: number;
  name: string;
  typeId?: number | null;
};

export type UpdateVehicleModelInput = {
  name: string;
  typeId?: number | null;
};

export type AlertConfigStatus = "CLAIM" | "REPAIR" | "BILLING" | "DONE";

export type AlertConfigItem = {
  id: number;
  status: AlertConfigStatus;
  warningDays: number;
  criticalDays: number;
  updatedAt: string;
};

export type UpdateAlertConfigInput = {
  warningDays: number;
  criticalDays: number;
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
type AlertConfigsListResponse =
  | AlertConfigItem[]
  | WrappedListResponse<AlertConfigItem>;

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

  async updateEmployee(id: number, payload: UpdateEmployeeInput): Promise<EmployeeItem> {
    const { data } = await http.patch<EmployeeItem>(`/private/employees/${id}`, payload);
    return data;
  },

  async updateEmployeePassword(id: number, password: string): Promise<EmployeeItem> {
    const { data } = await http.patch<EmployeeItem>(`/private/employees/${id}`, {
      password,
    });
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

  async listAlertConfigs(): Promise<AlertConfigItem[]> {
    const { data } = await http.get<AlertConfigsListResponse>("/private/alert-configs");
    return extractList(data as AlertConfigItem[] | WrappedListResponse<AlertConfigItem>);
  },

  async updateAlertConfig(
    status: AlertConfigStatus,
    payload: UpdateAlertConfigInput,
  ): Promise<AlertConfigItem> {
    const { data } = await http.put<AlertConfigItem>(
      `/private/alert-configs/${status}`,
      payload,
    );
    return data;
  },

  async createInsurance(payload: CreateInsuranceCompanyInput): Promise<InsuranceCompanyItem> {
    const { data } = await http.post<InsuranceCompanyItem>("/private/insurances", payload);
    return data;
  },

  async updateInsurance(
    id: number,
    payload: CreateInsuranceCompanyInput,
  ): Promise<InsuranceCompanyItem> {
    const { data } = await http.put<InsuranceCompanyItem>(`/private/insurances/${id}`, payload);
    return data;
  },

  async deleteInsurance(id: number): Promise<void> {
    await http.delete(`/private/insurances/${id}`);
  },

  async listVehicleBrands(): Promise<VehicleBrandItem[]> {
    const { data } = await http.get<VehicleBrandItem[]>("/private/vehicles/brands");
    return data ?? [];
  },

  async createVehicleBrand(payload: UpsertVehicleBrandInput): Promise<VehicleBrandItem> {
    const { data } = await http.post<VehicleBrandItem>("/private/vehicles/brands", payload);
    return data;
  },

  async updateVehicleBrand(
    id: number,
    payload: UpsertVehicleBrandInput,
  ): Promise<VehicleBrandItem> {
    const { data } = await http.patch<VehicleBrandItem>(
      `/private/vehicles/brands/${id}`,
      payload,
    );
    return data;
  },

  async deleteVehicleBrand(id: number): Promise<void> {
    await http.delete(`/private/vehicles/brands/${id}`);
  },

  async listVehicleTypes(): Promise<VehicleTypeItem[]> {
    const { data } = await http.get<VehicleTypeItem[]>("/private/vehicles/types");
    return data ?? [];
  },

  async createVehicleType(payload: CreateVehicleTypeInput): Promise<VehicleTypeItem> {
    const { data } = await http.post<VehicleTypeItem>("/private/vehicles/types", payload);
    return data;
  },

  async deleteVehicleType(id: number): Promise<void> {
    await http.delete(`/private/vehicles/types/${id}`);
  },

  async listVehicleModelsByBrand(brandId: number): Promise<VehicleModelItem[]> {
    const { data } = await http.get<VehicleBrandItem & { models?: VehicleModelItem[] }>(
      `/private/vehicles/brands/${brandId}`,
    );
    return data?.models ?? [];
  },

  async createVehicleModel(payload: CreateVehicleModelInput): Promise<VehicleModelItem> {
    const { data } = await http.post<VehicleModelItem>("/private/vehicles/models", payload);
    return data;
  },

  async updateVehicleModel(
    id: number,
    payload: UpdateVehicleModelInput,
  ): Promise<VehicleModelItem> {
    const { data } = await http.patch<VehicleModelItem>(
      `/private/vehicles/models/${id}`,
      payload,
    );
    return data;
  },

  async deleteVehicleModel(id: number): Promise<void> {
    await http.delete(`/private/vehicles/models/${id}`);
  },
};
