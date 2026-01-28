import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../shared/auth/useAuth";
import { PanelLeft } from "lucide-react";

export default function AppShell() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getMobileSectionTitleTH = (pathname: string) => {
    if (pathname === "/" || pathname.startsWith("/dashboard"))
      return "แดชบอร์ด";
    if (pathname.startsWith("/stations")) return "สเตชัน";
    return ""; // หน้าอื่นไม่โชว์
  };

  const mobileTitle = getMobileSectionTitleTH(location.pathname);

  return (
    <div className="flex h-screen bg-[#ebebeb] overflow-hidden">
      <div className="hidden md:flex">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
          onLogout={handleLogout}
          activePath={location.pathname}
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
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="md:hidden sticky top-0 z-40 bg-[#ebebeb]/75 backdrop-blur border-b border-slate-200">
          <div className="px-3 h-14 flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="h-10 w-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm active:scale-[0.98] transition"
              aria-label="open sidebar"
            >
              <PanelLeft size={18} />
            </button>

            <div className="min-w-0 flex-1">
              <div className="text-l font-semibold text-slate-900 truncate">
                sp auto
              </div>
              {mobileTitle && (
                <div className="text-xs text-slate-500 truncate">
                  {mobileTitle}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
