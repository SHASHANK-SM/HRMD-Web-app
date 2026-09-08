import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  CalendarCheck,
  Clock3,
  LogIn,
  LogOut,
  CheckCircle2,
  CircleAlert,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { API } from "../../../Core/url";

const EmployeeAttendanceScreen = () => {
  const { token } = useSelector((state) => state.auth);

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonthDate, setSelectedMonthDate] = useState(new Date());
  const [monthlySummary, setMonthlySummary] = useState({
    workingDays: 0,
    present: 0,
    absent: 0,
    late: 0,
    totalHours: "0h 0m",
    overtime: "0h 0m",
    attendancePercentage: "0%",
  });

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const formatHours = (value) => {
    const numericValue = Number(value || 0);
    const wholeHours = Math.floor(numericValue);
    const minutes = Math.round((numericValue - wholeHours) * 60);
    const safeMinutes = minutes === 60 ? 0 : minutes;
    const adjustedHours = minutes === 60 ? wholeHours + 1 : wholeHours;

    return `${adjustedHours}h ${safeMinutes}m`;
  };

  const normalizeStatus = (status) => {
    if (!status) return "Absent";

    const normalized = String(status).toLowerCase();

    if (normalized === "present") return "Present";
    if (normalized === "late") return "Late";
    if (normalized === "absent") return "Absent";

    return "Present";
  };

  const formatDateKey = (value) => {
    if (!value) return "--";

    const date = new Date(
      String(value).includes("T") ? value : `${value}T00:00:00`,
    );

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTimeValue = (value) => {
    if (!value) return "--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "--";

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSelectedMonthLabel = () =>
    selectedMonthDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

  const getMonthParams = () => ({
    year: selectedMonthDate.getFullYear(),
    month: selectedMonthDate.getMonth() + 1,
  });

  const fetchTodayAttendance = async () => {
    if (!token) return;

    try {
      const response = await API.get("/attendance/today", getAuthConfig());
      const attendance = response?.data?.data || null;

      if (!attendance || (!attendance.checkIn && !attendance.checkInTime)) {
        setCheckInTime(null);
        setCheckOutTime(null);
        setIsCheckedIn(false);
        setElapsedSeconds(0);
        return;
      }

      const checkIn = attendance.checkIn || attendance.checkInTime;
      const checkOut = attendance.checkOut || attendance.checkOutTime;
      const parsedCheckIn = checkIn ? new Date(checkIn) : null;
      const parsedCheckOut = checkOut ? new Date(checkOut) : null;

      setCheckInTime(parsedCheckIn);
      setCheckOutTime(parsedCheckOut);
      setIsCheckedIn(Boolean(parsedCheckIn) && !parsedCheckOut);

      if (parsedCheckIn && !parsedCheckOut) {
        setElapsedSeconds(
          Math.max(
            0,
            Math.floor((Date.now() - parsedCheckIn.getTime()) / 1000),
          ),
        );
      } else if (parsedCheckIn && parsedCheckOut) {
        setElapsedSeconds(
          Math.max(
            0,
            Math.floor(
              (parsedCheckOut.getTime() - parsedCheckIn.getTime()) / 1000,
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

  const fetchMonthlySummary = async () => {
    if (!token) return;

    try {
      const params = getMonthParams();
      const response = await API.get("/attendance/monthly-summary", {
        ...getAuthConfig(),
        params,
      });

      const summary = response?.data?.data || {};

      setMonthlySummary({
        workingDays: Number(summary.workingDays || 0),
        present: Number(summary.present || summary.daysPresent || 0),
        absent: Number(summary.absent || 0),
        late: Number(summary.late || summary.lateDays || 0),
        totalHours: summary.totalHours
          ? formatHours(Number(summary.totalHours))
          : "0h 0m",
        overtime: summary.overtime
          ? formatHours(Number(summary.overtime))
          : "0h 0m",
        attendancePercentage: summary.attendancePercentage || "0%",
      });
    } catch (error) {
      console.error("Failed to fetch monthly summary:", error);
    }
  };

  const fetchHistory = async () => {
    if (!token) return;

    try {
      const params = getMonthParams();
      const response = await API.get("/attendance/history", {
        ...getAuthConfig(),
        params: {
          page: 1,
          limit: 50,
          month: `${params.year}-${String(params.month).padStart(2, "0")}`,
        },
      });

      const records = response?.data?.data || [];

      setAttendanceData(
        records.map((record) => ({
          date: formatDateKey(record.date),
          day: record.date
            ? new Date(`${record.date}T00:00:00`).toLocaleDateString("en-IN", {
                weekday: "long",
              })
            : "--",
          checkIn: formatTimeValue(record.checkIn || record.checkInTime),
          checkOut: formatTimeValue(record.checkOut || record.checkOutTime),
          workingHours: record.totalHours
            ? formatHours(Number(record.totalHours))
            : "0h 0m",
          overtime: record.extraHours
            ? formatHours(Number(record.extraHours))
            : "0h 0m",
          status: normalizeStatus(record.status),
        })),
      );
    } catch (error) {
      console.error("Failed to fetch attendance history:", error);
      setAttendanceData([]);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchTodayAttendance();
    fetchMonthlySummary();
    fetchHistory();
  }, [token, selectedMonthDate]);

  useEffect(() => {
    if (!isCheckedIn || !checkInTime) return;

    const updateTimer = () => {
      const seconds = Math.floor((Date.now() - checkInTime.getTime()) / 1000);

      setElapsedSeconds(Math.max(seconds, 0));
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

  const workingDuration = useMemo(() => {
    if (isCheckedIn) {
      return formatDuration(elapsedSeconds);
    }

    if (checkInTime && checkOutTime) {
      const seconds = Math.floor(
        (checkOutTime.getTime() - checkInTime.getTime()) / 1000,
      );

      return formatDuration(seconds);
    }

    return "0h 0m 0s";
  }, [isCheckedIn, elapsedSeconds, checkInTime, checkOutTime]);

  const formatTime = (date) => {
    if (!date) return "--";

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCheckIn = async () => {
    if (!token || loading) return;

    try {
      setLoading(true);
      await API.post("/attendance/check-in", {}, getAuthConfig());
      await fetchTodayAttendance();
      await fetchMonthlySummary();
      await fetchHistory();
    } catch (error) {
      console.error("Failed to check in:", error);
      alert(error?.response?.data?.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!token || loading) return;

    try {
      setLoading(true);
      await API.post("/attendance/check-out", {}, getAuthConfig());
      await fetchTodayAttendance();
      await fetchMonthlySummary();
      await fetchHistory();
    } catch (error) {
      console.error("Failed to check out:", error);
      alert(error?.response?.data?.message || "Check-out failed");
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (direction) => {
    setSelectedMonthDate((current) => {
      const nextDate = new Date(current);
      nextDate.setMonth(current.getMonth() + (direction === "next" ? 1 : -1));
      return nextDate;
    });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <section>
        <p className="text-sm font-medium text-blue-600">Attendance</p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          My Attendance
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Track your daily attendance, working hours and overtime.
        </p>
      </section>

      {/* Today's Attendance */}
      <section className="overflow-hidden rounded-2xl bg-[#101C36] text-white shadow-sm">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Left */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <CalendarCheck size={21} />
                </div>

                <div>
                  <p className="text-base font-semibold">Today's Attendance</p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {isCheckedIn
                      ? "You are currently working"
                      : checkOutTime
                        ? "Your attendance is completed"
                        : "Mark your attendance for today"}
                  </p>
                </div>
              </div>

              {/* Attendance Details */}
              <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3">
                <AttendanceInfo
                  label="Check In"
                  value={formatTime(checkInTime)}
                />

                <AttendanceInfo
                  label="Check Out"
                  value={formatTime(checkOutTime)}
                />

                <AttendanceInfo
                  label="Working Duration"
                  value={workingDuration}
                />
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col items-start gap-3 lg:items-end">
              {/* Status */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium">
                {isCheckedIn ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Currently Working
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

              {/* Buttons */}
              {!isCheckedIn && !checkOutTime && (
                <button
                  type="button"
                  onClick={handleCheckIn}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold transition hover:bg-blue-700 sm:w-auto"
                >
                  <LogIn size={17} />
                  Check In
                </button>
              )}

              {isCheckedIn && (
                <button
                  type="button"
                  onClick={handleCheckOut}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-6 text-sm font-semibold transition hover:bg-red-600 sm:w-auto"
                >
                  <LogOut size={17} />
                  Check Out
                </button>
              )}

              {checkOutTime && !isCheckedIn && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 size={14} />
                  Attendance completed for today
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Summary */}
      <section>
        <div className="mb-3">
          <h3 className="text-base font-semibold text-slate-900">
            Monthly Summary
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            Attendance overview for {getSelectedMonthLabel()}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Working Days"
            value={monthlySummary.workingDays}
            subtitle="Total working days"
            icon={CalendarCheck}
          />

          <SummaryCard
            title="Present Days"
            value={monthlySummary.present}
            subtitle="Days present"
            icon={CheckCircle2}
          />

          <SummaryCard
            title="Absent Days"
            value={monthlySummary.absent}
            subtitle="Days absent"
            icon={XCircle}
          />

          <SummaryCard
            title="Late Days"
            value={monthlySummary.late}
            subtitle="Late check-ins"
            icon={CircleAlert}
          />
        </div>
      </section>

      {/* Hours Summary */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InfoCard
          title="Total Working Hours"
          value={monthlySummary.totalHours}
          icon={Clock3}
        />

        <InfoCard
          title="Total Overtime"
          value={monthlySummary.overtime}
          icon={Clock3}
        />

        <InfoCard
          title="Attendance Percentage"
          value={monthlySummary.attendancePercentage}
          icon={CalendarCheck}
        />
      </section>

      {/* Attendance History */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Attendance History
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              View your attendance records
            </p>
          </div>

          {/* Month Selector */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => changeMonth("previous")}
              className="flex h-9 w-9 items-center justify-center text-slate-500 hover:bg-slate-50"
              aria-label="Previous month"
            >
              <ChevronLeft size={17} />
            </button>

            <div className="min-w-[125px] border-x border-slate-200 px-3 text-center text-sm font-medium text-slate-700">
              {getSelectedMonthLabel()}
            </div>

            <button
              type="button"
              onClick={() => changeMonth("next")}
              className="flex h-9 w-9 items-center justify-center text-slate-500 hover:bg-slate-50"
              aria-label="Next month"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
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
              {attendanceData.map((record) => (
                <tr
                  key={record.date}
                  className="border-b border-slate-100 last:border-0"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-800">
                        {record.date}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {record.day}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>{record.checkIn}</TableCell>

                  <TableCell>{record.checkOut}</TableCell>

                  <TableCell>{record.workingHours}</TableCell>

                  <TableCell>{record.overtime}</TableCell>

                  <TableCell>
                    <StatusBadge status={record.status} />
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-700">
              {attendanceData.length ? 1 : 0}–{attendanceData.length || 0}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-700">
              {attendanceData.length || 0}
            </span>{" "}
            attendance records
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400"
              disabled
            >
              <ChevronLeft size={15} />
            </button>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-medium text-white"
            >
              1
            </button>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              2
            </button>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              3
            </button>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ---------------- Components ---------------- */

const AttendanceInfo = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>

      <p className="mt-1 text-base font-semibold tabular-nums">{value}</p>
    </div>
  );
};

const SummaryCard = ({
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

// eslint-disable-next-line no-unused-vars
const InfoCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={20} />
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500">{title}</p>

        <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
};

const TableHead = ({ children }) => {
  return (
    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
};

const TableCell = ({ children }) => {
  return <td className="px-5 py-4 text-sm text-slate-600">{children}</td>;
};

const StatusBadge = ({ status }) => {
  const styles = {
    Present: "bg-emerald-50 text-emerald-700",
    Late: "bg-amber-50 text-amber-700",
    Absent: "bg-red-50 text-red-700",
  };

  const icons = {
    Present: CheckCircle2,
    Late: CircleAlert,
    Absent: XCircle,
  };

  const Icon = icons[status] || CircleAlert;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] || "bg-slate-50 text-slate-600"
      }`}
    >
      <Icon size={13} />
      {status}
    </span>
  );
};

export default EmployeeAttendanceScreen;
