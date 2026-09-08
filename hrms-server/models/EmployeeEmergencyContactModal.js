import mongoose from "mongoose";
const schema = new mongoose.Schema({ name: String, mobile: String, gender: String, email: String, address: String, userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true } }, { timestamps: true });
export default mongoose.model("employeeParentContact", schema);
