import { createContext } from "react";

export type AuthContextValue = {
  token: string | null;
  isAuthed: boolean;
  login: (username: string, password: string) => Promise<string>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
