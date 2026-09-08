import mongoose from "mongoose";
const schema = new mongoose.Schema({ mobile: String, email: String, otp: { type: String, required: true }, expiresAt: { type: Date, required: true, index: true } }, { timestamps: true });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model("otp", schema);
