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
              onNavigate={() => setMobileOpen(false)} // 👈 เพิ่ม prop นี้
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="md:hidden sticky top-0 z-40 bg-[#ebebeb] p-3">
          <button
            onClick={() => setMobileOpen(true)}
             className="md:hidden h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center" >
            <PanelLeft size={18} />
          </button>
        </div>

        <div className="p-4 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
