import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Attendance from "../models/attendanceModal.js";
import Company from "../models/CompanyModal.js";
import Otp from "../models/OtpModal.js";
import Mail from "../models/MailModal.js";
import { getDateKey } from "../lib/attendanceUtils.js";
import { success, failure } from "../lib/response.js";
import { deleteFile } from "../lib/multerConfig.js";

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, tokenVersion: user.tokenVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
  );
const publicUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

export const onUserLogin = async (req, res) => {
  const { empId, password } = req.body;
  if (!empId || !password)
    return failure(res, 400, "Employee ID and password are required");
  const user = await User.findOne({ empId: String(empId).trim() }).select(
    "+password",
  );
  if (!user) return failure(res, 401, "Invalid credentials");
  if (user.empStatus === "inactive")
    return failure(res, 403, "Account is inactive");
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return failure(res, 401, "Invalid credentials");
  return res
    .status(200)
    .json({
      success: true,
      message: "Login successful",
      token: signToken(user),
      role: user.role,
      user: publicUser(user),
    });
};

export const onManualRegister = async (req, res) => {
  if (!req.user || req.user.role !== "hr")
    return failure(res, 403, "Only HR can create users from this endpoint");
  const {
    name,
    email,
    password,
    mobile,
    empId,
    role: requestedRole = "employee",
    jobTitle,
    salary,
    department,
  } = req.body;
  const role = requestedRole;
  if (!["employee", "manager"].includes(role))
    return failure(res, 400, "Invalid role");
  if (!name || !email || !password || !mobile || !empId)
    return failure(
      res,
      400,
      "name, email, password, mobile and empId are required",
    );
  const exists = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { empId }, { mobile }],
  });
  if (exists) return failure(res, 409, "User already exists");
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    mobile,
    empId,
    role,
    jobTitle,
    salary,
    department,
    head: req.user?._id,
    company: req.user?.company,
    empStatus: "active",
  });
  return success(res, {
    status: 201,
    message: "User created successfully",
    data: user,
  });
};

export const logout = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } });
  return success(res, { message: "Logged out successfully" });
};

export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("department", "title")
    .populate("address")
    .populate("emergencyContacts")
    .lean();
  return success(res, { data: user });
};
export const getProfile = getUserProfile;
export const changeAuthImage = async (req, res) => {
  if (!req.file) return failure(res, 400, "Image is required");
  const old = (await User.findById(req.user._id).select("authenticationImage"))
    .authenticationImage;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { authenticationImage: req.file.path },
    { new: true },
  ).select("-password");
  if (old) await deleteFile(old);
  return success(res, { message: "Authentication image updated", data: user });
};
export const profilePicAdded = async (req, res) => {
  if (!req.file) return failure(res, 400, "Image is required");
  const old = (await User.findById(req.user._id).select("profilePic"))
    .profilePic;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profilePic: req.file.path },
    { new: true },
  ).select("-password");
  if (old) await deleteFile(old);
  return success(res, { message: "Profile photo updated", data: user });
};
export const addFaceId = async (req, res) => {
  if (!req.body.id) return failure(res, 400, "Face ID is required");
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { faceId: req.body.id },
    { new: true },
  ).select("-password");
  return success(res, { message: "Face ID updated", data: user });
};
export const onCheckIn = async (req, res) => {
  const existing = await Attendance.findOne({
    user: req.user._id,
    date: getDateKey(),
  });
  if (existing) return failure(res, 409, "You have already checked in today");
  const a = await Attendance.create({
    user: req.user._id,
    hrId: req.user.head,
    date: getDateKey(),
    checkIn: new Date(),
    day: new Date()
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase(),
  });
  return success(res, {
    status: 201,
    message: "Attendance marked successfully",
    data: a,
  });
};
export const onCheckOut = async (req, res) => {
  const a = await Attendance.findOne({
    user: req.user._id,
    date: getDateKey(),
  });
  if (!a)
    return failure(res, 404, "Attendance not found. Please check in first");
  if (a.checkOut)
    return failure(res, 409, "You have already checked out today");
  const now = new Date();
  const hours = Math.max(0, (now - a.checkIn) / 3600000);
  const standard = Number(process.env.WORKING_HOURS_PER_DAY || 9);
  a.checkOut = now;
  a.totalHours = Number(hours.toFixed(2));
  a.extraHours = Number(Math.max(0, hours - standard).toFixed(2));
  await a.save();
  return success(res, { message: "Checkout completed successfully", data: a });
};
export const getTodayAttendace = async (req, res) =>
  success(res, {
    data: await Attendance.findOne({ user: req.user._id, date: getDateKey() }),
  });
export const updateEduction = async (req, res) => {
  if (!Array.isArray(req.body.education))
    return failure(res, 400, "Education data is required");
  const target = req.user.role === "hr" ? req.params.id : req.user._id;
  if (req.user.role !== "hr" && String(target) !== String(req.user._id))
    return failure(res, 403, "Not allowed");
  const u = await User.findByIdAndUpdate(
    target,
    { education: req.body.education },
    { new: true, runValidators: true },
  ).select("-password");
  if (!u) return failure(res, 404, "User not found");
  return success(res, { message: "Education updated successfully", data: u });
};
export const uploadCertificate = async (req, res) => {
  const target = req.user.role === "hr" ? req.params.id : req.user._id;
  if (req.user.role !== "hr" && String(target) !== String(req.user._id))
    return failure(res, 403, "Not allowed");
  if (!req.files?.length)
    return failure(res, 400, "At least one certificate is required");
  const u = await User.findById(target);
  if (!u) return failure(res, 404, "User not found");
  const section = req.body.sectionTitle;
  if (!section) return failure(res, 400, "sectionTitle is required");
  let group = u.certificates.find((c) => c.section === section);
  if (!group) {
    group = { section, files: [] };
    u.certificates.push(group);
  }
  for (const f of req.files)
    group.files.push({
      filename: f.originalname,
      url: `/uploads/${f.filename}`,
    });
  await u.save();
  return success(res, {
    message: "Certificates uploaded",
    data: u.certificates,
  });
};
export const deletCertificate = async (req, res) => {
  const target = req.user.role === "hr" ? req.params.id : req.user._id;
  const u = await User.findById(target);
  if (!u) return failure(res, 404, "User not found");
  const { sectionTitle, filename } = req.body;
  const section = u.certificates.find((c) => c.section === sectionTitle);
  if (!section) return failure(res, 404, "Certificate section not found");
  const file = section.files.find((f) => f.filename === filename);
  if (!file) return failure(res, 404, "Certificate not found");
  section.files = section.files.filter((f) => f.filename !== filename);
  if (!section.files.length)
    u.certificates = u.certificates.filter((c) => c.section !== sectionTitle);
  await u.save();
  return success(res, { message: "Certificate deleted" });
};
export const updateCertificateStatus = async (req, res) => {
  if (req.user.role !== "hr") return failure(res, 403, "HR access required");
  const u = await User.findOne({ _id: req.body.empId, head: req.user._id });
  if (!u) return failure(res, 404, "Employee not found");
  const allowed = ["pending", "accepted", "rejected"];
  if (!allowed.includes(req.body.status))
    return failure(res, 400, "Invalid certificate status");
  let found = false;
  for (const c of u.certificates)
    for (const f of c.files)
      if (String(f._id) === String(req.params.fileId)) {
        f.status = req.body.status;
        found = true;
      }
  if (!found) return failure(res, 404, "Certificate not found");
  await u.save();
  return success(res, {
    message: "Certificate status updated",
    data: u.certificates,
  });
};
export const changePassword = async (req, res) => {
  const target = await User.findOne({ empId: req.params.empId }).select(
    "+password",
  );
  if (!target) return failure(res, 404, "User not found");
  if (req.user.role !== "hr" && String(req.user._id) !== String(target._id))
    return failure(res, 403, "Not allowed");
  if (req.user.role === "hr" && String(target._id) !== String(req.user._id) && String(target.head) !== String(req.user._id))
    return failure(res, 403, "Not allowed");
  if (!req.body.password || String(req.body.password).length < 6)
    return failure(res, 400, "Password must be at least 6 characters");
  if (String(target._id) === String(req.user._id)) {
    if (!req.body.currentPassword || !(await bcrypt.compare(req.body.currentPassword, target.password)))
      return failure(res, 400, "Current password is incorrect");
  }
  target.password = req.body.password;
  if (req.body.firstName || req.body.lastName)
    target.name =
      [req.body.firstName, req.body.lastName].filter(Boolean).join(" ") ||
      target.name;
  await target.save();
  return success(res, { message: "Password updated successfully" });
};
export const onRemoveOtp = async (req, res) => {
  const q = req.body.mobile
    ? { mobile: req.body.mobile }
    : req.body.email
      ? { email: req.body.email }
      : null;
  if (!q) return failure(res, 400, "mobile or email is required");
  await Otp.deleteMany(q);
  return success(res, { message: "OTP removed successfully" });
};

const otpCode = () => String(Math.floor(100000 + Math.random() * 900000));
export const SendOtpsForCompanyReg = async (req, res) => {
  const { email, mobile } = req.body;
  if (!email || !mobile)
    return failure(res, 400, "Mobile and email are required");
  const exists = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { mobile }],
  });
  if (exists) return failure(res, 409, "User already exists");
  const exp = new Date(
    Date.now() + Number(process.env.OTP_EXPIRY_MINUTES || 10) * 60000,
  );
  const emailOtp = otpCode(),
    mobileOtp = otpCode();
  await Otp.bulkWrite([
    {
      updateOne: {
        filter: { email },
        update: { $set: { email, otp: emailOtp, expiresAt: exp } },
        upsert: true,
      },
    },
    {
      updateOne: {
        filter: { mobile },
        update: { $set: { mobile, otp: mobileOtp, expiresAt: exp } },
        upsert: true,
      },
    },
  ]);
  return success(res, {
    message: "OTPs generated successfully",
    data: {
      emailSent: Boolean(process.env.EMAIL_HOST),
      mobileSent: Boolean(process.env.OTP_API_KEY),
    },
  });
};
export const verifyMobileOtp = async (req, res) =>
  verifyOtp(req, res, "mobile");
export const verifyEmailOtp = async (req, res) => verifyOtp(req, res, "email");
async function verifyOtp(req, res, field) {
  const { otp } = req.body;
  const value = req.body[field];
  if (!value || !otp) return failure(res, 400, `${field} and otp are required`);
  const row = await Otp.findOne({ [field]: value });
  if (!row || row.expiresAt < new Date())
    return failure(res, 400, "OTP is invalid or expired");
  if (row.otp !== String(otp)) return failure(res, 401, "OTP does not match");
  return success(res, { message: "OTP verified", data: { verified: true } });
}
export const resendMobileOtp = async (req, res) => {
  if (!req.body.mobile) return failure(res, 400, "mobile is required");
  const otp = otpCode();
  await Otp.findOneAndUpdate(
    { mobile: req.body.mobile },
    { otp, expiresAt: new Date(Date.now() + 600000) },
    { upsert: true },
  );
  return success(res, { message: "Mobile OTP regenerated" });
};
export const resendEmailOtp = async (req, res) => {
  if (!req.body.email) return failure(res, 400, "email is required");
  const otp = otpCode();
  await Otp.findOneAndUpdate(
    { email: req.body.email },
    { otp, expiresAt: new Date(Date.now() + 600000) },
    { upsert: true },
  );
  return success(res, { message: "Email OTP regenerated" });
};
export const newCompanyRegister = async (req, res) => {
  const {
    name,
    email,
    mobile,
    companyName,
    companyAdress,
    termsAndCondition,
    password,
    empId,
  } = req.body;
  if (!name || !email || !mobile || !companyName || !password || !empId)
    return failure(res, 400, "Required registration fields are missing");
  if (!companyAdress?.trim())
    return failure(res, 400, "Company address is required");
  const normalizedEmail = String(email).toLowerCase().trim();
  const normalizedEmpId = String(empId).trim();
  const normalizedMobile = String(mobile).trim();
  if (
    await User.findOne({
      $or: [
        { email: normalizedEmail },
        { empId: normalizedEmpId },
        { mobile: normalizedMobile },
      ],
    })
  )
    return failure(res, 409, "User already exists");
  if (
    await Company.findOne({
      companyName: {
        $regex: new RegExp(
          `^${companyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i",
        ),
      },
    })
  )
    return failure(res, 409, "Company already exists");
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    mobile: normalizedMobile,
    role: "hr",
    empId: normalizedEmpId,
    password,
    empStatus: "active",
  });
  const company = await Company.create({
    companyName: companyName.trim(),
    companyAddress: companyAdress || "",
    logo: req.file?.path || null,
    hrId: user._id,
    termsAndConditions: termsAndCondition,
  });
  user.company = company._id;
  await user.save();
  await Mail.create({
    companyId: company._id,
    templateName: "welcome",
    subject: "Welcome to [Company Name]",
    body: "<p>Welcome [Employee Name] to [Company Name].</p>",
  });
  return success(res, {
    status: 201,
    message: "Registration successful",
    data: { user, company },
  });
};
export const employeeSelfRegister = async (req, res) => {
  const { name, email, mobile, empId, password, jobTitle } = req.body;
  if (!name || !email || !mobile || !empId || !password) {
    return failure(
      res,
      400,
      "name, email, mobile, empId and password are required",
    );
  }
  const normalizedEmail = String(email).toLowerCase().trim();
  const normalizedEmpId = String(empId).trim();
  const normalizedMobile = String(mobile).trim();
  const user = await User.findOne({
    empId: normalizedEmpId,
    email: normalizedEmail,
    role: "employee",
  }).select("+password");
  if (!user)
    return failure(
      res,
      404,
      "Employee ID and email must be provided by HR before account activation",
    );
  if (user.empStatus === "inactive")
    return failure(res, 403, "Employee account is inactive");
  user.name = name.trim();
  user.mobile = normalizedMobile;
  user.password = password;
  if (jobTitle?.trim()) user.jobTitle = jobTitle.trim();
  await user.save();
  return success(res, {
    message: "Employee account activated successfully",
    data: { user: publicUser(user) },
  });
};

export const updateCompanyDetails = async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.logo = req.file.path;
  for (const key of ["latitude", "longitude", "distance", "port"])
    if (data[key] !== undefined) data[key] = Number(data[key]);
  delete data.hrId;
  const company = await Company.findOneAndUpdate(
    { hrId: req.user._id },
    { $set: data },
    { new: true, runValidators: true },
  ).select("-mailPassword");
  if (!company) return failure(res, 404, "Company not found");
  return success(res, { message: "Company details updated", data: company });
};
export const getCompanyDetails = async (req, res) => {
  const c = await Company.findById(req.user.company)
    .select("-mailPassword")
    .lean();
  if (!c) return failure(res, 404, "Company not found");
  return success(res, { data: c });
};
