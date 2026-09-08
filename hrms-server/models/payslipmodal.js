import mongoose from "mongoose";

const schema = new mongoose.Schema({
  baseSalary: { type: Number, default: 0, min: 0 },
  hra: { type: Number, default: 0, min: 0 },
  conveyance: { type: Number, default: 0, min: 0 },
  specialAllowance: { type: Number, default: 0, min: 0 },
  bonus: { type: Number, default: 0, min: 0 },
  advanceStatuoryBonus: { type: Number, default: 0, min: 0 },
  overtime: { type: Number, default: 0, min: 0 },
  professionalTax: { type: Number, default: 0, min: 0 },
  pf: { type: Number, default: 0, min: 0 },
  tds: { type: Number, default: 0, min: 0 },
  otherDeductions: { type: Number, default: 0, min: 0 },
  empId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  totalEarnings: { type: Number, default: 0, min: 0 },
  totalDeduction: { type: Number, default: 0, min: 0 },
  grossSalary: { type: Number, default: 0, min: 0 },
  netSalary: { type: Number, default: 0 },
  month: { type: String, required: true },
  year: { type: Number, required: true, index: true },
  calendarDays: { type: Number, default: 0 },
  paidDays: { type: Number, default: 0 },
  lossDays: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "approved", "rejected", "processed"], default: "pending", index: true },
  hrId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  pdfPath: { type: String, default: null },
}, { timestamps: true });
schema.index({ empId: 1, month: 1, year: 1 }, { unique: true });
schema.index({ hrId: 1, year: 1, month: 1 });
export default mongoose.model("payslip", schema);
