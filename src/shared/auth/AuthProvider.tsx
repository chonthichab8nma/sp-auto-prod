import React, { useMemo, useState } from "react";
import { clearAccessToken, getAccessToken, setAccessToken } from "./auth";
import { loginApi } from "./auth.api";
import { AuthContext, type AuthContextValue } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getAccessToken());

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthed: Boolean(token),

      login: async (username: string, password: string) => {
        const data = await loginApi({ username, password });
        setAccessToken(data.token);
        setToken(data.token);
        return data.token;
      },
      logout: () => {
        clearAccessToken();
        setToken(null);
      },
    }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
