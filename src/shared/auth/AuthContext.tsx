import { createContext } from "react";
import type { AuthUser, UserRole } from "./auth";

export type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  role: UserRole | null;
  isAuthed: boolean;
  login: (username: string, password: string) => Promise<string>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
