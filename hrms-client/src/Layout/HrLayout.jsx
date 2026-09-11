import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Bell, Menu, Search, X } from "lucide-react";

import HrSidebar from "./HrSidebar";
import UserMenu from "./UserMenu";

const HrLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/hr/employees?search=${encodeURIComponent(query)}`);
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
    <div className="min-h-screen h-screen bg-slate-50 flex overflow-hidden">
      {/* ================= MOBILE SIDEBAR OVERLAY ================= */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <div
        className={`
          fixed lg:static
          inset-y-0 left-0
          z-50
          transform
          transition-transform duration-300 ease-in-out
          lg:transform-none
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <HrSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* ================= MAIN AREA ================= */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* ================= HEADER ================= */}
        <header className="h-[68px] bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
          {/* Left */}
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            {/* Desktop page title */}
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-slate-900">
                HR Management
              </h1>

              <p className="hidden sm:block text-xs text-slate-500">
                Manage your workforce efficiently
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search */}
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
                placeholder="Search employees..."
                className="h-10 w-64 pl-9 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
                aria-label="Search employees"
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

            {/* Mobile search */}
            <button
              type="button"
              onClick={handleSearchIconClick}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              aria-label="Search"
            >
              <Search size={19} />
            </button>

            {/* Notification */}
            <button
              type="button"
              onClick={() => navigate("/hr-notifications")}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell size={19} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-blue-600" />
            </button>

            {/* Divider */}
            <div className="hidden sm:block h-8 w-px bg-slate-200" />

            {/* Profile */}
            <UserMenu profilePath="/hr-settings" />
          </div>
        </header>

        {/* ================= PAGE CONTENT ================= */}
        <main className="flex-1 min-h-0 overflow-y-auto bg-[#F5F7FB]">
          <div className="p-4 sm:p-5 lg:p-6 xl:p-7">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default HrLayout;
