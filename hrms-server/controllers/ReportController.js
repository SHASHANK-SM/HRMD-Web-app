import User from "../models/user.js";
import Attendance from "../models/attendanceModal.js";
import Leave from "../models/leaveModal.js";
import Payslip from "../models/payslipmodal.js";
import { success } from "../lib/response.js";

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
  const employees = await User.find({ head: req.user._id, role: { $ne: "hr" } }).select("_id name empId department").populate("department", "title").lean();
  const q = { user: { $in: employees.map((e) => e._id) }, ...dateRange(req.query) };
  if (req.query.status) q.status = req.query.status;
  const records = await Attendance.find(q).sort({ date: -1 }).lean();
  const map = new Map(employees.map((e) => [String(e._id), e]));
  return respondReport(req, res, records.map((r) => { const e = map.get(String(r.user)); return { date: r.date, employee: e?.name, employeeId: e?.empId, department: e?.department?.title || "", status: r.status, checkIn: r.checkIn, checkOut: r.checkOut, workingHours: r.totalHours, overtime: r.extraHours }; }));
};

export const leaveReport = async (req, res) => {
  const q = { hrId: req.user._id, ...dateRange(req.query, "startDate") }; if (req.query.status) q.status = req.query.status; if (req.query.leaveType) q.leaveType = req.query.leaveType;
  const data = await Leave.find(q).populate("user", "name empId").sort({ startDate: -1 }).lean();
  return respondReport(req, res, data.map((l) => ({ employee: l.user?.name, employeeId: l.user?.empId, leaveType: l.leaveType, startDate: l.startDate, endDate: l.endDate, days: l.numberOfDays, status: l.status })));
};

export const payrollReport = async (req, res) => {
  const q = { hrId: req.user._id }; if (req.query.month) q.month = String(req.query.month).toLowerCase(); if (req.query.year) q.year = Number(req.query.year);
  const data = await Payslip.find(q).populate({ path: "empId", select: "name empId department", populate: { path: "department", select: "title" } }).sort({ year: -1 }).lean();
  return respondReport(req, res, data.map((p) => ({ employee: p.empId?.name, employeeId: p.empId?.empId, department: p.empId?.department?.title || "", month: p.month, year: p.year, basicSalary: p.baseSalary, grossSalary: p.grossSalary ?? p.totalEarnings, deductions: p.totalDeduction, netSalary: p.netSalary, status: p.status })));
};

export const overtimeReport = async (req, res) => { const result = await attendanceReportData(req); return respondReport(req, res, result.map((r) => ({ date: r.date, employee: r.employee, employeeId: r.employeeId, overtime: r.overtime }))); };
export const absenceLateReport = async (req, res) => { const result = await attendanceReportData(req); return respondReport(req, res, result.filter((r) => ["absent", "late"].includes(r.status))); };

async function attendanceReportData(req) {
  const employees = await User.find({ head: req.user._id, role: { $ne: "hr" } }).select("_id name empId department").populate("department", "title").lean();
  const records = await Attendance.find({ user: { $in: employees.map((e) => e._id) }, ...dateRange(req.query) }).lean(); const map = new Map(employees.map((e) => [String(e._id), e]));
  return records.map((r) => ({ date: r.date, employee: map.get(String(r.user))?.name, employeeId: map.get(String(r.user))?.empId, department: map.get(String(r.user))?.department?.title || "", status: r.status, overtime: r.extraHours || 0, workingHours: r.totalHours || 0 }));
}

async function respondReport(req, res, rows) {
  if (String(req.query.export).toLowerCase() === "csv") {
    res.setHeader("Content-Type", "text/csv; charset=utf-8"); res.setHeader("Content-Disposition", `attachment; filename=${req.path.split("/").pop()}-${Date.now()}.csv`); return res.send(csv(rows));
  }
  return success(res, { data: rows, meta: { total: rows.length } });
}
