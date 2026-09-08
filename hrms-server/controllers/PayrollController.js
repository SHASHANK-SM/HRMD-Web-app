import Payslip from "../models/payslipmodal.js";
import User from "../models/user.js";
import Attendance from "../models/attendanceModal.js";
import Notification from "../models/NotificationModal.js";
import { success, failure } from "../lib/response.js";

const money = (v) => Math.round((Number(v) || 0) * 100) / 100;
const monthNumber = (month) => { const n = Number(month); if (Number.isInteger(n) && n >= 1 && n <= 12) return n; const d = new Date(`${month} 1, 2000`); return Number.isNaN(d.getTime()) ? null : d.getMonth() + 1; };

export const calculate = (body) => {
  const baseSalary = money(body.baseSalary), hra = money(body.hra), conveyance = money(body.conveyance), specialAllowance = money(body.specialAllowance);
  const bonus = money(body.bonus ?? body.advanceStatuoryBonus), overtime = money(body.overtime);
  const professionalTax = money(body.professionalTax), pf = money(body.pf), tds = money(body.tds), otherDeductions = money(body.otherDeductions);
  const grossSalary = money(baseSalary + hra + conveyance + specialAllowance + bonus + overtime);
  const totalDeduction = money(professionalTax + pf + tds + otherDeductions);
  return { baseSalary, hra, conveyance, specialAllowance, bonus, overtime, advanceStatuoryBonus: money(body.advanceStatuoryBonus), professionalTax, pf, tds, otherDeductions, totalEarnings: grossSalary, grossSalary, totalDeduction, netSalary: money(grossSalary - totalDeduction) };
};

const ensureHrEmployee = async (hrId, empId) => User.findOne({ _id: empId, head: hrId, role: { $ne: "hr" } });

export const createPayroll = async (req, res) => {
  const { empId, month, year = new Date().getFullYear(), calendarDays = 0, paidDays = 0, lossDays = 0 } = req.body;
  if (!empId || !month) return failure(res, 400, "empId and month are required");
  const m = monthNumber(month); if (!m) return failure(res, 400, "Invalid month");
  const employee = await ensureHrEmployee(req.user._id, empId); if (!employee) return failure(res, 404, "Employee not found");
  const values = calculate(req.body);
  const existing = await Payslip.findOne({ empId, month: String(month).toLowerCase(), year: Number(year) });
  if (existing) return failure(res, 409, "Payroll already exists for this employee and month");
  const payslip = await Payslip.create({ ...values, empId, month: String(month).toLowerCase(), year: Number(year), calendarDays, paidDays, lossDays, status: "processed", hrId: req.user._id });
  await Notification.create({ recipient: empId, type: "payslip-generated", title: "Payslip generated", message: `Your payslip for ${month} ${year} is available`, data: { payslipId: payslip._id } });
  return success(res, { status: 201, message: "Payroll processed successfully", data: payslip });
};

export const listPayroll = async (req, res) => {
  const query = { hrId: req.user._id };
  if (req.query.month) query.month = String(req.query.month).toLowerCase();
  if (req.query.year) query.year = Number(req.query.year);
  if (req.query.status) query.status = req.query.status;
  if (req.query.employeeId) query.empId = req.query.employeeId;
  const data = await Payslip.find(query).populate({ path: "empId", select: "name email empId department jobTitle", populate: { path: "department", select: "title" } }).sort({ year: -1, createdAt: -1 }).lean();
  return success(res, { data });
};

export const getPayroll = async (req, res) => {
  const employee = await User.findById(req.user._id).select("_id");
  const query = { empId: employee._id };
  if (req.query.month) query.month = String(req.query.month).toLowerCase();
  if (req.query.year) query.year = Number(req.query.year);
  const data = await Payslip.find(query).sort({ year: -1, createdAt: -1 }).lean();
  return success(res, { data });
};

export const getPayslip = async (req, res) => {
  const query = req.user.role === "hr" ? { _id: req.params.id, hrId: req.user._id } : { _id: req.params.id, empId: req.user._id };
  const data = await Payslip.findOne(query).populate("empId", "name email empId department jobTitle").populate({ path: "empId", populate: { path: "department", select: "title" } }).lean();
  if (!data) return failure(res, 404, "Payslip not found");
  return success(res, { data });
};

export const autoOvertimeForMonth = async (empId, year, month) => {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const rows = await Attendance.find({ user: empId, date: { $regex: `^${prefix}` } }).lean();
  return money(rows.reduce((sum, row) => sum + Number(row.extraHours || 0), 0));
};
