import fs from "fs";
import path from "path";

/**
 * Safely write an error to the daily log file.
 * Logging failures must never crash the application.
 */
const logErrorToFile = (req, error) => {
  try {
    const logDir = path.join(process.cwd(), "logs");

    fs.mkdirSync(logDir, {
      recursive: true,
    });

    const date = new Date().toISOString().slice(0, 10);

    const logFile = path.join(
      logDir,
      `errors-${date}.log`
    );

    const timestamp = new Date().toISOString();

    const method = req?.method || "UNKNOWN";

    const url =
      req?.originalUrl ||
      req?.url ||
      "UNKNOWN";

    const stack =
      error?.stack ||
      error?.message ||
      String(error);

    const logMessage =
      `[${timestamp}] ${method} ${url}\n${stack}\n\n`;

    fs.appendFileSync(
      logFile,
      logMessage,
      "utf8"
    );
  } catch (logError) {
    // Logging failure must never crash the API.
    console.error(
      "Failed to write error log:",
      logError
    );
  }
};

/**
 * Manually handle an internal error.
 *
 * Kept for compatibility with existing controllers
 * that already import ThrowInternalError.
 */
export const ThrowInternalError = (
  req,
  res,
  error
) => {
  console.error(
    "Internal server error:",
    error
  );

  logErrorToFile(req, error);

  if (res.headersSent) {
    return;
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

/**
 * Central Express error-handling middleware.
 *
 * IMPORTANT:
 * This middleware must be registered AFTER
 * all routes in app.js.
 */
export const errorHandler = (
  err,
  req,
  res,
  next
) => {
  console.error(
    `[${new Date().toISOString()}]`,
    err
  );

  logErrorToFile(req, err);

  /**
   * If Express has already started sending the response,
   * pass the error to the next error handler.
   *
   * This also ensures that the Express `next` parameter
   * is properly used.
   */
  if (res.headersSent) {
    return next(err);
  }

  // --------------------------------------------------
  // Mongoose validation error
  // --------------------------------------------------

  if (err?.name === "ValidationError") {
    const errors = {};

    for (const [field, validationError] of Object.entries(
      err.errors || {}
    )) {
      errors[field] =
        validationError?.message ||
        "Invalid value";
    }

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // --------------------------------------------------
  // MongoDB duplicate key error
  // --------------------------------------------------

  if (err?.code === 11000) {
    const duplicateFields =
      err.keyValue || {};

    return res.status(409).json({
      success: false,
      message:
        "A record with the same unique value already exists",
      errors: duplicateFields,
    });
  }

  // --------------------------------------------------
  // Invalid MongoDB ObjectId / CastError
  // --------------------------------------------------

  if (err?.name === "CastError") {
    return res.status(400).json({
      success: false,
      message:
        "Invalid identifier or value",
    });
  }

  // --------------------------------------------------
  // Multer errors
  // --------------------------------------------------

  if (err?.name === "MulterError") {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(413).json({
          success: false,
          message:
            "Uploaded file is too large",
        });

      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message:
            "Too many files uploaded",
        });

      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message:
            "Unexpected file field",
        });

      case "LIMIT_FIELD_COUNT":
        return res.status(400).json({
          success: false,
          message:
            "Too many form fields",
        });

      default:
        return res.status(400).json({
          success: false,
          message:
            err.message ||
            "File upload failed",
        });
    }
  }

  // --------------------------------------------------
  // Invalid JSON request body
  // --------------------------------------------------

  if (
    err?.type ===
    "entity.parse.failed"
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid JSON request body",
    });
  }

  // --------------------------------------------------
  // Request body too large
  // --------------------------------------------------

  if (
    err?.type ===
    "entity.too.large"
  ) {
    return res.status(413).json({
      success: false,
      message:
        "Request body is too large",
    });
  }

  // --------------------------------------------------
  // CORS error
  // --------------------------------------------------

  if (
    err?.message ===
    "CORS origin not allowed"
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Request origin is not allowed",
    });
  }

  // --------------------------------------------------
  // Custom application errors
  // --------------------------------------------------

  const statusCode =
    Number.isInteger(err?.statusCode)
      ? err.statusCode
      : Number.isInteger(err?.status)
        ? err.status
        : 500;

  // Prevent invalid HTTP status codes.
  const safeStatus =
    statusCode >= 400 &&
    statusCode <= 599
      ? statusCode
      : 500;

  // --------------------------------------------------
  // Unexpected internal server error
  // --------------------------------------------------

  if (safeStatus === 500) {
    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }

  // --------------------------------------------------
  // Known application error
  // --------------------------------------------------

  return res.status(safeStatus).json({
    success: false,
    message:
      err?.message ||
      "Request failed",
  });
};