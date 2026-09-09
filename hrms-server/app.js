import "dotenv/config";

import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import mongoose from "mongoose";

import { connectDB } from "./lib/db.js";
import { errorHandler } from "./lib/InternalError.js";
import User from "./models/user.js";

import AuthRoute from "./routes/AuthRoute.js";
import HrRoute from "./routes/HrRoute.js";
import EmployeeRoute from "./routes/EmployeeRoutes.js";
import MailRoute from "./routes/MailRoute.js";
import AttendanceRoutes from "./routes/AttendanceRoutes.js";
import LeaveRoutes from "./routes/LeaveRoutes.js";
import PayrollRoutes from "./routes/PayrollRoutes.js";
import DocumentRoutes from "./routes/DocumentRoutes.js";
import NotificationRoutes from "./routes/NotificationRoutes.js";
import ReportRoutes from "./routes/ReportRoutes.js";
import DashboardRoutes from "./routes/DashboardRoutes.js";
import EmployeeManagementRoutes from "./routes/EmployeeManagementRoutes.js";
import ProfileRoutes from "./routes/ProfileRoutes.js";
import SettingsRoutes from "./routes/SettingsRoutes.js";

// ======================================================
// BASIC CONFIGURATION
// ======================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = Number(process.env.PORT || 5000);

// ======================================================
// DIRECTORIES
// ======================================================

const logDirectory = path.join(__dirname, "logs");

const uploadDirectory = path.resolve(
  process.env.UPLOAD_DIR || path.join(__dirname, "uploads"),
);

fs.mkdirSync(logDirectory, { recursive: true });

fs.mkdirSync(uploadDirectory, { recursive: true });

// ======================================================
// SECURITY
// ======================================================

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

// ======================================================
// CORS
// ======================================================

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && process.env.NODE_ENV !== "production") {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Accept",
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? (origin, callback) =>
            callback(null, !origin || allowedOrigins.includes(origin))
        : true,

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  }),
);

// ======================================================
// BODY PARSING
// ======================================================

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

// ======================================================
// LOGGING
// ======================================================

app.use(morgan("dev"));

const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, "access.log"),
  {
    flags: "a",
  },
);

app.use(
  morgan("combined", {
    stream: accessLogStream,
  }),
);

// ======================================================
// STATIC FILES
// ======================================================

app.use("/uploads", express.static(uploadDirectory));

// ======================================================
// ROOT / SYSTEM ROUTES
// ======================================================

app.get("/", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "HRMS API is running",
    data: {
      service: "hrms-server",
      version: "1.0.0",
    },
  });
});

app.get("/health", (_req, res) => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const dbState = mongoose.connection.readyState;

  const isDatabaseConnected = dbState === 1;

  return res.status(isDatabaseConnected ? 200 : 503).json({
    success: isDatabaseConnected,
    message: isDatabaseConnected
      ? "HRMS API is healthy"
      : "Database connection unavailable",

    data: {
      server: "running",
      database: states[dbState] || "unknown",
    },
  });
});

app.get("/getdate", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "Current date",
    data: new Date().toISOString(),
  });
});

// ======================================================
// API ROUTES
// ======================================================

app.use("/auth", AuthRoute);

app.use("/hr", HrRoute);

app.use("/employee", EmployeeRoute);

app.use("/mail", MailRoute);

app.use("/attendance", AttendanceRoutes);

app.use("/leaves", LeaveRoutes);

app.use("/payroll", PayrollRoutes);

app.use("/documents", DocumentRoutes);

app.use("/notifications", NotificationRoutes);

app.use("/reports", ReportRoutes);

app.use("/dashboard", DashboardRoutes);

app.use("/employees", EmployeeManagementRoutes);

app.use("/profile", ProfileRoutes);

app.use("/settings", SettingsRoutes);

// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
    data: {
      method: req.method,
      path: req.originalUrl,
    },
  });
});

// ======================================================
// CENTRAL ERROR HANDLER
// ======================================================

app.use(errorHandler);

// ======================================================
// DATABASE + SERVER STARTUP
// ======================================================

const ensureDemoUsers = async () => {
  try {
    const userCount = await User.countDocuments();

    if (userCount > 0) {
      return;
    }

    const hrUser = await User.create({
      name: "HR Admin",
      email: "hr@demo.com",
      password: "Admin@123",
      mobile: "9999999999",
      empId: "HR001",
      role: "hr",
      empStatus: "active",
      company: null,
    });

    await User.create({
      name: "Employee User",
      email: "employee@demo.com",
      password: "Emp@123",
      mobile: "8888888888",
      empId: "EMP001",
      role: "employee",
      empStatus: "active",
      head: hrUser._id,
      company: hrUser.company || null,
    });

    console.log("Demo HR and employee users created successfully.");
  } catch (error) {
    console.error("Demo user seeding failed:", error);
  }
};

const startServer = async () => {
  try {
    console.log("Starting HRMS server...");
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`MongoDB URI configured: ${Boolean(process.env.MONGO_URI)}`);

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    console.log("Connecting to MongoDB...");

    await connectDB(process.env.MONGO_URI);

    console.log("MongoDB connection completed.");

    if (process.env.SEED_DEMO_USERS === "true") {
      await ensureDemoUsers();
    }

    app.listen(PORT, () => {
      console.log("========================================");
      console.log(`HRMS server running on port ${PORT}`);
      console.log(`API: http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
      console.log("========================================");
    });
  } catch (error) {
    console.error("========================================");
    console.error("SERVER STARTUP FAILED");
    console.error(error);
    console.error("========================================");

    process.exit(1);
  }
};

// ======================================================
// START SERVER
// ======================================================

if (process.env.NODE_ENV !== "test") {
  startServer().catch((error) => {
    console.error("Unhandled startup error:", error);
    process.exit(1);
  });
}

export default app;

