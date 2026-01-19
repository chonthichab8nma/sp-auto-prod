import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import Sidebar from "../components/layout/Sidebar";
export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    console.log("Logout clicked (No Auth mode)");
    navigate("/");
  };
  return (
    <div className="flex h-screen bg-[#ebebeb] overflow-hidden">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        onLogout={handleLogout}
        activePath={location.pathname}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
