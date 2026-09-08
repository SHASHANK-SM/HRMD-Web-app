import mongoose from "mongoose";
const schema = new mongoose.Schema({ taskName: { type: String, required: true }, taskType: { type: String, enum: ["project", "general"], required: true }, assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }, search: { type: String, default: "" }, dueDate: { type: Date, required: true }, description: { type: String, required: true }, status: { type: String, enum: ["Pending", "In-Progress", "Completed"], default: "Pending" }, hrId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true } }, { timestamps: true });
schema.index({ hrId: 1, createdAt: -1 });
export default mongoose.model("EmployeeTask", schema);
