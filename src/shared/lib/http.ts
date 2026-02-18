import axios from "axios";
import { getAccessToken, clearAuthSession } from "../auth/auth";

export const http = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  // timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthSession();

      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
