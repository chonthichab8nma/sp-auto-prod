const TOKEN_KEY = "accessToken";
const USER_KEY = "authUser";

export type UserRole = "staff" | "super_admin";
export type AuthUser = {
  id: number;
  name: string;
  username: string;
  role: UserRole;
};

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
    const parsed = JSON.parse(raw) as AuthUser;
    if (
      typeof parsed?.id === "number" &&
      typeof parsed?.name === "string" &&
      typeof parsed?.username === "string" &&
      (parsed?.role === "staff" || parsed?.role === "super_admin")
    ) {
      return parsed;
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
    const role = payload.role;
    if (role !== "staff" && role !== "super_admin") return null;

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
