import { createTextPdf } from "../lib/simplePdf.js";
import Payslip from "../models/payslipmodal.js";
import { failure } from "../lib/response.js";

export const downloadPayslipPdf = async (req,res) => {
  const query=req.user.role==="hr"?{_id:req.params.id,hrId:req.user._id}:{_id:req.params.id,empId:req.user._id};
  const p=await Payslip.findOne(query).populate({path:"empId",select:"name empId jobTitle department",populate:{path:"department",select:"title"}}).lean();
  if(!p)return failure(res,404,"Payslip not found");
  const lines=[
    "HRMS PAYSLIP", "", `Employee: ${p.empId?.name||""}`, `Employee ID: ${p.empId?.empId||""}`, `Department: ${p.empId?.department?.title||""}`, `Designation: ${p.empId?.jobTitle||""}`, `Pay Month: ${p.month} ${p.year}`, "",
    "EARNINGS", `Basic Salary: ${p.baseSalary ?? p.basicSalary ?? 0}`, `HRA: ${p.hra ?? 0}`, `Other Allowances: ${p.otherAllowances ?? Number(p.conveyance ?? 0) + Number(p.specialAllowance ?? 0)}`, `Employer PF: ${p.employerPf ?? 0}`, `Gross Salary: ${p.grossSalary ?? p.totalEarnings ?? 0}`, "",
    "DEDUCTIONS", `Employee PF: ${p.employeePf ?? p.pf ?? 0}`, `TDS: ${p.tds ?? 0}`, `Professional Tax: ${p.professionalTax ?? 0}`, `Other Deductions: ${p.otherDeductions ?? 0}`, `Total Deductions: ${p.totalDeduction ?? 0}`, "", `NET PAY: ${p.netPay ?? p.netSalary ?? 0}`
  ];
  res.setHeader("Content-Type","application/pdf"); res.setHeader("Content-Disposition",`attachment; filename=payslip-${p.empId?.empId||p._id}-${p.month}-${p.year}.pdf`); return res.end(createTextPdf(lines));
};
