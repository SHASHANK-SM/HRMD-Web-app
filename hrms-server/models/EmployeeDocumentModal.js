import mongoose from "mongoose";

const schema = new mongoose.Schema({
  documentName: { type: String, required: true, trim: true },
  documentType: { type: String, enum: ["resume", "id-proof", "certificate", "offer-joining", "experience-letter", "profile-photo", "other"], default: "other", index: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true, min: 0 },
  approved: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User", index: true },
}, { timestamps: true });
schema.index({ userId: 1, documentType: 1 });
export default mongoose.model("documents", schema);
