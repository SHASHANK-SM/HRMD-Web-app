import mongoose from "mongoose";

export const isObjectId = (value) => mongoose.isValidObjectId(value);

export const validate = (validator) => (req, res, next) => {
  const result = validator(req);
  if (!result.valid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.errors,
    });
  }
  next();
};

export const required = (value) => value !== undefined && value !== null && String(value).trim() !== "";
export const email = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
export const positiveNumber = (value) => Number.isFinite(Number(value)) && Number(value) >= 0;
export const dateString = (value) => !Number.isNaN(new Date(value).getTime());
