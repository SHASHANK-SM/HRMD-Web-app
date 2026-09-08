import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  WalletCards,
  FileText,
  FolderOpen,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  X,
  ShieldCheck,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../feature/auth/Slices/loginSlice";

const HrSidebar = ({ onNavigate }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });

    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <aside className="w-[250px] h-screen bg-[#101C36] text-white flex flex-col">
      {/* Logo */}
      <div className="h-[68px] px-5 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <ShieldCheck size={21} />
          </div>

          <div>
            <h1 className="text-lg font-bold">HRMS</h1>

            <p className="text-xs text-slate-400">
              Human Resource Management
            </p>
          </div>
        </div>

        <button
          onClick={onNavigate}
          className="lg:hidden text-slate-400 hover:text-white"
        >
          <X size={19} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 mb-2 text-xs uppercase tracking-widest text-slate-500 font-semibold">
          Main
        </p>

        <div className="space-y-1">
          <SidebarItem
            to="/hr-dashboard"
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            onNavigate={onNavigate}
          />

          <SidebarItem
            to="/employees-details"
            icon={<Users size={18} />}
            label="Employees"
            onNavigate={onNavigate}
          />

          <SidebarItem
            to="/hr-attendance"
            icon={<CalendarCheck size={18} />}
            label="Attendance"
            onNavigate={onNavigate}
          />
        </div>

        <p className="px-3 mb-2 mt-7 text-xs uppercase tracking-widest text-slate-500 font-semibold">
          Management
        </p>

        <div className="space-y-1">
          <SidebarItem
            to="/hr-leave-management"
            icon={<CalendarDays size={18} />}
            label="Leave Management"
            onNavigate={onNavigate}
          />

          <SidebarItem
            to="/hr-payroll-management"
            icon={<WalletCards size={18} />}
            label="Payroll"
            onNavigate={onNavigate}
          />

          <SidebarItem
            to="/hr-payslips"
            icon={<FileText size={18} />}
            label="Payslips"
            onNavigate={onNavigate}
          />

          <SidebarItem
            to="/hr-documents"
            icon={<FolderOpen size={18} />}
            label="Documents"
            onNavigate={onNavigate}
          />

          <SidebarItem
            to="/hr-reports"
            icon={<BarChart3 size={18} />}
            label="Reports"
            onNavigate={onNavigate}
          />

          {/* Notifications */}
          <SidebarItem
            to="/hr-notifications"
            icon={<Bell size={18} />}
            label="Notifications"
            onNavigate={onNavigate}
          />
        </div>

        <p className="px-3 mb-2 mt-7 text-xs uppercase tracking-widest text-slate-500 font-semibold">
          Account
        </p>

        <SidebarItem
          to="/hr-settings"
          icon={<Settings size={18} />}
          label="Settings"
          onNavigate={onNavigate}
        />
      </nav>

      {/* Profile + Logout */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 px-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold">
            HR
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Admin HR</p>

            <p className="text-xs text-slate-400 truncate">
              HR Administrator
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

const SidebarItem = ({ to, icon, label, onNavigate }) => {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
          isActive
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-400 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default HrSidebar;
