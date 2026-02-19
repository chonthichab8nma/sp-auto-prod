import axios from "axios";
import { getAccessToken, clearAuthSession } from "../auth/auth";

export const http = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  // timeout: 15000,
});

const ENABLE_GET_DEDUPE = import.meta.env.DEV;
const GET_CACHE_TTL_MS = 800;

type CachedGetResponse = {
  expiresAt: number;
  response: unknown;
};

const inFlightGets = new Map<string, Promise<unknown>>();
const recentGetCache = new Map<string, CachedGetResponse>();

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>).sort(
    ([a], [b]) => a.localeCompare(b),
  );
  return `{${entries
    .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
    .join(",")}}`;
}

function makeGetKey(url: string, config?: { params?: unknown }): string {
  const paramsKey = stableStringify(config?.params ?? null);
  return `${url}::${paramsKey}`;
}

const rawGet = http.get.bind(http);
http.get = function getWithDedupe(url, config) {
  if (!ENABLE_GET_DEDUPE) {
    return rawGet(url, config);
  }

  const key = makeGetKey(url, config);
  const now = Date.now();

  const cached = recentGetCache.get(key);
  if (cached && cached.expiresAt > now) {
    return Promise.resolve(cached.response as never);
  }

  const inFlight = inFlightGets.get(key);
  if (inFlight) {
    return inFlight as never;
  }

  const req = rawGet(url, config)
    .then((response) => {
      recentGetCache.set(key, {
        expiresAt: Date.now() + GET_CACHE_TTL_MS,
        response,
      });
      return response;
    })
    .finally(() => {
      inFlightGets.delete(key);
    });

  inFlightGets.set(key, req);
  return req as never;
};

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
