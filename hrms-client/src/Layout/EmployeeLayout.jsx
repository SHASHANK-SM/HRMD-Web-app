import { useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import EmployeeSidebar from "./EmployeeSidebar";
import UserMenu from "./UserMenu";

const EmployeeLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-slate-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 h-screen transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <EmployeeSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main Application */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          {/* Left */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div>
              <h1 className="text-base font-semibold text-slate-900 sm:text-lg">
                Employee Portal
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                Manage your work and HR information
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Search */}
            <button
              type="button"
              className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-slate-500 md:flex"
            >
              <Search size={17} />

              <span className="text-sm">Search</span>

              <span className="ml-5 text-xs text-slate-400">Ctrl K</span>
            </button>

            {/* Mobile Search */}
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 md:hidden"
              aria-label="Search"
            >
              <Search size={19} />
            </button>

            {/* Notifications */}
            <button
              type="button"
              onClick={() => navigate("/employee-notifications")}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell size={19} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-blue-600" />
            </button>

            {/* Divider */}
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            {/* User */}
            <UserMenu profilePath="/employee-profile" />
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50">
          <div className="p-4 sm:p-5 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
