import mongoose from "mongoose";
const schema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["leave-approved", "leave-rejected", "payslip-generated", "welcome", "attendance-reminder", "new-leave-request", "new-employee", "pending-approval", "payroll-reminder"], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false, index: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
schema.index({ recipient: 1, createdAt: -1 });
export default mongoose.model("notification", schema);
