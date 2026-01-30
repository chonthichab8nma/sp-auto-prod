import { useEffect, useState } from "react";
import { PanelLeft, LayoutDashboard, RadioTower, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import ModalPortal from "../../shared/components/ui/ModalPortal";

interface SidebarProps {
  onLogout: () => void;
  activePath: string;
  isCollapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

export default function Sidebar({
  activePath,
  isCollapsed,
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
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold italic text-sm">
              SP
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
            {!isCollapsed && <span>ออกจากระบบ</span>}
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
