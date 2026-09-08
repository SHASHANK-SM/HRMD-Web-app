import User from "../models/user.js";
import Attendance from "../models/attendanceModal.js";
import Leave from "../models/leaveModal.js";
import Payslip from "../models/payslipmodal.js";
import { getDateKey, getLocalDate } from "../lib/attendanceUtils.js";
import { success } from "../lib/response.js";

export const hrDashboard = async (req, res) => {
  const hrId = req.user._id;
  const today = getDateKey();
  const now = getLocalDate();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const employees = await User.find({ head: hrId, role: { $ne: "hr" } })
    .select("_id name email empId jobTitle department empStatus joinDate")
    .populate("department", "title")
    .sort({ createdAt: -1 })
    .lean();
  const ids = employees.map((e) => e._id);
  const [present, onLeave, pendingLeaves, payroll, attendanceToday] =
    await Promise.all([
      Attendance.countDocuments({
        user: { $in: ids },
        date: today,
        checkIn: { $ne: null },
      }),
      Leave.countDocuments({
        user: { $in: ids },
        status: "Approved",
        startDate: { $lte: today },
        endDate: { $gte: today },
      }),
      Leave.countDocuments({ hrId, status: "Pending" }),
      Payslip.find({
        hrId,
        month: { $exists: true },
        year: now.getFullYear(),
      }).lean(),
      Attendance.find({ user: { $in: ids }, date: today }).lean(),
    ]);
  const totalPayroll = payroll.reduce(
    (s, p) => s + Number(p.netSalary ?? p.totalEarnings ?? 0),
    0,
  );
  const processedPayroll = payroll.filter((p) =>
    ["processed", "approved"].includes(p.status),
  );
  const newEmployees = employees.filter((e) =>
    e.joinDate?.startsWith?.(monthPrefix),
  ).length;
  const lateEmployees = attendanceToday.filter(
    (a) => a.status === "late",
  ).length;
  const active = employees.filter((e) => e.empStatus === "active").length;
  return success(res, {
    data: {
      metrics: {
        totalEmployees: employees.length,
        activeEmployees: active,
        newEmployees,
        presentToday: present,
        absentToday: Math.max(0, active - present - onLeave),
        lateEmployees,
        onLeaveToday: onLeave,
        pendingLeaveApprovals: pendingLeaves,
        totalPayroll,
        pendingPayroll: payroll.filter((p) => p.status === "pending").length,
        processedPayroll: processedPayroll.length,
        employeesPaid: new Set(processedPayroll.map((p) => String(p.empId)))
          .size,
      },
      recentEmployees: employees.slice(0, 10),
      recentLeaveRequests: await Leave.find({ hrId })
        .populate("user", "name empId")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    },
  });
};

export const employeeDashboard = async (req, res) => {
  const now = getLocalDate();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [employee, today, attendance, leaves] = await Promise.all([
    User.findById(req.user._id)
      .select(
        "name email mobile empId role jobTitle department joinDate employmentType profilePic empStatus",
      )
      .populate("department", "title")
      .lean(),
    Attendance.findOne({ user: req.user._id, date: getDateKey() }).lean(),
    Attendance.find({
      user: req.user._id,
      date: { $regex: `^${monthPrefix}` },
    }).lean(),
    Leave.find({ user: req.user._id }).sort({ startDate: -1 }).limit(10).lean(),
  ]);
  const monthHours = attendance.reduce(
    (s, a) => s + Number(a.totalHours || 0),
    0,
  );
  const daysPresent = attendance.filter((a) => a.checkIn).length;
  return success(res, {
    data: {
      employee,
      todayAttendance: today,
      statistics: {
        hoursWorkedThisMonth: Number(monthHours.toFixed(2)),
        daysPresent,
        attendancePercentage: daysPresent
          ? Number(
              (
                (daysPresent /
                  new Date(
                    now.getFullYear(),
                    now.getMonth() + 1,
                    0,
                  ).getDate()) *
                100
              ).toFixed(2),
            )
          : 0,
      },
      recentAttendance: attendance
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 10),
      leaveHistory: leaves,
    },
  });
};
