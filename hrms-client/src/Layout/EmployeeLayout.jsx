import { useState } from "react";
import { Bell, Menu, Search, X } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import EmployeeSidebar from "./EmployeeSidebar";
import UserMenu from "./UserMenu";

const EmployeeLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/employee-attendance?search=${encodeURIComponent(query)}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    } else if (e.key === "Escape") {
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleSearchIconClick = () => {
    if (searchOpen && searchQuery.trim()) {
      handleSearch({ preventDefault: () => {} });
    } else {
      setSearchOpen(!searchOpen);
    }
  };

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
            <div className="relative hidden md:flex items-center">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setSearchOpen(true)}
                onBlur={(e) => {
                  setTimeout(() => setSearchOpen(false), 150);
                }}
                placeholder="Search attendance..."
                className="h-10 w-64 pl-9 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
                aria-label="Search attendance"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Mobile Search */}
            <button
              type="button"
              onClick={handleSearchIconClick}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
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
