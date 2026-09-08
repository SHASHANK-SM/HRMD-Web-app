import mongoose from "mongoose";
const schema = new mongoose.Schema({ companyId: { type: mongoose.Schema.Types.ObjectId, ref: "company", required: true, index: true }, templateName: { type: String, enum: ["welcome", "payslip", "leave-accept", "leave-reject"], default: "welcome" }, subject: { type: String, required: true }, body: { type: String, required: true } }, { timestamps: true });
schema.index({ companyId: 1, templateName: 1 }, { unique: true });
export default mongoose.model("mail", schema);
