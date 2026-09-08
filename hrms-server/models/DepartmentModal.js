import mongoose from "mongoose";
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  hrId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User", index: true },
}, { timestamps: true });
schema.index({ hrId: 1, title: 1 }, { unique: true });
export default mongoose.model("departments", schema);
