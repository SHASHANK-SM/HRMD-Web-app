import mongoose from "mongoose";
import { getDateKey, getDayOfWeek } from "../lib/attendanceUtils.js";

const schema = new mongoose.Schema({
  date: { type: String, required: true, index: true, default: () => getDateKey() },
  checkIn: { type: Date, default: null },
  checkOut: { type: Date, default: null },
  totalHours: { type: Number, default: 0, min: 0 },
  extraHours: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ["present", "late", "absent"], default: "present" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  hrId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  day: { type: String, enum: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"], default: () => getDayOfWeek() },
}, { timestamps: true });
schema.index({ user: 1, date: 1 }, { unique: true });
schema.index({ hrId: 1, date: 1 });
export default mongoose.model("attendance", schema);
