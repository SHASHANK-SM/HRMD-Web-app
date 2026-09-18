import mongoose, { Schema } from "mongoose";
const schema = new Schema({
  companyName: { type: String, required: true, trim: true }, companyAddress: { type: String, required: true }, logo: { type: String, default: null },
  companyWebsite: String, businessMail: { type: String, default: null }, mobile: { type: String, default: null }, workingHours: { type: String, default: null }, mailPassword: { type: String, default: null, select: false }, port: { type: Number, default: null }, mailServer: { type: String, default: null },
  hrId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true }, verified: { type: Boolean, default: false }, latitude: { type: Number, default: 0 }, longitude: { type: Number, default: 0 }, distance: { type: Number, default: 0 }, termsAndConditions: { type: String, default: null }, privacyPolicy: { type: String, default: null },
}, { timestamps: true });
export default mongoose.model("company", schema);
