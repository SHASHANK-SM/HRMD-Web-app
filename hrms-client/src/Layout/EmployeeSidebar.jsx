import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  Receipt,
  FileText,
  Bell,
  User,
  LogOut,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../feature/auth/Slices/loginSlice";

const EmployeeSibebar = ({ onNavigate }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const navigation = [
    {
      name: "Dashboard",
      path: "/employee-dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Attendance",
      path: "/employee-attendance",
      icon: CalendarCheck,
    },
    {
      name: "Leave Management",
      path: "/employee-leaves",
      icon: CalendarDays,
    },
    {
      name: "Payslips",
      path: "/payslip-management",
      icon: Receipt,
    },
    {
      name: "Documents",
      path: "/employee-documents",
      icon: FileText,
    },
    {
      name: "Notifications",
      path: "/employee-notifications",
      icon: Bell,
    },
    {
      name: "Profile",
      path: "/employee-profile",
      icon: User,
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
    onNavigate?.();
  };

  return (
    <aside className="flex h-screen w-[250px] shrink-0 flex-col overflow-hidden bg-[#101C36] text-white">
      {/* Header */}
      <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-white/10 px-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            HRMS
          </h1>

          <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-slate-400">
            Employee Portal
          </p>
        </div>

        {/* Mobile Close */}
        <button
          type="button"
          onClick={onNavigate}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X size={19} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-hidden px-3 py-5">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Main Menu
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon
                  size={20}
                  strokeWidth={2}
                />

                <span className="truncate">
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={20} />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default EmployeeSibebar;