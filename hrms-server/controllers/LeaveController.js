import mongoose from "mongoose";
import Leave from "../models/leaveModal.js";
import User from "../models/user.js";
import Notification from "../models/NotificationModal.js";
import { success, failure } from "../lib/response.js";
import { sendMail } from "../lib/attendanceUtils.js";

// --------------------------------------------------
// Constants
// --------------------------------------------------

const LEAVE_TYPES = new Set([
  "casual",
  "sick",
  "annual",
  "emergency",
  "maternity",
  "paternity",
  "unpaid",
]);

const LEAVE_STATUSES = new Set([
  "Pending",
  "Approved",
  "Rejected",
]);

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

const isValidDateString = (value) => {
  if (typeof value !== "string") return false;

  // Require exactly YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const calculateDuration = (startDate, endDate) => {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);

  return Math.floor((end - start) / 86400000) + 1;
};

const getPagination = (query) => {
  const pageNumber = Number.parseInt(query.page, 10);
  const limitNumber = Number.parseInt(query.limit, 10);

  const page =
    Number.isInteger(pageNumber) && pageNumber > 0
      ? pageNumber
      : 1;

  const limit =
    Number.isInteger(limitNumber) && limitNumber > 0
      ? Math.min(limitNumber, 100)
      : 20;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const getYear = (value) => {
  const currentYear = new Date().getFullYear();

  if (value === undefined || value === null || value === "") {
    return currentYear;
  }

  const year = Number.parseInt(value, 10);

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return null;
  }

  return year;
};

const getYearRange = (year) => ({
  start: `${year}-01-01`,
  end: `${year}-12-31`,
});

const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// --------------------------------------------------
// Find HR responsible for an employee
// --------------------------------------------------

const findEmployeeHr = async (employee) => {
  // Existing employee → directly assigned HR/manager.
  if (employee.head && isValidObjectId(employee.head)) {
    const head = await User.findOne({
      _id: employee.head,
      role: "hr",
      empStatus: "active",
    }).select("_id name email role");

    if (head) {
      return head;
    }
  }

  // If there is no head, find an HR belonging to the
  // same company.
  if (employee.company) {
    const hr = await User.findOne({
      company: employee.company,
      role: "hr",
      empStatus: "active",
    })
      .sort({ createdAt: 1 })
      .select("_id name email role");

    if (hr) {
      return hr;
    }
  }

  return null;
};

// --------------------------------------------------
// POST /leaves
// Employee applies for leave
// --------------------------------------------------

export const applyLeave = async (req, res, next) => {
  try {
    const {
      leaveType,
      startDate,
      endDate,
      reason,
    } = req.body;

    const normalizedLeaveType =
      typeof leaveType === "string"
        ? leaveType.trim().toLowerCase()
        : "";

    if (!LEAVE_TYPES.has(normalizedLeaveType)) {
      return failure(
        res,
        400,
        "Invalid leave type"
      );
    }

    if (
      !isValidDateString(startDate) ||
      !isValidDateString(endDate)
    ) {
      return failure(
        res,
        400,
        "Invalid leave dates. Use YYYY-MM-DD format."
      );
    }

    if (startDate > endDate) {
      return failure(
        res,
        400,
        "End date cannot be before start date"
      );
    }

    if (
      typeof reason !== "string" ||
      !reason.trim()
    ) {
      return failure(
        res,
        400,
        "Reason is required"
      );
    }

    const trimmedReason = reason.trim();

    if (trimmedReason.length > 1000) {
      return failure(
        res,
        400,
        "Reason cannot exceed 1000 characters"
      );
    }

    const numberOfDays = calculateDuration(
      startDate,
      endDate
    );

    if (numberOfDays < 1) {
      return failure(
        res,
        400,
        "Invalid leave duration"
      );
    }

    // --------------------------------------------------
    // Check overlapping pending/approved leave
    // --------------------------------------------------

    const overlappingLeave = await Leave.findOne({
      user: req.user._id,
      status: {
        $in: ["Pending", "Approved"],
      },
      startDate: {
        $lte: endDate,
      },
      endDate: {
        $gte: startDate,
      },
    }).lean();

    if (overlappingLeave) {
      return failure(
        res,
        409,
        "An existing pending or approved leave overlaps these dates"
      );
    }

    // --------------------------------------------------
    // Determine responsible HR
    // --------------------------------------------------

    const employee = await User.findById(
      req.user._id
    ).select(
      "_id name email company head role empStatus"
    );

    if (!employee) {
      return failure(
        res,
        401,
        "Employee account not found"
      );
    }

    if (employee.empStatus === "inactive") {
      return failure(
        res,
        403,
        "Account is inactive"
      );
    }

    const hr = await findEmployeeHr(employee);

    const leave = await Leave.create({
      leaveType: normalizedLeaveType,
      startDate,
      endDate,
      numberOfDays,
      reason: trimmedReason,
      document: req.file?.path || null,
      user: employee._id,
      hrId: hr?._id || null,
      status: "Pending",
    });

    // --------------------------------------------------
    // Notify HR
    // --------------------------------------------------

    if (hr?._id) {
      try {
        await Notification.create({
          recipient: hr._id,
          type: "new-leave-request",
          title: "New leave request",
          message: `${employee.name} submitted a ${normalizedLeaveType} leave request`,
          data: {
            leaveId: leave._id,
          },
        });
      } catch (notificationError) {
        console.error(
          "Leave notification error:",
          notificationError.message
        );
      }
    }

    return success(res, {
      status: 201,
      message: "Leave application submitted",
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// GET /leaves
// Employee leave history
// --------------------------------------------------

export const listMyLeaves = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      skip,
    } = getPagination(req.query);

    const query = {
      user: req.user._id,
    };

    // Search
    if (req.query.search?.trim()) {
      const search = escapeRegex(req.query.search.trim());
      query.$or = [
        { leaveType: { $regex: search, $options: "i" } },
        { reason: { $regex: search, $options: "i" } },
      ];
    }

    // Status filter
    if (req.query.status) {
      if (!LEAVE_STATUSES.has(req.query.status)) {
        return failure(
          res,
          400,
          "Invalid leave status"
        );
      }

      query.status = req.query.status;
    }

    // Leave type filter
    if (req.query.leaveType) {
      const leaveType =
        req.query.leaveType
          .trim()
          .toLowerCase();

      if (!LEAVE_TYPES.has(leaveType)) {
        return failure(
          res,
          400,
          "Invalid leave type"
        );
      }

      query.leaveType = leaveType;
    }

    // Optional year filtering
    if (req.query.year) {
      const year = getYear(req.query.year);

      if (!year) {
        return failure(
          res,
          400,
          "Invalid year"
        );
      }

      const {
        start,
        end,
      } = getYearRange(year);

      query.startDate = {
        $gte: start,
        $lte: end,
      };
    }

    const [
      data,
      total,
    ] = await Promise.all([
      Leave.find(query)
        .sort({
          startDate: -1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Leave.countDocuments(query),
    ]);

    // --------------------------------------------------
    // Calculate approved usage
    // --------------------------------------------------

    const year = getYear(req.query.year);

    if (!year) {
      return failure(
        res,
        400,
        "Invalid year"
      );
    }

    const {
      start,
      end,
    } = getYearRange(year);

    const approvedLeaves =
      await Leave.find({
        user: req.user._id,
        status: "Approved",
        startDate: {
          $gte: start,
          $lte: end,
        },
      }).lean();

    const usedByType =
      approvedLeaves.reduce(
        (result, leave) => {
          result[leave.leaveType] =
            (result[leave.leaveType] || 0) +
            leave.numberOfDays;

          return result;
        },
        {}
      );

    return success(res, {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(total / limit),
        year,
        usedByType,
      },
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// GET /leaves/balance
// --------------------------------------------------

export const balance = async (req, res, next) => {
  try {
    const year = getYear(req.query.year);

    if (!year) {
      return failure(
        res,
        400,
        "Invalid year"
      );
    }

    const {
      start,
      end,
    } = getYearRange(year);

    const approvedLeaves =
      await Leave.find({
        user: req.user._id,
        status: "Approved",
        startDate: {
          $gte: start,
          $lte: end,
        },
      }).lean();

    const used =
      approvedLeaves.reduce(
        (result, leave) => {
          result[leave.leaveType] =
            (result[leave.leaveType] || 0) +
            leave.numberOfDays;

          return result;
        },
        {}
      );

    return success(res, {
      data: {
        year,
        used,
        note:
          "The specification defines leave balance but does not define annual allocation values; approved usage is therefore reported without inventing quotas.",
      },
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// GET /leaves/hr
// HR views employee leave requests
// --------------------------------------------------

export const listHrLeaves = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      skip,
    } = getPagination(req.query);

    const query = {
      hrId: req.user._id,
    };

    // Status
    if (req.query.status) {
      if (!LEAVE_STATUSES.has(req.query.status)) {
        return failure(
          res,
          400,
          "Invalid leave status"
        );
      }

      query.status = req.query.status;
    }

    // Leave type
    if (req.query.leaveType) {
      const leaveType =
        req.query.leaveType
          .trim()
          .toLowerCase();

      if (!LEAVE_TYPES.has(leaveType)) {
        return failure(
          res,
          400,
          "Invalid leave type"
        );
      }

      query.leaveType = leaveType;
    }

    // Start date filter
    if (req.query.startDate) {
      if (!isValidDateString(req.query.startDate)) {
        return failure(
          res,
          400,
          "Invalid startDate. Use YYYY-MM-DD format."
        );
      }

      query.startDate = {
        $gte: req.query.startDate,
      };
    }

    // End date filter
    if (req.query.endDate) {
      if (!isValidDateString(req.query.endDate)) {
        return failure(
          res,
          400,
          "Invalid endDate. Use YYYY-MM-DD format."
        );
      }

      query.endDate = {
        $lte: req.query.endDate,
      };
    }

    // --------------------------------------------------
    // Search employee
    // --------------------------------------------------

    if (req.query.search?.trim()) {
      const search =
        escapeRegex(
          req.query.search.trim()
        );

      const employeeIds =
        await User.find({
          head: req.user._id,
          $or: [
            {
              name: {
                $regex: search,
                $options: "i",
              },
            },
            {
              empId: {
                $regex: search,
                $options: "i",
              },
            },
            {
              email: {
                $regex: search,
                $options: "i",
              },
            },
          ],
        }).distinct("_id");

      query.user = {
        $in: employeeIds,
      };
    }

    const [
      data,
      total,
    ] = await Promise.all([
      Leave.find(query)
        .populate(
          "user",
          "name email empId department jobTitle"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Leave.countDocuments(query),
    ]);

    return success(res, {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------
// PATCH /leaves/:id/review
// HR approves/rejects leave
// --------------------------------------------------

export const reviewLeave = async (req, res, next) => {
  try {
    const leaveId = req.params.id;

    if (!isValidObjectId(leaveId)) {
      return failure(
        res,
        400,
        "Invalid leave request ID"
      );
    }

    const {
      status,
      message = "",
    } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return failure(
        res,
        400,
        "status must be Approved or Rejected"
      );
    }

    if (
      typeof message !== "string"
    ) {
      return failure(
        res,
        400,
        "message must be a string"
      );
    }

    if (message.trim().length > 1000) {
      return failure(
        res,
        400,
        "message cannot exceed 1000 characters"
      );
    }

    // --------------------------------------------------
    // Find leave assigned to this HR
    // --------------------------------------------------

    let leave = await Leave.findOne({
      _id: leaveId,
      hrId: req.user._id,
    });

    // --------------------------------------------------
    // Compatibility fallback:
    //
    // Existing records may have hrId = null because
    // they were created before HR assignment was fixed.
    //
    // In that case, verify that the employee belongs to
    // this HR/company before assigning the request.
    // --------------------------------------------------

    if (!leave) {
      const existingLeave =
        await Leave.findById(leaveId)
          .populate(
            "user",
            "_id name email empId company head"
          );

      if (!existingLeave) {
        return failure(
          res,
          404,
          "Leave request not found"
        );
      }

      if (
        !existingLeave.user
      ) {
        return failure(
          res,
          404,
          "Employee associated with leave request was not found"
        );
      }

      const employee =
        existingLeave.user;

      const belongsToHr =
        String(employee.head || "") ===
          String(req.user._id) ||
        (
          employee.company &&
          req.user.company &&
          String(employee.company) ===
            String(req.user.company)
        );

      if (!belongsToHr) {
        return failure(
          res,
          404,
          "Leave request not found"
        );
      }

      if (
        existingLeave.hrId === null
      ) {
        existingLeave.hrId =
          req.user._id;

        await existingLeave.save();
      }

      leave = existingLeave;
    }

    if (leave.status !== "Pending") {
      return failure(
        res,
        409,
        "Only pending leave requests can be reviewed"
      );
    }

    // --------------------------------------------------
    // Prevent approval if another approved/pending
    // leave overlaps this request.
    // --------------------------------------------------

    if (status === "Approved") {
      const overlapping =
        await Leave.findOne({
          _id: {
            $ne: leave._id,
          },
          user: leave.user._id || leave.user,
          status: {
            $in: [
              "Approved",
              "Pending",
            ],
          },
          startDate: {
            $lte: leave.endDate,
          },
          endDate: {
            $gte: leave.startDate,
          },
        }).lean();

      if (overlapping) {
        return failure(
          res,
          409,
          "This leave overlaps another pending or approved leave"
        );
      }
    }

    leave.status = status;
    leave.message =
      message.trim() || null;

    await leave.save();

    // --------------------------------------------------
    // Notify employee
    // --------------------------------------------------

    try {
      await Notification.create({
        recipient: leave.user._id || leave.user,
        type:
          status === "Approved"
            ? "leave-approved"
            : "leave-rejected",
        title:
          status === "Approved"
            ? "Leave approved"
            : "Leave rejected",
        message:
          `Your leave request from ${leave.startDate} to ${leave.endDate} was ${status.toLowerCase()}.`,
        data: {
          leaveId: leave._id,
        },
      });
    } catch (notificationError) {
      console.error(
        "Leave review notification error:",
        notificationError.message
      );
    }

    // --------------------------------------------------
    // Optional email
    // --------------------------------------------------

    if (
      leave.user?.email
    ) {
      const emailMessage =
        `<p>Your leave request from ${leave.startDate} to ${leave.endDate} was ${status.toLowerCase()}.</p>`;

      sendMail(
        leave.user.email,
        `Leave ${status}`,
        emailMessage
      ).catch((emailError) => {
        console.error(
          "Leave email error:",
          emailError.message
        );
      });
    }

    return success(res, {
      message:
        `Leave ${status.toLowerCase()}`,
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};