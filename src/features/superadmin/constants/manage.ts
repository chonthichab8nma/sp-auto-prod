import type {
  CreateEmployeeInput,
  CreateInsuranceCompanyInput,
  CreateVehicleBrandInput,
  EmployeeRole,
} from "../services/superadmin.service";

export type ManageTab = "employees" | "insurances" | "brands" | "alerts";

export const roleLabel: Record<EmployeeRole, string> = {
  admin: "admin",
  staff: "staff",
};

export const tabItems: { id: ManageTab; label: string }[] = [
  { id: "employees", label: "จัดการพนักงาน" },
  { id: "insurances", label: "จัดการบริษัทประกันภัย" },
  { id: "brands", label: "จัดการยี่ห้อรถ" },
  { id: "alerts", label: "ตั้งค่า SLA/การแจ้งเตือน" },
];

export const defaultEmployeeForm: CreateEmployeeInput = {
  name: "",
  role: "staff",
  phone: "",
  username: "",
  password: "",
};

export const defaultInsuranceForm: CreateInsuranceCompanyInput = {
  name: "",
  contactPhone: "",
  logoUrl: "",
  isActive: true,
};

export const defaultBrandForm: CreateVehicleBrandInput = {
  code: "",
  name: "",
  nameEn: "",
  country: "",
  logoUrl: "",
};

export type GroupBrandMode = "existing" | "new";
export type GroupTypeMode = "existing" | "new";

export const defaultGroupedCreateForm = {
  brandMode: "existing" as GroupBrandMode,
  existingBrandId: "",
  brandCode: "",
  brandName: "",
  brandNameEn: "",
  brandCountry: "",
  brandLogoUrl: "",
  modelName: "",
  typeMode: "existing" as GroupTypeMode,
  existingTypeId: "",
  typeCode: "",
  typeName: "",
  typeNameEn: "",
};

export type GroupedCreateForm = typeof defaultGroupedCreateForm;

export type DeleteTarget =
  | { type: "employee"; id: number; name: string }
  | { type: "insurance"; id: number; name: string }
  | { type: "brand"; id: number; name: string };
