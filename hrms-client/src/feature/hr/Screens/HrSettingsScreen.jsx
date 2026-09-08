import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { API } from "../../../Core/url";
import {
  User,
  Bell,
  Lock,
  Building2,
  Mail,
  Phone,
  Save,
  Shield,
  CheckCircle2,
} from "lucide-react";

const HrSettingsScreen = () => {
  const { token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("Profile");
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
  });

  const [notifications, setNotifications] = useState({
    leaveRequests: true,
    attendanceAlerts: true,
    payrollUpdates: true,
    emailNotifications: true,
  });

  const [password, setPassword] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  useEffect(() => {
    if (!token) return;
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };
    Promise.all([
      API.get("/auth/profile", authConfig),
      API.get("/settings", authConfig),
    ])
      .then(([profileResponse, settingsResponse]) => {
        const user = profileResponse?.data?.data || {};
        setProfile({
          name: user.name || "",
          email: user.email || "",
          phone: user.mobile || "",
          designation: user.jobTitle || "",
        });
        setNotifications((previous) => ({
          ...previous,
          ...(settingsResponse?.data?.data || {}),
        }));
      })
      .catch((error) => console.error("Failed to fetch HR settings:", error));
  }, [token]);

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPassword((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const tabs = [
    {
      name: "Profile",
      icon: User,
    },
    {
      name: "Notifications",
      icon: Bell,
    },
    {
      name: "Security",
      icon: Lock,
    },
    {
      name: "Company",
      icon: Building2,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Settings
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage your account and HRMS preferences
        </p>
      </div>

      {/* Settings Layout */}
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Sidebar */}
        <div className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:w-60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.name;

            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {activeTab === "Profile" && (
            <ProfileSettings
              profile={profile}
              onChange={handleProfileChange}
              onSave={handleSave}
            />
          )}

          {activeTab === "Notifications" && (
            <NotificationSettings
              notifications={notifications}
              setNotifications={setNotifications}
            />
          )}

          {activeTab === "Security" && (
            <SecuritySettings
              password={password}
              onChange={handlePasswordChange}
              onSave={handleSave}
            />
          )}

          {activeTab === "Company" && <CompanySettings onSave={handleSave} />}

          {/* Save message */}
          {saved && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              <CheckCircle2 size={18} />
              Settings saved successfully.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------- */
/* Profile Settings */
/* ---------------------------------- */

const ProfileSettings = ({ profile, onChange, onSave }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <SettingsHeader
        title="Profile Information"
        description="Update your HR administrator profile"
      />

      <div className="space-y-6 p-5 sm:p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
            HR
          </div>

          <div>
            <p className="font-semibold text-slate-900">{profile.name}</p>

            <p className="text-sm text-slate-500">{profile.designation}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField
            label="Full Name"
            icon={<User size={17} />}
            value={profile.name}
            onChange={(value) => onChange("name", value)}
          />

          <FormField
            label="Email Address"
            icon={<Mail size={17} />}
            type="email"
            value={profile.email}
            onChange={(value) => onChange("email", value)}
          />

          <FormField
            label="Phone Number"
            icon={<Phone size={17} />}
            value={profile.phone}
            onChange={(value) => onChange("phone", value)}
          />

          <FormField
            label="Designation"
            icon={<Shield size={17} />}
            value={profile.designation}
            onChange={(value) => onChange("designation", value)}
          />
        </div>

        <SaveButton onClick={onSave} />
      </div>
    </div>
  );
};

/* ---------------------------------- */
/* Notification Settings */
/* ---------------------------------- */

const NotificationSettings = ({ notifications, setNotifications }) => {
  const toggleNotification = (field) => {
    setNotifications((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const settings = [
    {
      key: "leaveRequests",
      title: "Leave Requests",
      description:
        "Receive notifications when employees submit leave requests.",
    },
    {
      key: "attendanceAlerts",
      title: "Attendance Alerts",
      description: "Get notified about attendance issues and late check-ins.",
    },
    {
      key: "payrollUpdates",
      title: "Payroll Updates",
      description: "Receive updates related to payroll processing.",
    },
    {
      key: "emailNotifications",
      title: "Email Notifications",
      description: "Receive important HRMS notifications through email.",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <SettingsHeader
        title="Notifications"
        description="Choose which notifications you want to receive"
      />

      <div className="divide-y divide-slate-100">
        {settings.map((setting) => (
          <div
            key={setting.key}
            className="flex items-center justify-between gap-4 p-5 sm:p-6"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {setting.title}
              </p>

              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">
                {setting.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => toggleNotification(setting.key)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                notifications[setting.key] ? "bg-blue-600" : "bg-slate-300"
              }`}
              aria-label={`Toggle ${setting.title}`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                  notifications[setting.key] ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------------------------- */
/* Security Settings */
/* ---------------------------------- */

const SecuritySettings = ({ password, onChange, onSave }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <SettingsHeader
        title="Security"
        description="Manage your password and account security"
      />

      <div className="space-y-5 p-5 sm:p-6">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex gap-3">
            <Shield className="mt-0.5 shrink-0 text-blue-600" size={19} />

            <div>
              <p className="text-sm font-semibold text-blue-900">
                Keep your account secure
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                Use a strong password that you do not use on other websites.
              </p>
            </div>
          </div>
        </div>

        <FormField
          label="Current Password"
          type="password"
          value={password.current}
          onChange={(value) => onChange("current", value)}
        />

        <FormField
          label="New Password"
          type="password"
          value={password.newPassword}
          onChange={(value) => onChange("newPassword", value)}
        />

        <FormField
          label="Confirm New Password"
          type="password"
          value={password.confirm}
          onChange={(value) => onChange("confirm", value)}
        />

        <SaveButton text="Update Password" onClick={onSave} />
      </div>
    </div>
  );
};

/* ---------------------------------- */
/* Company Settings */
/* ---------------------------------- */

const CompanySettings = ({ onSave }) => {
  const [company, setCompany] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    workingHours: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    API.get("/auth/company-details", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        const data = response?.data?.data || {};
        setCompany({
          name: data.companyName || "",
          email: data.businessMail || "",
          phone: data.mobile || "",
          address: data.companyAddress || "",
          workingHours: data.workingHours || "",
        });
      })
      .catch((error) =>
        console.error("Failed to fetch company settings:", error),
      );
  }, []);

  const handleChange = (field, value) => {
    setCompany((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <SettingsHeader
        title="Company Information"
        description="Manage your organization's basic information"
      />

      <div className="space-y-5 p-5 sm:p-6">
        <FormField
          label="Company Name"
          icon={<Building2 size={17} />}
          value={company.name}
          onChange={(value) => handleChange("name", value)}
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField
            label="Company Email"
            icon={<Mail size={17} />}
            value={company.email}
            onChange={(value) => handleChange("email", value)}
          />

          <FormField
            label="Phone Number"
            icon={<Phone size={17} />}
            value={company.phone}
            onChange={(value) => handleChange("phone", value)}
          />
        </div>

        <FormField
          label="Address"
          value={company.address}
          onChange={(value) => handleChange("address", value)}
        />

        <FormField
          label="Working Hours"
          icon={<ClockIcon />}
          value={company.workingHours}
          onChange={(value) => handleChange("workingHours", value)}
        />

        <SaveButton onClick={onSave} />
      </div>
    </div>
  );
};

/* ---------------------------------- */
/* Reusable Components */
/* ---------------------------------- */

const SettingsHeader = ({ title, description }) => {
  return (
    <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
      <h3 className="font-semibold text-slate-900">{title}</h3>

      <p className="mt-1 text-xs text-slate-500 sm:text-sm">{description}</p>
    </div>
  );
};

const FormField = ({ label, icon, type = "text", value, onChange }) => {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-11 w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
            icon ? "pl-10 pr-3" : "px-3"
          }`}
        />
      </div>
    </div>
  );
};

const SaveButton = ({ onClick, text = "Save Changes" }) => {
  return (
    <div className="flex justify-end pt-1">
      <button
        onClick={onClick}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        <Save size={16} />
        {text}
      </button>
    </div>
  );
};

const ClockIcon = () => {
  return (
    <span className="text-slate-400">
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 14" />
      </svg>
    </span>
  );
};

export default HrSettingsScreen;
