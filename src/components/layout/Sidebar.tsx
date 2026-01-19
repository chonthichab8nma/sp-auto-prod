import {
  PanelLeft,
  LayoutDashboard,
  RadioTower,
  CirclePlus,
} from "lucide-react";
import { Link } from "react-router-dom";

interface SidebarProps {
  onLogout: () => void;
  activePath: string;
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  activePath,
  isCollapsed,
  onToggle,
}: SidebarProps) {
  return (
    <aside
      className={`bg-white border-r border-gray-200 flex flex-col h-screen transition-all duration-300 ease-in-out shrink-0 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div
        className={`p-6 flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed && (
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold italic text-sm">
            SP
          </div>
        )}
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <PanelLeft size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-x-hidden">
        <Link
          to="/create"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            isCollapsed ? "justify-center" : ""
          } ${
            activePath === "/create"
              ? "text-blue-600 bg-blue-50 font-medium"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <CirclePlus size={18} />

          {!isCollapsed && (
            <span className="whitespace-nowrap">รับรถเข้าจอดซ่อม</span>
          )}
        </Link>

        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            isCollapsed ? "justify-center" : ""
          } ${
            activePath === "/"
              ? "text-blue-600 bg-blue-50 font-medium"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <LayoutDashboard size={18} />
          {!isCollapsed && <span className="whitespace-nowrap">แดชบอร์ด</span>}
        </Link>

        <Link
          to="/stations"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            isCollapsed ? "justify-center" : ""
          } ${
            activePath === "/stations"
              ? "text-blue-600 bg-blue-50 font-medium"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <RadioTower size={18} />
          {!isCollapsed && <span className="whitespace-nowrap">สเตชั่น</span>}
        </Link>
      </nav>
    </aside>
  );
}
