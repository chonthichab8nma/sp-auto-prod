import { useEffect, useState } from "react";
import {
  PanelLeft,
  LayoutDashboard,
  RadioTower,
  LogOut,
  ChartColumn,
  ShieldUser,
} from "lucide-react";
import { Link } from "react-router-dom";
import ModalPortal from "../../shared/components/ui/ModalPortal";
import type { UserRole } from "../../shared/auth/auth";

interface SidebarProps {
  onLogout: () => void;
  activePath: string;
  activeSearch: string;
  isCollapsed: boolean;
  role: UserRole | null;
  onToggle: () => void;
  onNavigate?: () => void;
}

export default function Sidebar({
  activePath,
  activeSearch,
  isCollapsed,
  role,
  onToggle,
  onLogout,
  onNavigate,
}: SidebarProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!confirmOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmOpen]);

  useEffect(() => {
    if (!confirmOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [confirmOpen]);

  const handleNavigate = () => {
    setConfirmOpen(false);
    onNavigate?.();
  };
  const canAccessDashboard = role === "superadmin" || role === "admin";
  const manageTabParam = new URLSearchParams(activeSearch).get("tab");
  const activeManageTab =
    manageTabParam === "insurances" ||
    manageTabParam === "brands" ||
    manageTabParam === "alerts"
      ? manageTabParam
      : "employees";

  return (
    <>
      <aside
        className={[
          "bg-white border-r border-gray-200 flex flex-col h-full",
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "w-18" : "w-64",
        ].join(" ")}
      >

        {/* Header */}
        <div
          className={[
            "p-6 flex items-center",
            isCollapsed ? "justify-center" : "justify-between",
          ].join(" ")}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-7 h-7 object-contain shrink-0"
              />
              <div className="leading-tight">
                <div className="text-sm font-semibold text-slate-800">
                  ร้านซ่อมรถ
                </div>
                <div className="text-xs text-slate-500 truncate max-w-30">
                  เอส.พี.ออโต้เพ้นท์ เซอร์วิส
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="toggle sidebar"
          >
            <PanelLeft size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 space-y-1 overflow-x-hidden">
          {canAccessDashboard && (
            <Link
              to="/"
              onClick={handleNavigate}
              className={[
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isCollapsed ? "justify-center" : "",
                activePath === "/"
                  ? "text-blue-600 bg-blue-50 font-medium"
                  : "text-gray-600 hover:bg-gray-50",
              ].join(" ")}
            >
              <LayoutDashboard size={18} />
              {!isCollapsed && (
                <span className="whitespace-nowrap">แดชบอร์ด</span>
              )}
            </Link>
          )}

          {canAccessDashboard && (
            <Link
              to="/reports/summary"
              onClick={handleNavigate}
              className={[
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isCollapsed ? "justify-center" : "",
                activePath.startsWith("/reports")
                  ? "text-blue-600 bg-blue-50 font-medium"
                  : "text-gray-600 hover:bg-gray-50",
              ].join(" ")}
            >
              <ChartColumn size={18} />
              {!isCollapsed && <span className="whitespace-nowrap">รายงาน</span>}
            </Link>
          )}

          <Link
            to="/stations"
            onClick={onNavigate}
            className={[
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              isCollapsed ? "justify-center" : "",
              activePath.startsWith("/stations")
                ? "text-blue-600 bg-blue-50 font-medium"
                : "text-gray-600 hover:bg-gray-50",
            ].join(" ")}
          >
            <RadioTower size={18} />
            {!isCollapsed && <span className="whitespace-nowrap">สเตชั่น</span>}
          </Link>

          {role === "superadmin" && (
            <div className="space-y-1">
              <Link
                to="/superadmin/manage"
                onClick={handleNavigate}
                className={[
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isCollapsed ? "justify-center" : "",
                  activePath.startsWith("/superadmin/manage")
                    ? "text-blue-600 bg-blue-50 font-medium"
                    : "text-gray-600 hover:bg-gray-50",
                ].join(" ")}
              >
                <ShieldUser size={18} />
                {!isCollapsed && (
                  <span className="whitespace-nowrap">จัดการข้อมูล</span>
                )}
              </Link>

              {!isCollapsed && activePath.startsWith("/superadmin/manage") && (
                <div className="ml-4 space-y-1 border-l border-slate-200 pl-3">
                  <Link
                    to="/superadmin/manage?tab=employees"
                    onClick={handleNavigate}
                    className={[
                      "block rounded-md px-2 py-1.5 text-xs transition-colors",
                      activeManageTab === "employees"
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-slate-600 hover:bg-slate-100",
                    ].join(" ")}
                  >
                    จัดการพนักงาน
                  </Link>
                  <Link
                    to="/superadmin/manage?tab=insurances"
                    onClick={handleNavigate}
                    className={[
                      "block rounded-md px-2 py-1.5 text-xs transition-colors",
                      activeManageTab === "insurances"
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-slate-600 hover:bg-slate-100",
                    ].join(" ")}
                  >
                    จัดการบริษัทประกันภัย
                  </Link>
                  <Link
                    to="/superadmin/manage?tab=brands"
                    onClick={handleNavigate}
                    className={[
                      "block rounded-md px-2 py-1.5 text-xs transition-colors",
                      activeManageTab === "brands"
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-slate-600 hover:bg-slate-100",
                    ].join(" ")}
                  >
                    จัดการยี่ห้อรถ
                  </Link>
                  <Link
                    to="/superadmin/manage?tab=alerts"
                    onClick={handleNavigate}
                    className={[
                      "block rounded-md px-2 py-1.5 text-xs transition-colors",
                      activeManageTab === "alerts"
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-slate-600 hover:bg-slate-100",
                    ].join(" ")}
                  >
                    ตั้งค่า SLA/การแจ้งเตือน
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Logout button */}
        <div className="mt-auto p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className={[
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
              "text-red-600 hover:bg-red-50 transition-colors",
              isCollapsed ? "justify-center" : "",
            ].join(" ")}
          >
            <LogOut size={18} />
            {!isCollapsed && (
          <div className="flex-1 text-left leading-tight">
            <div>ออกจากระบบ</div>
            <div className="text-xs text-slate-400 group-hover:text-red-500 transition-colors">
              Sign out
            </div>
          </div>
        )}
          </button>
        </div>
      </aside>

      {/* Confirm Logout Modal */}
      {confirmOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-99999">
            {/* Backdrop */}
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => setConfirmOpen(false)}
              aria-label="close"
            />

            {/* Dialog */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="relative w-[90%] max-w-sm rounded-xl bg-white p-6 shadow-lg border border-slate-200">
                <h3 className="text-base font-semibold text-slate-900">
                  ยืนยันออกจากระบบ
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  คุณต้องการออกจากระบบใช่หรือไม่?
                </p>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmOpen(false);
                      onLogout();
                    }}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
