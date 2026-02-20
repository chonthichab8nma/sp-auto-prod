const TOKEN_KEY = "accessToken";
const USER_KEY = "authUser";

export type UserRole = "staff" | "admin" | "superadmin";
export type AuthUser = {
  id: number;
  name: string;
  username: string;
  role: UserRole;
};

export function normalizeUserRole(role: unknown): UserRole | null {
  if (typeof role !== "string") return null;
  const normalized = role.trim().toLowerCase().replace(/\s+/g, "_");
  if (normalized === "super_admin" || normalized === "superadmin") {
    return "superadmin";
  }
  if (normalized === "staff") {
    return "staff";
  }
  if (normalized === "admin") {
    return "admin";
  }
  return null;
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser> & { role?: unknown };
    const normalizedRole = normalizeUserRole(parsed?.role);
    if (
      typeof parsed?.id === "number" &&
      typeof parsed?.name === "string" &&
      typeof parsed?.username === "string" &&
      normalizedRole
    ) {
      return {
        id: parsed.id,
        name: parsed.name,
        username: parsed.username,
        role: normalizedRole,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthUser() {
  localStorage.removeItem(USER_KEY);
}

export function clearAuthSession() {
  clearAccessToken();
  clearAuthUser();
}

export function parseUserFromToken(token: string): AuthUser | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson) as {
      sub?: number | string;
      username?: string;
      role?: string;
    };
    const role = normalizeUserRole(payload.role);
    if (!role) return null;

    const idNumber =
      typeof payload.sub === "number"
        ? payload.sub
        : Number(String(payload.sub ?? ""));
    const username = String(payload.username ?? "").trim();
    if (!Number.isFinite(idNumber) || !username) return null;

    return {
      id: idNumber,
      username,
      role,
      name: username,
    };
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}
