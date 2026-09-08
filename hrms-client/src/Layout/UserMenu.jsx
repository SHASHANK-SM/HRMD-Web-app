import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChevronDown, UserRound, LogOut } from "lucide-react";
import { API } from "../Core/url";
import { logout } from "../feature/auth/Slices/loginSlice";

const UserMenu = ({ profilePath }) => {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [displayName, setDisplayName] = useState("User");
  const [displayRole, setDisplayRole] = useState(
    localStorage.getItem("role") || "user"
  );

  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getInitials = (value) => {
    if (!value) return "U";

    return value
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  // Fetch the real user name/role from the backend profile.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    API.get("/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        const data = response?.data?.data || response?.data || {};
        const user = data?.user || data;

        if (user?.name) setDisplayName(user.name);
        if (user?.role) setDisplayRole(user.role);
      })
      .catch(() => {
        // Keep defaults if profile fetch fails.
      });
  }, []);

  // Close dropdown when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      const token = localStorage.getItem("token");

      if (token) {
        await API.post(
          "/auth/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch {
      // Ignore logout API errors; always clear local state.
    } finally {
      dispatch(logout());
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 sm:gap-3 rounded-xl hover:bg-slate-50 p-1.5 sm:pr-2 transition-colors"
        aria-label="User menu"
      >
        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
          {getInitials(displayName)}
        </div>

        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-slate-800">
            {displayName}
          </p>

          <p className="text-xs text-slate-500 capitalize">
            {displayRole}
          </p>
        </div>

        <ChevronDown
          size={16}
          className="hidden sm:block text-slate-400"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg py-1.5 z-50">
          {/* User Info */}
          <div className="px-4 py-2.5 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800">
              {displayName}
            </p>

            <p className="text-xs text-slate-500 capitalize">
              {displayRole}
            </p>
          </div>

          {/* Edit Profile */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate(profilePath);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <UserRound size={16} className="text-slate-400" />
            Edit Profile
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            <LogOut size={16} />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;