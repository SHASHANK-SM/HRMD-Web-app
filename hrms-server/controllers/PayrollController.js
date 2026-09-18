import Payslip from "../models/payslipmodal.js";
import User from "../models/user.js";
import Attendance from "../models/attendanceModal.js";
import Notification from "../models/NotificationModal.js";
import { success, failure } from "../lib/response.js";

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const readMoney = (value) => {
  if (value === undefined || value === null || value === "") {
    return { present: false, value: null };
  }
  const number = typeof value === "number" ? value : Number(String(value).trim().replace(/,/g, ""));
  return { present: true, value: Number.isFinite(number) ? roundMoney(number) : null };
};
const optionalMoney = (value, fallback = 0) => {
  const result = readMoney(value);
  if (!result.present) return fallback;
  if (result.value === null) throw new Error("Invalid salary value");
  if (result.value < 0) throw new Error("Salary values cannot be negative");
  return result.value;
};
const requiredMoney = (value, field) => {
  const result = readMoney(value);
  if (!result.present || result.value === null) throw new Error(`${field} is required and must be a valid number`);
  if (result.value < 0) throw new Error(`${field} cannot be negative`);
  return result.value;
};
const monthNumber = (month) => { const n = Number(month); if (Number.isInteger(n) && n >= 1 && n <= 12) return n; const d = new Date(`${month} 1, 2000`); return Number.isNaN(d.getTime()) ? null : d.getMonth() + 1; };

export const calculate = (body) => {
  const baseSalary = requiredMoney(body.baseSalary, "Basic salary");
  const hra = optionalMoney(body.hra);
  const conveyance = optionalMoney(body.conveyance);
  const specialAllowance = optionalMoney(body.specialAllowance);
  const bonus = optionalMoney(body.bonus ?? body.advanceStatuoryBonus);
  const overtime = optionalMoney(body.overtime);
  const professionalTax = optionalMoney(body.professionalTax ?? body.professionTax);
  const employerPf = optionalMoney(body.employerPf ?? body.employerPF);
  const employeePf = optionalMoney(body.employeePf ?? body.employeePF ?? body.pf);
  const tds = optionalMoney(body.tds);
  const otherDeductions = optionalMoney(body.otherDeductions);

  const annualInput = readMoney(body.annualCtc ?? body.annualCTC);
  const monthlyInput = readMoney(body.monthlyCtc ?? body.monthlyCTC);

  if (annualInput.present && annualInput.value === null) {
    throw new Error("Annual CTC must be a valid number");
  }
  if (monthlyInput.present && monthlyInput.value === null) {
    throw new Error("Monthly CTC must be a valid number");
  }
  if (annualInput.present && annualInput.value < 0) {
    throw new Error("Annual CTC cannot be negative");
  }
  if (monthlyInput.present && monthlyInput.value < 0) {
    throw new Error("Monthly CTC cannot be negative");
  }
  if (
    annualInput.present &&
    monthlyInput.present &&
    Math.abs(annualInput.value - roundMoney(monthlyInput.value * 12)) > 0.1
  ) {
    throw new Error("Annual CTC and monthly CTC do not match");
  }

  let annualCtc;
  let monthlyCtc;
  if (annualInput.present) {
    annualCtc = annualInput.value;
    monthlyCtc = roundMoney(annualCtc / 12);
  } else if (monthlyInput.present) {
    monthlyCtc = monthlyInput.value;
    annualCtc = roundMoney(monthlyCtc * 12);
  } else {
    monthlyCtc = 0;
    annualCtc = 0;
  }

  const grossSalary = roundMoney(
    baseSalary + hra + conveyance + specialAllowance + bonus + overtime,
  );
  const totalDeduction = roundMoney(
    employeePf + professionalTax + tds + otherDeductions,
  );
  const netSalary = roundMoney(Math.max(0, grossSalary - totalDeduction));

  return {
    baseSalary,
    monthlyCtc,
    annualCtc,
    basicSalary: baseSalary,
    employerPf,
    otherAllowances: roundMoney(
      hra + conveyance + specialAllowance + bonus + overtime,
    ),
    employeePf,
    professionalTax,
    netPay: netSalary,
    hra,
    conveyance,
    specialAllowance,
    bonus,
    overtime,
    advanceStatuoryBonus: optionalMoney(body.advanceStatuoryBonus),
    pf: employeePf,
    tds,
    otherDeductions,
    totalEarnings: grossSalary,
    grossSalary,
    totalDeduction,
    netSalary,
  };
};

const ensureHrEmployee = async (hrId, empId) => User.findOne({ _id: empId, head: hrId, role: { $ne: "hr" } });

export const createPayroll = async (req, res) => {
  const { empId, month, year = new Date().getFullYear(), calendarDays = 0, paidDays = 0, lossDays = 0 } = req.body;
  if (!empId || !month) return failure(res, 400, "empId and month are required");
  const m = monthNumber(month); if (!m) return failure(res, 400, "Invalid month");
  const employee = await ensureHrEmployee(req.user._id, empId); if (!employee) return failure(res, 404, "Employee not found");
  let values;
  try {
    values = calculate(req.body);
  } catch (error) {
    return failure(res, 400, error.message || "Invalid payroll values");
  }
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

export const deletePayroll = async (req, res) => {
  const payroll = await Payslip.findOneAndDelete({
    _id: req.params.id,
    hrId: req.user._id,
  });
  if (!payroll) return failure(res, 404, "Payroll not found");
  return success(res, { message: "Payroll deleted successfully" });
};

export const getPayroll = async (req, res) => {
  const employee = await User.findById(req.user._id).select("_id name email empId department jobTitle");
  const query = { empId: employee._id };
  if (req.query.month) query.month = String(req.query.month).toLowerCase();
  if (req.query.year) query.year = Number(req.query.year);
  if (req.query.search?.trim()) {
    const search = req.query.search.trim();
    query.$or = [
      { month: { $regex: search, $options: "i" } },
    ];
  }
  const payslips = await Payslip.find(query).sort({ year: -1, createdAt: -1 }).lean();
  return success(res, { data: { employee, payslips } });
};

export const getPayslip = async (req, res) => {
  const query = req.user.role === "hr" ? { _id: req.params.id, hrId: req.user._id } : { _id: req.params.id, empId: req.user._id };
  const data = await Payslip.findOne(query).populate("empId", "name email empId department jobTitle").populate({ path: "empId", populate: { path: "department", select: "title" } }).lean();
  if (!data) return failure(res, 404, "Payslip not found");

  const emp = data.empId || {};
  const payslip = {
    ...data,
    employee: emp.name || "-",
    employeeId: emp.empId || "-",
    department: emp.department?.title || emp.department || "-",
    designation: emp.jobTitle || "-",
    email: emp.email || "",
  };

  return success(res, { data: payslip });
};

export const autoOvertimeForMonth = async (empId, year, month) => {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const rows = await Attendance.find({ user: empId, date: { $regex: `^${prefix}` } }).lean();
  return roundMoney(rows.reduce((sum, row) => sum + Number(row.extraHours || 0), 0));
};
