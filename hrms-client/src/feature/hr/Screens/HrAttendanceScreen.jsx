import { useEffect, useMemo, useState } from "react";
import {
  Search,
  CalendarDays,
  Users,
  UserCheck,
  UserX,
  Clock3,
  Download,
  SlidersHorizontal,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { API } from "../../../Core/url";
import { useSelector } from "react-redux";

const HrAttendanceScreen = () => {
  const token = useSelector((state) => state.login?.token);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Status");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  });

  const [showFilters, setShowFilters] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    present: 0,
    absent: 0,
    late: 0,
  });

  const authConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const formatTime = (value) => {
    if (!value) return "—";

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatHours = (value) => {
    const hours = Number(value || 0);

    if (!hours) return "—";

    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    if (wholeHours === 0) {
      return `${minutes}m`;
    }

    return `${wholeHours}h ${minutes}m`;
  };

  const formatDate = (value) => {
    if (!value) return "";

    const parsed = new Date(`${value}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getEmployeeDepartment = (employee) => {
    if (!employee) return "—";

    if (typeof employee.department === "string") {
      return employee.department;
    }

    return employee.department?.title || "—";
  };

  const loadAttendance = async () => {
    if (!token) {
      setAttendanceData([]);
      setSummary({
        totalEmployees: 0,
        present: 0,
        absent: 0,
        late: 0,
      });
      return;
    }

    try {
      const response = await API.get("/attendance/hr", {
        ...authConfig,
        params: {
          date,
          page: 1,
          limit: 100,
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(department !== "All Departments"
            ? { department }
            : {}),
        },
      });

      const payload = response?.data?.data || [];
      const meta = response?.data?.meta || {};

      const normalized = payload.map((item) => {
        const employee = item?.employee || {};
        const attendance = item?.attendance;

        let currentStatus = "Absent";

        if (attendance) {
          if (attendance.status === "late") {
            currentStatus = "Late";
          } else {
            currentStatus = "Present";
          }
        }

        return {
          id: employee.empId || employee._id || "—",
          name: employee.name || "Unknown Employee",
          department: getEmployeeDepartment(employee),
          checkIn: attendance ? formatTime(attendance.checkIn) : "—",
          checkOut: attendance ? formatTime(attendance.checkOut) : "—",
          workingHours: attendance
            ? formatHours(attendance.totalHours)
            : "—",
          overtime: attendance
            ? formatHours(attendance.extraHours)
            : "—",
          status: currentStatus,
        };
      });

      setAttendanceData(normalized);

      setSummary({
        totalEmployees: Number(meta.total || normalized.length || 0),
        present: normalized.filter(
          (employee) => employee.status === "Present"
        ).length,
        absent: normalized.filter(
          (employee) => employee.status === "Absent"
        ).length,
        late: normalized.filter(
          (employee) => employee.status === "Late"
        ).length,
      });
    } catch {
      setAttendanceData([]);
      setSummary({
        totalEmployees: 0,
        present: 0,
        absent: 0,
        late: 0,
      });
    }
  };

  const loadDepartments = async () => {
    if (!token) return;

    try {
      const response = await API.get("/employees/departments", authConfig);

      const data = response?.data?.data || [];

      setDepartments(
        data
          .map((item) =>
            typeof item === "string" ? item : item?.title
          )
          .filter(Boolean)
      );
    } catch {
      setDepartments([]);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, [token, loadDepartments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAttendance();
    }, 250);

    return () => clearTimeout(timer);
  }, [token, date, search, department, loadAttendance]);

  const filteredAttendance = useMemo(() => {
    return attendanceData.filter((employee) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        employee.name.toLowerCase().includes(searchText) ||
        employee.id.toLowerCase().includes(searchText);

      const matchesDepartment =
        department === "All Departments" ||
        employee.department === department;

      const matchesStatus =
        status === "All Status" || employee.status === status;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [attendanceData, search, department, status]);

  const presentPercentage =
    summary.totalEmployees > 0
      ? ((summary.present / summary.totalEmployees) * 100).toFixed(1)
      : "0.0";

  const absentPercentage =
    summary.totalEmployees > 0
      ? ((summary.absent / summary.totalEmployees) * 100).toFixed(1)
      : "0.0";

  const latePercentage =
    summary.totalEmployees > 0
      ? ((summary.late / summary.totalEmployees) * 100).toFixed(1)
      : "0.0";

  const handleExport = async () => {
    if (!token) return;

    try {
      const response = await API.get("/reports/attendance", {
        ...authConfig,
        params: {
          startDate: date,
          endDate: date,
          ...(department !== "All Departments"
            ? { department }
            : {}),
          export: "csv",
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `attendance-${date}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch {
      // Keep the existing UI unchanged when export fails.
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Attendance Management
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Monitor employee attendance, working hours and overtime.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="self-start sm:self-auto flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50"
        >
          <Download size={16} />
          Export Report
        </button>
      </div>

      {/* Date Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <CalendarDays size={19} className="text-blue-600" />
            </div>

            <div>
              <p className="text-xs text-slate-400">Attendance Date</p>

              <p className="text-sm font-semibold text-slate-800">
                {formatDate(date)}
              </p>
            </div>
          </div>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AttendanceCard
          icon={Users}
          label="Total Employees"
          value={summary.totalEmployees}
          subtext="Registered"
          color="blue"
        />

        <AttendanceCard
          icon={UserCheck}
          label="Present"
          value={summary.present}
          subtext={`${presentPercentage}% of total`}
          color="emerald"
        />

        <AttendanceCard
          icon={UserX}
          label="Absent"
          value={summary.absent}
          subtext={`${absentPercentage}% of total`}
          color="red"
        />

        <AttendanceCard
          icon={Clock3}
          label="Late"
          value={summary.late}
          subtext={`${latePercentage}% of total`}
          color="amber"
        />
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">
                Employee Attendance
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                {filteredAttendance.length} records found
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden self-start flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>

          {/* Filters */}
          <div
            className={`mt-4 ${
              showFilters ? "flex" : "hidden"
            } lg:flex flex-col lg:flex-row gap-3`}
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Department */}
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 outline-none focus:border-blue-400"
            >
              <option>All Departments</option>

              {Array.from(
                new Set([
                  "Engineering",
                  "HR",
                  "Finance",
                  "Marketing",
                  "Sales",
                  "Operations",
                  ...departments,
                ])
              ).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 outline-none focus:border-blue-400"
            >
              <option>All Status</option>
              <option>Present</option>
              <option>Absent</option>
              <option>Late</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <TableHeading>Employee</TableHeading>
                <TableHeading>Department</TableHeading>
                <TableHeading>Check In</TableHeading>
                <TableHeading>Check Out</TableHeading>
                <TableHeading>Working Hours</TableHeading>
                <TableHeading>Overtime</TableHeading>
                <TableHeading>Status</TableHeading>
                <TableHeading>Action</TableHeading>
              </tr>
            </thead>

            <tbody>
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    {/* Employee */}
                    <td className="px-4 sm:px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={employee.name} />

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {employee.name}
                          </p>

                          <p className="text-[11px] text-slate-400">
                            {employee.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-600">
                        {employee.department}
                      </span>
                    </td>

                    {/* Check In */}
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs ${
                          employee.checkIn === "—"
                            ? "text-slate-300"
                            : "text-slate-600"
                        }`}
                      >
                        {employee.checkIn}
                      </span>
                    </td>

                    {/* Check Out */}
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs ${
                          employee.checkOut === "—"
                            ? "text-slate-300"
                            : "text-slate-600"
                        }`}
                      >
                        {employee.checkOut}
                      </span>
                    </td>

                    {/* Working Hours */}
                    <td className="px-4 py-4">
                      <span className="text-xs font-medium text-slate-700">
                        {employee.workingHours}
                      </span>
                    </td>

                    {/* Overtime */}
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs ${
                          employee.overtime === "—"
                            ? "text-slate-300"
                            : "text-blue-600 font-medium"
                        }`}
                      >
                        {employee.overtime}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <StatusBadge status={employee.status} />
                    </td>

                    {/* Action */}
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      >
                        <MoreHorizontal size={17} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <Users size={20} className="text-slate-400" />
                      </div>

                      <p className="text-sm font-medium text-slate-700">
                        No attendance records found
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Try changing your search or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 sm:px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="font-medium text-slate-600">
              {filteredAttendance.length > 0 ? 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-medium text-slate-600">
              {filteredAttendance.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-600">
              {summary.totalEmployees}
            </span>{" "}
            employees
          </p>

          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50">
              <ChevronLeft size={16} />
            </button>

            <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-medium">
              1
            </button>

            <button className="w-8 h-8 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">
              2
            </button>

            <button className="w-8 h-8 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">
              3
            </button>

            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   ATTENDANCE CARD
========================================================= */

// eslint-disable-next-line no-unused-vars
const AttendanceCard = ({ icon: Icon, label, value, subtext, color }) => {
  const styles = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
    },
    emerald: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
    },
    red: {
      bg: "bg-red-50",
      icon: "text-red-600",
    },
    amber: {
      bg: "bg-amber-50",
      icon: "text-amber-600",
    },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div
        className={`w-9 h-9 rounded-lg ${styles[color].bg} flex items-center justify-center`}
      >
        <Icon size={18} className={styles[color].icon} />
      </div>

      <p className="text-xs text-slate-500 mt-3">{label}</p>

      <div className="flex items-end gap-2 mt-1">
        <p className="text-xl font-bold text-slate-900">{value}</p>

        <p className="text-[10px] text-slate-400 mb-1">{subtext}</p>
      </div>
    </div>
  );
};

/* =========================================================
   TABLE HEADING
========================================================= */

const TableHeading = ({ children }) => (
  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
    {children}
  </th>
);

/* =========================================================
   AVATAR
========================================================= */

const Avatar = ({ name }) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-semibold shrink-0">
      {initials || "U"}
    </div>
  );
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ status }) => {
  const config = {
    Present: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      dot: "bg-emerald-500",
      icon: CheckCircle2,
    },

    Late: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      dot: "bg-amber-500",
      icon: Clock,
    },

    Absent: {
      bg: "bg-red-50",
      text: "text-red-600",
      dot: "bg-red-500",
      icon: XCircle,
    },
  };

  const current = config[status] || config.Absent;
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${current.bg} ${current.text}`}
    >
      <Icon size={11} />
      {status}
    </span>
  );
};

export default HrAttendanceScreen;