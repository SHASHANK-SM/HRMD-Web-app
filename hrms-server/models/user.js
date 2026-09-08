import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, minlength: 6, select: false },
  mobile: { type: String, required: true, trim: true },
  empId: { type: String, required: true, unique: true, trim: true, index: true },
  gender: { type: String, enum: ["male", "female", "others"] },
  role: { type: String, enum: ["employee", "hr", "manager"], required: true, default: "employee", index: true },
  salary: { type: Number, default: 0, min: 0 },
  jobTitle: { type: String, default: null, trim: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "departments", default: null, index: true },
  faceId: { type: String, default: null },
  authenticationImage: { type: String, default: null },
  location: { type: String, default: null },
  seatNumber: { type: String, default: null },
  joinDate: { type: String, default: null },
  endDate: { type: String, default: null },
  uan: { type: String, default: null },
  pfAccountNumber: { type: String, default: null },
  bankAcNumber: { type: String, default: null },
  esiNumber: { type: String, default: null },
  panNumber: { type: String, default: null },
  shiftTimings: { from: { type: String, default: null }, to: { type: String, default: null } },
  empStatus: { type: String, enum: ["active", "inactive", "offboarding"], default: "active", index: true },
  maritalStatus: { type: String, default: null },
  nationality: { type: String, default: null },
  address: { type: mongoose.Schema.Types.ObjectId, ref: "employeeaddress", default: null },
  documents: { type: mongoose.Schema.Types.ObjectId, ref: "documents", default: null },
  emergencyContacts: { type: mongoose.Schema.Types.ObjectId, ref: "employeeParentContact", default: null },
  dob: { type: String, default: null },
  lineManager: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  taxId: { type: String, default: null },
  healthInsurance: { type: String, default: null },
  socialInsurance: { type: String, default: null },
  employmentType: { type: String, default: null },
  contractDetails: {
    contractNumber: { type: String, default: null }, contractName: { type: String, default: null },
    contractType: { type: String, default: null }, startDate: { type: String, default: null }, endDate: { type: String, default: null },
  },
  currentProject: { type: String, default: null },
  education: [{ institute: { type: String, required: true }, grade: { type: String, required: true }, passed: { type: String, required: true } }],
  certificates: [{ section: String, files: [{ filename: String, url: String, status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" } }] }],
  profilePic: { type: String, default: null },
  effectiveDate: { type: String, default: null },
  positionType: { type: String, default: null },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "company", default: null, index: true },
  preferences: { type: mongoose.Schema.Types.Mixed, default: {} },
  tokenVersion: { type: Number, default: 0 },
  head: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
}, { timestamps: true, strict: true });

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, Number(process.env.BCRYPT_SALT_ROUNDS || 12));
  next();
});

schema.methods.comparePassword = function (candidate) { return bcrypt.compare(candidate, this.password); };
schema.set("toJSON", { transform: (_doc, ret) => { delete ret.password; return ret; } });

export default mongoose.model("User", schema);
