import attendanceModel from "../models/attendanceModal.js";
import User from "../models/user.js";
import {
  getDateKey,
  getDayOfWeek,
  getLocalDate,
  workingHoursPerDay,
} from "../lib/attendanceUtils.js";
import { success, failure } from "../lib/response.js";

const parsePage = (query) => ({
  page: Math.max(1, Number(query.page) || 1),
  limit: Math.min(100, Math.max(1, Number(query.limit) || 20)),
});

export const getAttendanceMetrics = (checkIn, checkOut) => {
  const standardHours = workingHoursPerDay();
  const checkInDate = checkIn ? new Date(checkIn) : null;
  const checkOutDate = checkOut ? new Date(checkOut) : null;

  const totalHours =
    checkInDate &&
    checkOutDate &&
    !Number.isNaN(checkInDate.getTime()) &&
    !Number.isNaN(checkOutDate.getTime())
      ? Number(
          Math.max(
            0,
            (checkOutDate.getTime() - checkInDate.getTime()) / 3600000,
          ).toFixed(2),
        )
      : 0;

  const extraHours = Number(Math.max(0, totalHours - standardHours).toFixed(2));

  const isLate =
    checkInDate && !Number.isNaN(checkInDate.getTime())
      ? checkInDate.getHours() > 9 ||
        (checkInDate.getHours() === 9 && checkInDate.getMinutes() > 0)
      : false;

  return {
    totalHours,
    extraHours,
    isLate,
  };
};

export const checkIn = async (req, res) => {
  const user = req.user;
  const date = getDateKey();
  const existing = await attendanceModel.findOne({ user: user._id, date });
  if (existing) return failure(res, 409, "You have already checked in today");

  const now = getLocalDate();
  const isLate =
    now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);
  const record = await attendanceModel.create({
    date,
    checkIn: now,
    user: user._id,
    hrId: user.head,
    day: getDayOfWeek(now),
    status: isLate ? "late" : "present",
  });

  return success(res, {
    status: 201,
    message: "Attendance marked successfully",
    data: record,
  });
};

export const checkOut = async (req, res) => {
  const user = req.user;
  const record = await attendanceModel.findOne({
    user: user._id,
    date: getDateKey(),
  });
  if (!record)
    return failure(res, 404, "Attendance not found. Please check in first");
  if (record.checkOut)
    return failure(res, 409, "You have already checked out today");

  const now = getLocalDate();
  const { totalHours, extraHours, isLate } = getAttendanceMetrics(
    record.checkIn,
    now,
  );

  record.checkOut = now;
  record.totalHours = Number(totalHours.toFixed(2));
  record.extraHours = Number(extraHours.toFixed(2));
  record.status = record.status === "late" || isLate ? "late" : "present";

  await record.save();
  return success(res, {
    message: "Checkout completed successfully",
    data: record,
  });
};

export const today = async (req, res) =>
  success(res, {
    data: await attendanceModel.findOne({
      user: req.user._id,
      date: getDateKey(),
    }),
  });

export const history = async (req, res) => {
  const { startDate, endDate, status, month, search } = req.query;
  const { page, limit } = parsePage(req.query);
  const query = { user: req.user._id };

  if (month) {
    query.date = { $regex: `^${String(month).trim()}` };
  } else if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }

  if (status) query.status = status;

  if (search?.trim()) {
    const searchTerm = search.trim();
    query.$or = [
      { date: { $regex: searchTerm, $options: "i" } },
      { status: { $regex: searchTerm, $options: "i" } },
    ];
  }

  const [data, total] = await Promise.all([
    attendanceModel
      .find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    attendanceModel.countDocuments(query),
  ]);

  return success(res, {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

export const monthlySummary = async (req, res) => {
  const now = getLocalDate();
  const year = Number(req.query.year || now.getFullYear());
  const month = Number(req.query.month || now.getMonth() + 1);

  if (month < 1 || month > 12)
    return failure(res, 400, "month must be between 1 and 12");

  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const rows = await attendanceModel
    .find({ user: req.user._id, date: { $regex: `^${prefix}` } })
    .lean();

  const daysInMonth = new Date(year, month, 0).getDate();
  const workingDays = Array.from(
    { length: daysInMonth },
    (_, index) => new Date(year, month - 1, index + 1),
  ).filter((date) => date.getDay() !== 0 && date.getDay() !== 6).length;

  const present = rows.filter((row) =>
    ["present", "late"].includes(row.status),
  ).length;
  const late = rows.filter((row) => row.status === "late").length;
  const totalHours = rows.reduce(
    (sum, row) => sum + Number(row.totalHours || 0),
    0,
  );
  const overtime = rows.reduce(
    (sum, row) => sum + Number(row.extraHours || 0),
    0,
  );
  const absent = Math.max(0, workingDays - present);
  const attendancePercentage =
    workingDays > 0 ? Number(((present / workingDays) * 100).toFixed(2)) : 0;

  const summary = {
    year,
    month,
    workingDays,
    present,
    absent,
    late,
    lateDays: late,
    daysPresent: present,
    totalHours: Number(totalHours.toFixed(2)),
    overtime: Number(overtime.toFixed(2)),
    hoursWorked: Number(totalHours.toFixed(2)),
    attendancePercentage: `${attendancePercentage}%`,
  };

  return success(res, { data: summary });
};

export const hrAttendance = async (req, res) => {
  const { date, startDate, endDate, department, employeeId, status, search } =
    req.query;
  const { page, limit } = parsePage(req.query);
  const employeeQuery = { head: req.user._id, role: { $ne: "hr" } };
  if (department) employeeQuery.department = department;
  if (employeeId) employeeQuery._id = employeeId;
  if (search)
    employeeQuery.$or = [
      { name: { $regex: search, $options: "i" } },
      { empId: { $regex: search, $options: "i" } },
    ];
  const employees = await User.find(employeeQuery)
    .select("name email empId department jobTitle empStatus")
    .populate("department", "title")
    .lean();
  const employeeIds = employees.map((e) => e._id);
  const attendanceQuery = { user: { $in: employeeIds } };
  if (date) attendanceQuery.date = date;
  else if (startDate || endDate) {
    attendanceQuery.date = {};
    if (startDate) attendanceQuery.date.$gte = startDate;
    if (endDate) attendanceQuery.date.$lte = endDate;
  }
  if (status) attendanceQuery.status = status;
  const [records, total] = await Promise.all([
    attendanceModel.find(attendanceQuery).sort({ date: -1 }).lean(),
    attendanceModel.countDocuments(attendanceQuery),
  ]);
  const map = new Map(records.map((r) => [String(r.user), r]));
  let data = employees.map((employee) => ({
    employee,
    attendance: map.get(String(employee._id)) || null,
  }));
  const employeeTotal = data.length;
  const start = (page - 1) * limit;
  data = data.slice(start, start + limit);
  return success(res, {
    data,
    meta: {
      page,
      limit,
      total: employeeTotal,
      matchedAttendance: total,
      totalPages: Math.ceil(employeeTotal / limit),
    },
  });
};
