import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../shared/auth/useAuth";
import { PanelLeft } from "lucide-react";

export default function AppShell() {
  const { logout, role, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getPageTitleTH = (pathname: string) => {
    if (pathname === "/" || pathname.startsWith("/dashboard")) return "แดชบอร์ด";
    if (pathname.startsWith("/reports/summary")) return "รายงานรายได้";
    if (pathname.startsWith("/create")) return "สร้างงานซ่อม";
    if (pathname.startsWith("/job/")) return "รายละเอียดงานซ่อม";
    if (pathname === "/stations") return "สถานะ";
    if (pathname.startsWith("/stations/")) return "ความคืบหน้าสเตชัน";
    if (pathname.startsWith("/superadmin/manage")) return "จัดการข้อมูลระบบ";
    return "ระบบงาน";
  };

  const pageTitle = getPageTitleTH(location.pathname);
  const accountName = user?.name?.trim() || user?.username?.trim() || "ผู้ใช้งาน";
  const roleLabel =
    role === "superadmin" ? "Superadmin" : role === "admin" ? "Admin" : "Staff";
  const showRoleSubtitle = role !== "superadmin";

  return (
    <div className="flex h-full min-h-screen bg-[#ebebeb] items-stretch">
      <div className="hidden md:flex shrink-0 sticky top-0 h-screen">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
          onLogout={handleLogout}
          activePath={location.pathname}
          activeSearch={location.search}
          role={role}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* backdrop */}
          <button
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
            aria-label="close sidebar"
          />
          {/* drawer */}
          <div className="absolute left-0 top-0 h-full">
            <Sidebar
              isCollapsed={false}
              onToggle={() => {}}
              onLogout={handleLogout}
              activePath={location.pathname}
              activeSearch={location.search}
              role={role}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 ">
        <div className="sticky top-0 z-40 border-b border-slate-200 bg-white">
          <div className="h-14 px-3 flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="h-10 w-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm active:scale-[0.98] transition"
              aria-label="open sidebar"
            >
              <PanelLeft size={18} />
            </button>

            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-slate-900 truncate">
                {pageTitle}
              </div>
            </div>

            <div className="min-w-0 text-right leading-tight">
              <div className="truncate text-sm font-semibold text-slate-800">
                {accountName}
              </div>
              {showRoleSubtitle ? (
                <div className="truncate text-[11px] text-slate-500">{roleLabel}</div>
              ) : null}
            </div>
          </div>

          <div className="hidden h-16 items-center justify-between px-6 md:flex">
            <h1 className="truncate pr-4 text-2xl font-semibold text-slate-900">{pageTitle}</h1>
            <div className="min-w-0 text-right leading-tight">
              <div className="truncate text-base font-semibold text-slate-800">
                {accountName}
              </div>
              {showRoleSubtitle ? (
                <div className="truncate text-xs text-slate-500">{roleLabel}</div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
