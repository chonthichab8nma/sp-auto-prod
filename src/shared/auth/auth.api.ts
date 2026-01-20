import { http } from "../lib/http";

export type LoginRequest = { username: string; password: string };
export type LoginResponse = { token: string };

export async function loginApi(req: LoginRequest): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>("public/auth/login", req);
  return data;
}
