import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CreditCard,
  Edit3,
  Save,
  X,
  ShieldCheck,
} from "lucide-react";
import { useSelector } from "react-redux";
import { API } from "../../../Core/url";

const EmployeeProfileScreen = () => {
  const { token } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    employeeId: "",
    designation: "",
    department: "",
    joiningDate: "",
    employmentType: "",
    manager: "",
  });

  const [originalProfile, setOriginalProfile] = useState(null);

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getNestedValue = (value, fallback = "") => {
    if (value === null || value === undefined) return fallback;

    if (typeof value === "object") {
      return (
        value.name ||
        value.title ||
        value.departmentName ||
        value.designation ||
        value.fullName ||
        fallback
      );
    }

    return value;
  };

  const normalizeProfile = (user) => {
    if (!user) return profile;

    const fullName =
      user.name ||
      user.fullName ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim();

    const nameParts = fullName.split(" ").filter(Boolean);

    const firstName = user.firstName || user.firstname || nameParts[0] || "";

    const lastName =
      user.lastName || user.lastname || nameParts.slice(1).join(" ") || "";

    const department = getNestedValue(
      user.department,
      user.departmentName || user.dept || "",
    );

    const manager = getNestedValue(
      user.manager || user.reportingManager || user.head,
      "",
    );

    return {
      firstName,
      lastName,
      email: user.email || "",
      phone: user.phone || user.mobile || "",
      dateOfBirth: formatDate(user.dateOfBirth || user.dob),
      gender: user.gender || "",
      address:
        getNestedValue(user.address, "") ||
        user.location ||
        user.workLocation ||
        "",
      employeeId: user.employeeId || user.empId || user.employeeID || "",
      designation: user.designation || user.jobTitle || user.position || "",
      department,
      joiningDate: formatDate(
        user.joiningDate || user.dateOfJoining || user.joinedAt,
      ),
      employmentType: user.employmentType || user.empType || "",
      manager,
    };
  };

  const fetchProfile = async () => {
    try {
      const response = await API.get("/profile", authConfig);

      const responseData = response?.data;

      const user =
        responseData?.data?.user ||
        responseData?.data ||
        responseData?.user ||
        responseData;

      const normalizedProfile = normalizeProfile(user);

      setProfile(normalizedProfile);
      setOriginalProfile(normalizedProfile);
    } catch (error) {
      console.error(
        "Failed to fetch employee profile:",
        error?.response?.data || error.message,
      );
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        address: profile.address,
        designation: profile.designation,
        department: profile.department,
      };

      const response = await API.patch("/profile", payload, authConfig);

      const responseData = response?.data;

      const updatedUser =
        responseData?.data?.user || responseData?.data || responseData?.user;

      if (updatedUser) {
        const normalizedProfile = normalizeProfile(updatedUser);

        setProfile(normalizedProfile);
        setOriginalProfile(normalizedProfile);
      } else {
        setOriginalProfile(profile);
      }

      setIsEditing(false);
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Failed to update employee profile:",
        error?.response?.data || error.message,
      );
    }
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile(originalProfile);
    }

    setIsEditing(false);
    setSaved(false);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Profile</p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Profile
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View and manage your personal and employment information.
            </p>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Edit3 size={17} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <X size={16} />
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Save Message */}
      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <ShieldCheck size={17} />
          Profile updated successfully.
        </div>
      )}

      {/* Profile Overview */}
      <section className="overflow-hidden rounded-2xl bg-[#101C36] text-white shadow-sm">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold">
              {profile.firstName?.charAt(0)}
              {profile.lastName?.charAt(0)}
            </div>

            <div className="min-w-0">
              <h3 className="text-xl font-bold">
                {profile.firstName} {profile.lastName}
              </h3>

              <p className="mt-1 text-sm text-slate-300">
                {profile.designation || "--"}
              </p>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Building2 size={14} />
                  {profile.department || "--"}
                </span>

                <span className="flex items-center gap-1.5">
                  <CreditCard size={14} />
                  {profile.employeeId || "--"}
                </span>

                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} />
                  Joined {profile.joiningDate || "--"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Information */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <SectionHeader
          icon={User}
          title="Personal Information"
          description="Your basic personal details."
        />

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <ProfileField
            label="First Name"
            name="firstName"
            value={profile.firstName}
            editing={isEditing}
            onChange={handleChange}
          />

          <ProfileField
            label="Last Name"
            name="lastName"
            value={profile.lastName}
            editing={isEditing}
            onChange={handleChange}
          />

          <ProfileField
            label="Email Address"
            name="email"
            value={profile.email}
            editing={isEditing}
            onChange={handleChange}
            type="email"
          />

          <ProfileField
            label="Phone Number"
            name="phone"
            value={profile.phone}
            editing={isEditing}
            onChange={handleChange}
          />

          <ProfileField
            label="Date of Birth"
            name="dateOfBirth"
            value={profile.dateOfBirth}
            editing={isEditing}
            onChange={handleChange}
          />

          <ProfileField
            label="Gender"
            name="gender"
            value={profile.gender}
            editing={isEditing}
            onChange={handleChange}
          />

          <div className="sm:col-span-2">
            <ProfileField
              label="Address"
              name="address"
              value={profile.address}
              editing={isEditing}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      {/* Employment Information */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <SectionHeader
          icon={BriefcaseBusiness}
          title="Employment Information"
          description="Your employment details provided by HR."
        />

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
          <ProfileField
            label="Employee ID"
            name="employeeId"
            value={profile.employeeId}
            editing={false}
            onChange={handleChange}
          />

          <ProfileField
            label="Designation"
            name="designation"
            value={profile.designation}
            editing={isEditing}
            onChange={handleChange}
          />

          <ProfileField
            label="Department"
            name="department"
            value={profile.department}
            editing={isEditing}
            onChange={handleChange}
          />

          <ProfileField
            label="Joining Date"
            name="joiningDate"
            value={profile.joiningDate}
            editing={false}
            onChange={handleChange}
          />

          <ProfileField
            label="Employment Type"
            name="employmentType"
            value={profile.employmentType}
            editing={false}
            onChange={handleChange}
          />

          <ProfileField
            label="Reporting Manager"
            name="manager"
            value={profile.manager}
            editing={false}
            onChange={handleChange}
          />
        </div>
      </section>

      {/* Contact Information */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ContactCard icon={Mail} title="Email" value={profile.email} />

        <ContactCard icon={Phone} title="Phone" value={profile.phone} />

        <ContactCard icon={MapPin} title="Location" value={profile.address} />

        <ContactCard
          icon={Building2}
          title="Department"
          value={profile.department}
        />
      </section>
    </div>
  );
};

const SectionHeader = ({
  // eslint-disable-next-line no-unused-vars
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={18} />
      </div>

      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>

        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
};

const ProfileField = ({
  label,
  name,
  value,
  editing,
  onChange,
  type = "text",
}) => {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-500">
        {label}
      </label>

      {editing ? (
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      ) : (
        <div className="flex min-h-11 items-center rounded-xl bg-slate-50 px-3 text-sm font-medium text-slate-800">
          {value || "--"}
        </div>
      )}
    </div>
  );
};

const ContactCard = ({
  // eslint-disable-next-line no-unused-vars
  icon: Icon,
  title,
  value,
}) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{title}</p>

        <p className="mt-1 truncate text-sm font-semibold text-slate-800">
          {value || "--"}
        </p>
      </div>
    </div>
  );
};

export default EmployeeProfileScreen;
