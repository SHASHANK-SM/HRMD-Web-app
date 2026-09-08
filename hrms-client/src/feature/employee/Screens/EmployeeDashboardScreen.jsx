import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  CalendarCheck,
  CalendarDays,
  Clock3,
  FileText,
  LogOut,
  UserRound,
  WalletCards,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
} from "lucide-react";
import { API } from "../../../Core/url";

const EmployeeDashboardScreen = () => {
  const navigate = useNavigate();

  const { token } = useSelector((state) => state.auth);

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [employee, setEmployee] = useState({
    name: "Employee",
    designation: "",
    department: "",
  });

  const [leaveBalance, setLeaveBalance] = useState({
    total: 0,
    used: 0,
    remaining: 0,
  });

  const [recentAttendance, setRecentAttendance] = useState([]);

  const [dashboardStats, setDashboardStats] = useState({
    totalHours: "0h 0m",
    presentDays: 0,
    attendancePercentage: "0%",
  });

  const [leaveRows, setLeaveRows] = useState([
    {
      title: "Casual Leave",
      used: 0,
      total: 0,
    },
    {
      title: "Sick Leave",
      used: 0,
      total: 0,
    },
    {
      title: "Earned Leave",
      used: 0,
      total: 0,
    },
  ]);

  const [actionLoading, setActionLoading] = useState(false);

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const getResponseData = (response) =>
    response?.data?.data ?? response?.data ?? {};

  const getDisplayValue = (value) => {
    if (!value) return "";
    if (typeof value === "object") {
      return value.title || value.name || value.departmentName || "";
    }
    return String(value);
  };

  const getErrorMessage = (error) =>
    error?.response?.data?.message || "Something went wrong. Please try again.";

  const formatDate = (value) => {
    if (!value) return "--";

    const date = new Date(
      String(value).includes("T") ? value : `${value}T00:00:00`,
    );

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "--";

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatHours = (value) => {
    if (value === null || value === undefined || value === "") {
      return "0h 0m";
    }

    if (typeof value === "string") {
      return value;
    }

    const totalMinutes = Math.max(0, Math.round(Number(value) * 60));

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  const getMonthValue = () => {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}`;
  };

  const getYearValue = () => new Date().getFullYear();

  const getMonthNumber = () => new Date().getMonth() + 1;

  const normalizeAttendanceRecord = (record) => {
    const dateValue =
      record?.date || record?.attendanceDate || record?.createdAt;

    const checkIn = record?.checkIn || record?.checkInTime || null;

    const checkOut = record?.checkOut || record?.checkOutTime || null;

    const parsedDate = dateValue
      ? new Date(
          String(dateValue).includes("T") ? dateValue : `${dateValue}T00:00:00`,
        )
      : null;

    return {
      id: record?._id || record?.id || dateValue,

      date: formatDate(dateValue),

      day:
        parsedDate && !Number.isNaN(parsedDate.getTime())
          ? parsedDate.toLocaleDateString("en-IN", {
              weekday: "long",
            })
          : "--",

      checkIn: record?.checkInFormatted || formatTime(checkIn),

      checkOut: record?.checkOutFormatted || formatTime(checkOut),

      hours:
        record?.workingHoursFormatted ||
        formatHours(
          record?.workingHours ??
            record?.totalWorkingHours ??
            record?.hoursWorked,
        ),

      overtime: record?.overtimeFormatted || formatHours(record?.overtime),

      status: record?.status || "Present",
    };
  };

  const fetchEmployeeProfile = async () => {
    if (!token) return;

    try {
      const response = await API.get("/auth/profile", getAuthConfig());

      const data = getResponseData(response);

      const user = data?.user || data;

      if (user?.name || user?.firstName || user?.lastName) {
        setEmployee({
          name:
            user?.name ||
            user?.fullName ||
            [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
            "Employee",

          designation:
            getDisplayValue(
              user?.designation || user?.jobTitle || user?.position,
            ) || "",

          department:
            getDisplayValue(user?.department || user?.departmentName) || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch employee profile:", error);
    }
  };

  const fetchDashboard = async () => {
    if (!token) return;

    try {
      const response = await API.get("/dashboard/employee", getAuthConfig());

      const data = getResponseData(response);

      const employeeData = data?.employee || data?.user || data?.profile || {};

      setEmployee({
        name:
          employeeData?.name ||
          employeeData?.fullName ||
          [employeeData?.firstName, employeeData?.lastName]
            .filter(Boolean)
            .join(" ") ||
          "Employee",

        designation:
          getDisplayValue(
            employeeData?.designation ||
              employeeData?.jobTitle ||
              employeeData?.position,
          ) || "",

        department:
          getDisplayValue(
            employeeData?.department || employeeData?.departmentName,
          ) || "",
      });

      const stats =
        data?.stats ||
        data?.attendance ||
        data?.summary ||
        data?.statistics ||
        {};

      setDashboardStats({
        totalHours:
          stats?.totalHours ||
          stats?.totalWorkingHours ||
          stats?.workingHours ||
          stats?.hoursWorkedThisMonth ||
          stats?.hoursWorked ||
          "0h 0m",

        presentDays:
          stats?.presentDays ?? stats?.present ?? stats?.daysPresent ?? 0,

        attendancePercentage:
          stats?.attendancePercentage ??
          stats?.percentage ??
          (stats?.daysPresent ? `${stats.daysPresent} days` : "0%"),
      });

      const dashboardAttendance =
        data?.recentAttendance ||
        data?.attendanceHistory ||
        data?.recentRecords;

      if (Array.isArray(dashboardAttendance)) {
        setRecentAttendance(
          dashboardAttendance.slice(0, 4).map(normalizeAttendanceRecord),
        );
      }
    } catch (error) {
      console.error("Failed to fetch employee dashboard:", error);
    }
  };

  const fetchTodayAttendance = async () => {
    if (!token) return;

    try {
      const response = await API.get("/attendance/today", getAuthConfig());

      const data = getResponseData(response);

      const attendance = data?.attendance || data?.record || data;

      if (
        !attendance ||
        (!attendance?._id && !attendance?.checkIn && !attendance?.checkInTime)
      ) {
        setIsCheckedIn(false);
        setCheckInTime(null);
        setCheckOutTime(null);
        setElapsedSeconds(0);
        return;
      }

      const backendCheckIn = attendance?.checkIn || attendance?.checkInTime;

      const backendCheckOut = attendance?.checkOut || attendance?.checkOutTime;

      const parsedCheckIn = backendCheckIn ? new Date(backendCheckIn) : null;

      const parsedCheckOut = backendCheckOut ? new Date(backendCheckOut) : null;

      const validCheckIn =
        parsedCheckIn && !Number.isNaN(parsedCheckIn.getTime())
          ? parsedCheckIn
          : null;

      const validCheckOut =
        parsedCheckOut && !Number.isNaN(parsedCheckOut.getTime())
          ? parsedCheckOut
          : null;

      setCheckInTime(validCheckIn);
      setCheckOutTime(validCheckOut);

      const checkedIn =
        Boolean(validCheckIn) &&
        !validCheckOut &&
        attendance?.status !== "Completed";

      setIsCheckedIn(checkedIn);

      if (checkedIn && validCheckIn) {
        setElapsedSeconds(
          Math.max(0, Math.floor((Date.now() - validCheckIn.getTime()) / 1000)),
        );
      } else if (validCheckIn && validCheckOut) {
        setElapsedSeconds(
          Math.max(
            0,
            Math.floor(
              (validCheckOut.getTime() - validCheckIn.getTime()) / 1000,
            ),
          ),
        );
      } else {
        setElapsedSeconds(0);
      }
    } catch (error) {
      console.error("Failed to fetch today's attendance:", error);
    }
  };

  const fetchRecentAttendance = async () => {
    if (!token) return;

    try {
      const response = await API.get("/attendance/history", {
        ...getAuthConfig(),
        params: {
          page: 1,
          limit: 4,
          month: getMonthValue(),
        },
      });

      const data = getResponseData(response);

      const records = Array.isArray(data)
        ? data
        : data?.records ||
          data?.attendance ||
          data?.history ||
          data?.results ||
          [];

      setRecentAttendance(records.slice(0, 4).map(normalizeAttendanceRecord));

      const pagination = data?.pagination || response?.data?.meta || {};

      const summary = data?.summary || {};

      setDashboardStats((previous) => ({
        totalHours:
          summary?.totalHours ||
          summary?.totalWorkingHours ||
          previous.totalHours,

        presentDays:
          summary?.present ?? summary?.presentDays ?? previous.presentDays,

        attendancePercentage:
          summary?.attendancePercentage ??
          summary?.percentage ??
          previous.attendancePercentage,
      }));

      if (pagination?.total !== undefined) {
        return;
      }
    } catch (error) {
      console.error("Failed to fetch recent attendance:", error);
    }
  };

  const fetchMonthlySummary = async () => {
    if (!token) return;

    try {
      const response = await API.get("/attendance/monthly-summary", {
        ...getAuthConfig(),
        params: {
          year: getYearValue(),
          month: getMonthNumber(),
        },
      });

      const data = getResponseData(response);

      const summary = data?.summary || data;

      const summaryPresentDays =
        summary?.present ??
        summary?.presentDays ??
        summary?.daysPresent ??
        dashboardStats.presentDays;

      const summaryTotalHours =
        summary?.totalHours ||
        summary?.totalWorkingHours ||
        summary?.hoursWorked ||
        dashboardStats.totalHours;

      const summaryPercentage =
        summary?.attendancePercentage ??
        summary?.percentage ??
        (summaryPresentDays
          ? `${summaryPresentDays} days`
          : dashboardStats.attendancePercentage);

      setDashboardStats({
        totalHours: summaryTotalHours,
        presentDays: summaryPresentDays,
        attendancePercentage: summaryPercentage,
      });
    } catch (error) {
      console.error("Failed to fetch monthly summary:", error);
    }
  };

  const fetchLeaveBalance = async () => {
    if (!token) return;

    try {
      const response = await API.get("/leaves/balance", getAuthConfig());

      const data = getResponseData(response);

      const balance = data?.balance || data?.summary || data;

      // Backend returns `used` as an object keyed by leave type,
      // e.g. { casual: 2, sick: 1, annual: 0 }.
      const usedByType =
        balance?.used &&
        typeof balance?.used === "object" &&
        !Array.isArray(balance?.used)
          ? balance.used
          : {};

      const usedTotal = Object.values(usedByType).reduce(
        (sum, value) => sum + (Number(value) || 0),
        0,
      );

      const total =
        Number(
          balance?.total ??
            balance?.totalLeave ??
            balance?.allocated ??
            usedTotal,
        ) || 0;

      const used =
        Number(
          balance?.usedLeave ??
            (typeof balance?.used === "number" ? balance.used : usedTotal),
        ) || 0;

      const remaining =
        Number(
          balance?.remaining ??
            balance?.available ??
            balance?.remainingLeave ??
            Math.max(total - used, 0),
        ) || 0;

      setLeaveBalance({
        total,
        used,
        remaining,
      });

      // Build leave rows from the `used` object when present.
      const leaveTypes =
        data?.leaveTypes || data?.balances || data?.leaves || [];

      if (Array.isArray(leaveTypes) && leaveTypes.length > 0) {
        const findLeave = (...names) =>
          leaveTypes.find((item) =>
            names.includes(
              String(
                item?.leaveType || item?.type || item?.name || "",
              ).toLowerCase(),
            ),
          );

        const casual = findLeave("casual", "casual leave");

        const sick = findLeave("sick", "sick leave");

        const earned = findLeave(
          "annual",
          "annual leave",
          "earned",
          "earned leave",
        );

        setLeaveRows([
          {
            title: "Casual Leave",
            used: Number(casual?.used ?? casual?.usedDays ?? 0) || 0,
            total:
              Number(
                casual?.total ?? casual?.allocated ?? casual?.totalDays ?? 0,
              ) || 0,
          },
          {
            title: "Sick Leave",
            used: Number(sick?.used ?? sick?.usedDays ?? 0) || 0,
            total:
              Number(sick?.total ?? sick?.allocated ?? sick?.totalDays ?? 0) ||
              0,
          },
          {
            title: "Earned Leave",
            used: Number(earned?.used ?? earned?.usedDays ?? 0) || 0,
            total:
              Number(
                earned?.total ?? earned?.allocated ?? earned?.totalDays ?? 0,
              ) || 0,
          },
        ]);
      } else if (Object.keys(usedByType).length > 0) {
        // Fallback: derive rows directly from the `used` object.
        const typeLabels = {
          casual: "Casual Leave",
          sick: "Sick Leave",
          annual: "Earned Leave",
          earned: "Earned Leave",
          emergency: "Emergency Leave",
          maternity: "Maternity Leave",
          paternity: "Paternity Leave",
          unpaid: "Unpaid Leave",
        };

        const rows = Object.entries(usedByType)
          .filter(([, value]) => Number(value) > 0)
          .map(([type, value]) => ({
            title: typeLabels[type] || type,
            used: Number(value) || 0,
            total: Number(value) || 0,
          }));

        if (rows.length > 0) {
          setLeaveRows(rows);
        }
      }
    } catch (error) {
      console.error("Failed to fetch leave balance:", error);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchEmployeeProfile();
    fetchDashboard();
    fetchTodayAttendance();
    fetchRecentAttendance();
    fetchMonthlySummary();
    fetchLeaveBalance();
  }, [token]);

  useEffect(() => {
    if (!isCheckedIn || !checkInTime) return;

    const updateTimer = () => {
      const difference = Math.floor(
        (Date.now() - checkInTime.getTime()) / 1000,
      );

      setElapsedSeconds(Math.max(0, difference));
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTime]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours}h ${minutes}m ${secs}s`;
  };

  const currentTime = useMemo(() => {
    if (isCheckedIn) {
      return formatDuration(elapsedSeconds);
    }

    if (checkOutTime) {
      const workedSeconds = checkInTime
        ? Math.floor((checkOutTime - checkInTime) / 1000)
        : 0;

      return formatDuration(workedSeconds);
    }

    return "0h 0m 0s";
  }, [isCheckedIn, elapsedSeconds, checkInTime, checkOutTime]);

  const handleCheckIn = async () => {
    if (!token || actionLoading) return;

    try {
      setActionLoading(true);

      await API.post("/attendance/check-in", {}, getAuthConfig());

      await fetchTodayAttendance();
      await fetchRecentAttendance();
      await fetchMonthlySummary();
      await fetchDashboard();
    } catch (error) {
      console.error("Failed to check in:", error);

      alert(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!token || actionLoading) return;

    try {
      setActionLoading(true);

      await API.post("/attendance/check-out", {}, getAuthConfig());

      await fetchTodayAttendance();
      await fetchRecentAttendance();
      await fetchMonthlySummary();
      await fetchDashboard();
    } catch (error) {
      console.error("Failed to check out:", error);

      alert(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Apply Leave",
      description: "Submit a new leave request",
      icon: CalendarDays,
      path: "/employee-leaves",
    },
    {
      title: "View Attendance",
      description: "Check your attendance history",
      icon: CalendarCheck,
      path: "/employee-attendance",
    },
    {
      title: "View Payslips",
      description: "Access your salary slips",
      icon: WalletCards,
      path: "/payslip-management",
    },
    {
      title: "View Profile",
      description: "Manage your personal details",
      icon: UserRound,
      path: "/employee-profile",
    },
  ];

  const getInitials = (name) => {
    if (!name) return "EM";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Welcome */}
      <section>
        <p className="text-sm font-medium text-blue-600">Employee Dashboard</p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Welcome back, {employee.name.split(" ")[0]} 👋
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Here's an overview of your work and attendance.
        </p>
      </section>

      {/* Today's Attendance */}
      <section className="overflow-hidden rounded-2xl bg-[#101C36] text-white shadow-sm">
        <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <Clock3 size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold">Today's Attendance</p>

                <p className="text-xs text-slate-400">
                  {isCheckedIn
                    ? "You are currently working"
                    : checkOutTime
                      ? "Attendance completed for today"
                      : "Mark your attendance for today"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-slate-400">Check In</p>

                <p className="mt-1 text-lg font-semibold">
                  {formatTime(checkInTime)}
                </p>
              </div>

              <div className="h-9 w-px bg-white/10" />

              <div>
                <p className="text-xs text-slate-400">Check Out</p>

                <p className="mt-1 text-lg font-semibold">
                  {formatTime(checkOutTime)}
                </p>
              </div>

              <div className="h-9 w-px bg-white/10" />

              <div>
                <p className="text-xs text-slate-400">Working Duration</p>

                <p className="mt-1 text-lg font-semibold tabular-nums">
                  {currentTime}
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium">
              {isCheckedIn ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Checked In
                </>
              ) : checkOutTime ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Completed
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Not Checked In
                </>
              )}
            </div>

            {!isCheckedIn && !checkOutTime && (
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Clock3 size={17} />
                Check In
              </button>
            )}

            {isCheckedIn && (
              <button
                type="button"
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <LogOut size={17} />
                Check Out
              </button>
            )}

            {checkOutTime && !isCheckedIn && (
              <div className="text-xs text-slate-400">
                Come back tomorrow to check in again.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Monthly Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Hours Worked"
          value={dashboardStats.totalHours}
          subtitle="This month"
          icon={Clock3}
        />

        <StatCard
          title="Leave Balance"
          value={`${leaveBalance.remaining} days`}
          subtitle="Available"
          icon={CalendarDays}
        />

        <StatCard
          title="Days Present"
          value={`${dashboardStats.presentDays} days`}
          subtitle="This month"
          icon={CalendarCheck}
        />

        <StatCard
          title="Attendance"
          value={dashboardStats.attendancePercentage}
          subtitle="This month"
          icon={CheckCircle2}
        />
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Recent Attendance */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Recent Attendance
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Your latest attendance records
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/employee-attendance")}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View All
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Working Hours</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Status</TableHead>
                </tr>
              </thead>

              <tbody>
                {recentAttendance.map((record) => (
                  <tr
                    key={record.id || record.date}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <TableCell>
                      <p className="font-medium text-slate-800">
                        {record.date}
                      </p>

                      <p className="text-xs text-slate-400">{record.day}</p>
                    </TableCell>

                    <TableCell>{record.checkIn}</TableCell>

                    <TableCell>{record.checkOut}</TableCell>

                    <TableCell>{record.hours}</TableCell>

                    <TableCell>{record.overtime}</TableCell>

                    <TableCell>
                      <StatusBadge status={record.status} />
                    </TableCell>
                  </tr>
                ))}

                {recentAttendance.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center text-sm text-slate-400"
                    >
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leave Balance */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-base font-semibold text-slate-900">
              Leave Balance
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">Your leave summary</p>
          </div>

          <div className="space-y-5 p-5">
            {leaveRows.map((leave) => (
              <LeaveRow
                key={leave.title}
                title={leave.title}
                used={leave.used}
                total={leave.total}
              />
            ))}

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Total Remaining</p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {leaveBalance.remaining}
                  </p>
                </div>

                <CalendarDays className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="mb-3">
          <h3 className="text-base font-semibold text-slate-900">
            Quick Actions
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            Quickly access commonly used features
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.title}
                type="button"
                onClick={() => navigate(action.path)}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <Icon size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {action.title}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {action.description}
                  </p>
                </div>

                <ArrowRight
                  size={16}
                  className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* Profile Summary */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
            {getInitials(employee.name)}
          </div>

          <div>
            <p className="font-semibold text-slate-900">{employee.name}</p>

            <p className="mt-0.5 text-xs text-slate-500">
              {employee.designation}
              {employee.designation && employee.department ? " • " : ""}
              {employee.department}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/employee-profile")}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <UserRound size={16} />
          View Profile
        </button>
      </section>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  subtitle,
  // eslint-disable-next-line no-unused-vars
  icon: Icon,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
};

const TableHead = ({ children }) => (
  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
    {children}
  </th>
);

const TableCell = ({ children }) => (
  <td className="px-5 py-4 text-sm text-slate-600">{children}</td>
);

const StatusBadge = ({ status }) => {
  const isLate = status === "Late";
  const isAbsent = status === "Absent";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isLate
          ? "bg-amber-50 text-amber-700"
          : isAbsent
            ? "bg-red-50 text-red-700"
            : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {isLate ? <CircleAlert size={13} /> : <CheckCircle2 size={13} />}

      {status}
    </span>
  );
};

const LeaveRow = ({ title, used, total }) => {
  const safeTotal = Number(total) || 0;
  const safeUsed = Number(used) || 0;

  const percentage =
    safeTotal > 0 ? Math.min((safeUsed / safeTotal) * 100, 100) : 0;

  const remaining = Math.max(safeTotal - safeUsed, 0);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">{title}</p>

        <p className="text-xs text-slate-500">
          {remaining} of {safeTotal} left
        </p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
};

export default EmployeeDashboardScreen;
