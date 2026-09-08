import User from "../models/user.js";
import { randomBytes } from "node:crypto";
import Department from "../models/DepartmentModal.js";
import Address from "../models/EmployeeAddressModal.js";
import Emergency from "../models/EmployeeEmergencyContactModal.js";
import { success, failure } from "../lib/response.js";
import { sendMail } from "../lib/attendanceUtils.js";

const safeFields = [
  "name",
  "email",
  "mobile",
  "empId",
  "gender",
  "jobTitle",
  "salary",
  "department",
  "location",
  "seatNumber",
  "joinDate",
  "endDate",
  "uan",
  "pfAccountNumber",
  "bankAcNumber",
  "esiNumber",
  "panNumber",
  "shiftTimings",
  "empStatus",
  "maritalStatus",
  "nationality",
  "dob",
  "lineManager",
  "taxId",
  "healthInsurance",
  "socialInsurance",
  "employmentType",
  "contractDetails",
  "currentProject",
  "effectiveDate",
  "positionType",
];
const buildUpdate = (body) =>
  Object.fromEntries(
    Object.entries(body).filter(([k]) => safeFields.includes(k)),
  );
const employeeQuery = (hrId) => ({ head: hrId, role: { $ne: "hr" } });

export const listEmployees = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1),
    limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const q = employeeQuery(req.user._id);
  if (req.query.department) q.department = req.query.department;
  if (req.query.designation)
    q.jobTitle = { $regex: req.query.designation, $options: "i" };
  if (req.query.status) q.empStatus = req.query.status;
  if (req.query.search)
    q.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { empId: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  const [data, total] = await Promise.all([
    User.find(q)
      .select("-password")
      .populate("department", "title")
      .populate("address")
      .populate("emergencyContacts")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(q),
  ]);
  return success(res, {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

export const getEmployee = async (req, res) => {
  const employee = await User.findOne({
    _id: req.params.id,
    ...employeeQuery(req.user._id),
  })
    .select("-password")
    .populate("department", "title")
    .populate("address")
    .populate("emergencyContacts")
    .lean();
  if (!employee) return failure(res, 404, "Employee not found");
  return success(res, { data: employee });
};

export const createEmployee = async (req, res) => {
  const {
    name,
    email,
    mobile,
    empId,
    password,
    department,
    jobTitle,
    joinDate,
    employmentType,
    location,
    role = "employee",
  } = req.body;
  if (!name || !email || !mobile || !empId)
    return failure(res, 400, "name, email, mobile and empId are required");
  if (role !== "employee" && role !== "manager")
    return failure(
      res,
      400,
      "Employee onboarding role must be employee or manager",
    );
  const duplicate = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { empId }, { mobile }],
  });
  if (duplicate)
    return failure(
      res,
      409,
      "An employee with the same email, employee ID or mobile already exists",
    );
  const employee = await User.create({
    ...req.body,
    password: password || randomBytes(24).toString("hex"),
    name: name.trim(),
    email: email.toLowerCase(),
    role,
    head: req.user._id,
    company: req.user.company,
    department,
    jobTitle,
    joinDate,
    employmentType,
    location,
    empStatus: "active",
  });
  if (employee.email)
    sendMail(
      employee.email,
      "Welcome to HRMS",
      `<p>Welcome ${employee.name}. Your employee account has been created.</p>`,
    ).catch(() => {});
  return success(res, {
    status: 201,
    message: "Employee created successfully",
    data: employee,
  });
};

export const updateEmployee = async (req, res) => {
  const data = buildUpdate(req.body);
  if (!Object.keys(data).length)
    return failure(res, 400, "No permitted employee fields supplied");
  const employee = await User.findOneAndUpdate(
    { _id: req.params.id, ...employeeQuery(req.user._id) },
    { $set: data },
    { new: true, runValidators: true },
  ).select("-password");
  if (!employee) return failure(res, 404, "Employee not found");
  return success(res, {
    message: "Employee updated successfully",
    data: employee,
  });
};
export const changeStatus = async (req, res) => {
  if (!["active", "inactive", "offboarding"].includes(req.body.status))
    return failure(res, 400, "Invalid employee status");
  const e = await User.findOneAndUpdate(
    { _id: req.params.id, ...employeeQuery(req.user._id) },
    { $set: { empStatus: req.body.status } },
    { new: true },
  ).select("-password");
  if (!e) return failure(res, 404, "Employee not found");
  return success(res, { message: "Employee status updated", data: e });
};
export const updateAddress = async (req, res) => {
  const e = await User.findOne({
    _id: req.params.id,
    ...employeeQuery(req.user._id),
  });
  if (!e) return failure(res, 404, "Employee not found");
  const a = await Address.findOneAndUpdate(
    { userId: e._id },
    { $set: { ...req.body, userId: e._id } },
    { new: true, upsert: true, runValidators: true },
  );
  await User.findByIdAndUpdate(e._id, { address: a._id });
  return success(res, { message: "Employee address updated", data: a });
};
export const updateEmergency = async (req, res) => {
  const e = await User.findOne({
    _id: req.params.id,
    ...employeeQuery(req.user._id),
  });
  if (!e) return failure(res, 404, "Employee not found");
  const c = await Emergency.create({ ...req.body, userId: e._id });
  await User.findByIdAndUpdate(e._id, { emergencyContacts: c._id });
  return success(res, {
    status: 201,
    message: "Emergency contact added",
    data: c,
  });
};

export const departments = async (req, res) => {
  const data = await Department.find({ hrId: req.user._id }).lean();
  return success(res, { data });
};
export const createDepartment = async (req, res) => {
  if (!req.body.title?.trim()) return failure(res, 400, "title is required");
  const d = await Department.create({
    title: req.body.title.trim(),
    hrId: req.user._id,
  });
  return success(res, { status: 201, message: "Department created", data: d });
};
export const updateDepartment = async (req, res) => {
  const d = await Department.findOneAndUpdate(
    { _id: req.params.id, hrId: req.user._id },
    { title: req.body.title?.trim() },
    { new: true, runValidators: true },
  );
  if (!d) return failure(res, 404, "Department not found");
  return success(res, { message: "Department updated", data: d });
};
export const deleteDepartment = async (req, res) => {
  const has = await User.exists({
    department: req.params.id,
    head: req.user._id,
  });
  if (has)
    return failure(res, 409, "Cannot delete a department that has employees");
  const d = await Department.findOneAndDelete({
    _id: req.params.id,
    hrId: req.user._id,
  });
  if (!d) return failure(res, 404, "Department not found");
  return success(res, { message: "Department deleted", data: d });
};
