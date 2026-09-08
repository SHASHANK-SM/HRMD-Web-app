import mongoose from "mongoose";

const schema = new mongoose.Schema({
  leaveType: { type: String, enum: ["casual", "sick", "annual", "anual", "emergency", "maternity", "paternity", "unpaid"], required: true, index: true },
  startDate: { type: String, required: true, index: true },
  endDate: { type: String, required: true },
  numberOfDays: { type: Number, required: true, min: 0.5 },
  reason: { type: String, required: true, trim: true, maxlength: 1000 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  hrId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending", index: true },
  document: { type: String, default: null },
  message: { type: String, default: null, maxlength: 1000 },
}, { timestamps: true });
schema.index({ user: 1, startDate: 1, endDate: 1 });
schema.index({ hrId: 1, status: 1, startDate: 1 });
export default mongoose.model("leaves", schema);
