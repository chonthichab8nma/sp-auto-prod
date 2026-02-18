import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import type { UserRole } from "./auth";

export default function RequireAuth({
  allowedRoles,
}: {
  allowedRoles?: UserRole[];
}) {
  const { isAuthed, role } = useAuth();
  const location = useLocation();

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      if (role === "staff") return <Navigate to="/stations" replace />;
      return <Navigate to="/" replace />;
    }
  }
  return <Outlet />;
}
