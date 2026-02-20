import React, { useMemo, useState } from "react";
import {
  clearAuthSession,
  getAccessToken,
  getAuthUser,
  normalizeUserRole,
  parseUserFromToken,
  setAccessToken,
  setAuthUser,
  type AuthUser,
} from "./auth";
import { loginApi } from "./auth.api";
import { AuthContext, type AuthContextValue } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = getAuthUser();
    if (saved) return saved;
    const savedToken = getAccessToken();
    if (!savedToken) return null;
    return parseUserFromToken(savedToken);
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      role: user?.role ?? null,
      isAuthed: Boolean(token),

      login: async (username: string, password: string) => {
        const data = await loginApi({ username, password });
        const normalizedApiUser = data.user
          ? (() => {
              const role = normalizeUserRole(data.user.role);
              if (!role) return null;
              return {
                ...data.user,
                role,
              };
            })()
          : null;
        const resolvedUser = normalizedApiUser ?? parseUserFromToken(data.token);

        setAccessToken(data.token);
        setToken(data.token);
        if (resolvedUser) {
          setAuthUser(resolvedUser);
          setUser(resolvedUser);
        } else {
          setUser(null);
        }
        return data.token;
      },
      logout: () => {
        clearAuthSession();
        setToken(null);
        setUser(null);
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
