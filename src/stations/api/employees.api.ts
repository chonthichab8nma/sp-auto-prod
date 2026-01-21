import { http } from "../../shared/lib/http";

export type EmployeeApi = {
  id: number;
  name: string;
  role: string;
  phone: string;
  isActive: boolean;
  username: string;
};

export type EmployeesResponse = {
  data: EmployeeApi[];
  page: number;
  limit: number;
  total: number;
};

export async function getEmployeesApi(params: {
  page?: number;
  limit?: number;
  q?: string;
}): Promise<EmployeesResponse> {
  const { data } = await http.get<EmployeesResponse>(
    "/private/employees",
    { params }
  );
  return data;
}