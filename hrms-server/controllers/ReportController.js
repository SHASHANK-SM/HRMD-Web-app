import User from "../models/user.js";
import Attendance from "../models/attendanceModal.js";
import Leave from "../models/leaveModal.js";
import Payslip from "../models/payslipmodal.js";
import { success } from "../lib/response.js";
import { getDateKey } from "../lib/attendanceUtils.js";

const csv = (rows) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
};
const dateRange = (q, field = "date") => { const x = {}; if (q.startDate) x.$gte = q.startDate; if (q.endDate) x.$lte = q.endDate; return Object.keys(x).length ? { [field]: x } : {}; };

export const employeeReport = async (req, res) => {
  const q = { head: req.user._id, role: { $ne: "hr" } };
  if (req.query.department) q.department = req.query.department;
  if (req.query.status) q.empStatus = req.query.status;
  if (req.query.search) q.$or = [{ name: { $regex: req.query.search, $options: "i" } }, { empId: { $regex: req.query.search, $options: "i" } }];
  const data = await User.find(q).select("name email empId department jobTitle joinDate empStatus").populate("department", "title").lean();
  return respondReport(req, res, data.map((e) => ({ employee: e.name, employeeId: e.empId, department: e.department?.title || "", designation: e.jobTitle || "", joiningDate: e.joinDate || "", status: e.empStatus })));
};

export const attendanceReport = async (req, res) => {
  const month = Number(req.query.month);
  const year = Number(req.query.year);
  const employees = await User.find({
    head: req.user._id,
    role: { $ne: "hr" },
    empStatus: "active",
  })
    .select("_id name empId department")
    .populate("department", "title")
    .lean();

  if (!month || !year) {
    const q = { user: { $in: employees.map((e) => e._id) }, ...dateRange(req.query) };
    if (req.query.status) q.status = req.query.status;
    const records = await Attendance.find(q).sort({ date: -1 }).lean();
    const map = new Map(employees.map((e) => [String(e._id), e]));
    return respondReport(req, res, records.map((r) => { const e = map.get(String(r.user)); return { date: r.date, employee: e?.name, employeeId: e?.empId, department: e?.department?.title || "", status: r.status, checkIn: r.checkIn, checkOut: r.checkOut, workingHours: r.totalHours, overtime: r.extraHours }; }));
  }

  const selectedEmployees = req.query.department
    ? employees.filter((employee) =>
        [String(employee.department?._id || ""), employee.department?.title]
          .filter(Boolean)
          .includes(req.query.department),
      )
    : employees;
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const today = getDateKey();
  const lastDate = `${prefix}-${String(new Date(year, month, 0).getDate()).padStart(2, "0")}`;
  const endDate = prefix > today.slice(0, 7) ? "" : Math.min(lastDate, today);
  const workingDays = endDate
    ? Array.from({ length: Number(endDate.slice(-2)) }, (_, index) =>
        new Date(year, month - 1, index + 1),
      ).filter((date) => date.getDay() !== 0 && date.getDay() !== 6).length
    : 0;
  const records = await Attendance.find({
    user: { $in: selectedEmployees.map((employee) => employee._id) },
    date: { $regex: `^${prefix}` },
  }).lean();
  const recordsByEmployee = records.reduce((map, record) => {
    const id = String(record.user);
    map.set(id, [...(map.get(id) || []), record]);
    return map;
  }, new Map());
  const data = selectedEmployees.map((employee) => {
    const employeeRecords = recordsByEmployee.get(String(employee._id)) || [];
    const present = employeeRecords.filter((record) => ["present", "late"].includes(record.status)).length;
    const late = employeeRecords.filter((record) => record.status === "late").length;
    const absent = Math.max(0, workingDays - present);
    const latest = [...employeeRecords].sort((a, b) => b.date.localeCompare(a.date))[0];
    return {
      employee: employee.name,
      employeeId: employee.empId,
      department: employee.department?.title || "",
      present,
      absent,
      late,
      percentage: workingDays ? `${((present / workingDays) * 100).toFixed(1)}%` : "0.0%",
      status: latest?.status || "absent",
    };
  });
  const totalPresent = data.reduce((sum, row) => sum + row.present, 0);
  const totalAbsent = data.reduce((sum, row) => sum + row.absent, 0);
  return respondReport(req, res, data, {
    summary: {
      totalEmployees: data.length,
      totalPresent,
      totalAbsent,
      averageAttendance: workingDays && data.length
        ? Number(((totalPresent / (workingDays * data.length)) * 100).toFixed(1))
        : 0,
    },
  });
};

export const leaveReport = async (req, res) => {
  const q = { hrId: req.user._id, ...dateRange(req.query, "startDate") }; if (req.query.status) q.status = req.query.status; if (req.query.leaveType) q.leaveType = req.query.leaveType;
  const data = await Leave.find(q).populate("user", "name empId").sort({ startDate: -1 }).lean();
  return respondReport(req, res, data.map((l) => ({ employee: l.user?.name, employeeId: l.user?.empId, leaveType: l.leaveType, startDate: l.startDate, endDate: l.endDate, days: l.numberOfDays, status: l.status })));
};

export const payrollReport = async (req, res) => {
  const q = { hrId: req.user._id }; if (req.query.month) q.month = String(req.query.month).toLowerCase(); if (req.query.year) q.year = Number(req.query.year);
  const data = await Payslip.find(q).populate({ path: "empId", select: "name empId department", populate: { path: "department", select: "title" } }).sort({ year: -1 }).lean();
  return respondReport(req, res, data.map((p) => ({ employee: p.empId?.name, employeeId: p.empId?.empId, department: p.empId?.department?.title || "", month: p.month, year: p.year, monthlyCtc: p.monthlyCtc ?? p.totalEarnings ?? p.grossSalary ?? 0, annualCtc: p.annualCtc ?? (p.monthlyCtc ?? p.totalEarnings ?? p.grossSalary ?? 0) * 12, basicSalary: p.basicSalary ?? p.baseSalary ?? 0, employerPf: p.employerPf ?? 0, otherAllowances: p.otherAllowances ?? Math.max(0, (p.grossSalary ?? p.totalEarnings ?? 0) - (p.basicSalary ?? p.baseSalary ?? 0)), grossSalary: p.grossSalary ?? p.totalEarnings ?? 0, employeePf: p.employeePf ?? p.pf ?? 0, professionalTax: p.professionalTax ?? 0, netPay: p.netPay ?? p.netSalary ?? 0, deductions: p.totalDeduction, netSalary: p.netSalary, status: p.status })));
};

export const overtimeReport = async (req, res) => { const result = await attendanceReportData(req); return respondReport(req, res, result.map((r) => ({ date: r.date, employee: r.employee, employeeId: r.employeeId, overtime: r.overtime }))); };
export const absenceLateReport = async (req, res) => { const result = await attendanceReportData(req); return respondReport(req, res, result.filter((r) => ["absent", "late"].includes(r.status))); };

async function attendanceReportData(req) {
  const employees = await User.find({ head: req.user._id, role: { $ne: "hr" } }).select("_id name empId department").populate("department", "title").lean();
  const records = await Attendance.find({ user: { $in: employees.map((e) => e._id) }, ...dateRange(req.query) }).lean(); const map = new Map(employees.map((e) => [String(e._id), e]));
  return records.map((r) => ({ date: r.date, employee: map.get(String(r.user))?.name, employeeId: map.get(String(r.user))?.empId, department: map.get(String(r.user))?.department?.title || "", status: r.status, overtime: r.extraHours || 0, workingHours: r.totalHours || 0 }));
}

async function respondReport(req, res, rows, meta = {}) {
  if (String(req.query.export).toLowerCase() === "csv") {
    res.setHeader("Content-Type", "text/csv; charset=utf-8"); res.setHeader("Content-Disposition", `attachment; filename=${req.path.split("/").pop()}-${Date.now()}.csv`); return res.send(csv(rows));
  }
  return success(res, { data: rows, meta: { total: rows.length, ...meta } });
}
