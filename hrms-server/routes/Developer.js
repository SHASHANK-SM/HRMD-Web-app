import { Router } from "express";
import checkUser from "../middlewares/CkeckUser.js";
import allowRole from "../middlewares/AllowRole.js";
import User from "../models/user.js";
import { success, failure } from "../lib/response.js";

const router = Router();

/**
 * POST /mail/add-new-company-hr
 *
 * Creates a new HR user for the current HR's company.
 *
 * Authentication:
 * - Required
 * - HR role required
 */
router.post(
  "/add-new-company-hr",
  checkUser,
  allowRole("hr"),
  async (req, res, next) => {
    try {
      const {
        name,
        empId,
        password,
        dob,
        gender,
        mobile,
        email,
      } = req.body;

      // --------------------------------------------------
      // Required field validation
      // --------------------------------------------------

      if (!name?.trim()) {
        return failure(
          res,
          400,
          "Name is required"
        );
      }

      if (!empId?.trim()) {
        return failure(
          res,
          400,
          "Employee ID is required"
        );
      }

      if (!email?.trim()) {
        return failure(
          res,
          400,
          "Email is required"
        );
      }

      if (!password) {
        return failure(
          res,
          400,
          "Password is required"
        );
      }

      if (!mobile?.trim()) {
        return failure(
          res,
          400,
          "Mobile number is required"
        );
      }

      // --------------------------------------------------
      // Basic email validation
      // --------------------------------------------------

      const normalizedEmail =
        email.trim().toLowerCase();

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return failure(
          res,
          400,
          "Invalid email address"
        );
      }

      // --------------------------------------------------
      // Password validation
      // --------------------------------------------------

      if (password.length < 6) {
        return failure(
          res,
          400,
          "Password must contain at least 6 characters"
        );
      }

      // --------------------------------------------------
      // Check whether email already exists
      // --------------------------------------------------

      const existingEmail =
        await User.findOne({
          email: normalizedEmail,
        }).select("_id email empId");

      if (existingEmail) {
        return failure(
          res,
          409,
          "HR with this email already exists"
        );
      }

      // --------------------------------------------------
      // Check whether employee ID already exists
      // --------------------------------------------------

      const normalizedEmpId =
        empId.trim();

      const existingEmpId =
        await User.findOne({
          empId: normalizedEmpId,
        }).select("_id email empId");

      if (existingEmpId) {
        return failure(
          res,
          409,
          "Employee ID already exists"
        );
      }

      // --------------------------------------------------
      // Company
      //
      // Do NOT allow the requesting HR to create an HR
      // for an arbitrary company supplied by the client.
      //
      // Use the authenticated user's company.
      // --------------------------------------------------

      if (!req.user.company) {
        return failure(
          res,
          400,
          "Your HR account is not associated with a company"
        );
      }

      // --------------------------------------------------
      // Create HR
      //
      // Password is intentionally passed to the model.
      // Your existing User model should handle bcrypt
      // hashing through its password middleware.
      // --------------------------------------------------

      const newUser = new User({
        name: name.trim(),
        email: normalizedEmail,
        password,
        mobile: mobile.trim(),
        empId: normalizedEmpId,
        role: "hr",
        company: req.user.company,

        ...(dob ? { dob } : {}),
        ...(gender ? { gender } : {}),
      });

      await newUser.save();

      // --------------------------------------------------
      // Remove sensitive fields from response
      // --------------------------------------------------

      const userResponse =
        newUser.toObject();

      delete userResponse.password;
      delete userResponse.__v;
      delete userResponse.tokenVersion;

      return success(res, {
        status: 201,
        message: "HR created successfully",
        data: {
          user: userResponse,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;