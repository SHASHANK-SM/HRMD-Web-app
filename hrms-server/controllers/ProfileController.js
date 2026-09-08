import User from "../models/user.js";
import Address from "../models/EmployeeAddressModal.js";
import Emergency from "../models/EmployeeEmergencyContactModal.js";
import { success, failure } from "../lib/response.js";

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate("department", "title").populate("address").populate("emergencyContacts").select("-password").lean();
  return success(res, { data: user });
};
export const updateProfile = async (req, res) => {
  const allowed = ["name", "mobile", "gender", "dob", "maritalStatus", "nationality", "location"];
  const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  if (!Object.keys(data).length) return failure(res, 400, "No permitted profile fields supplied");
  const user = await User.findByIdAndUpdate(req.user._id, { $set: data }, { new: true, runValidators: true }).select("-password");
  return success(res, { message: "Profile updated successfully", data: user });
};
export const updateAddress = async (req, res) => { const data = await Address.findOneAndUpdate({ userId: req.user._id }, { $set: req.body, userId: req.user._id }, { new: true, upsert: true, runValidators: true }); await User.findByIdAndUpdate(req.user._id, { address: data._id }); return success(res, { message: "Address updated successfully", data }); };
export const updateEmergencyContact = async (req, res) => { const data = await Emergency.findOneAndUpdate({ userId: req.user._id }, { $set: { ...req.body, userId: req.user._id } }, { new: true, upsert: true, runValidators: true }); await User.findByIdAndUpdate(req.user._id, { emergencyContacts: data._id }); return success(res, { message: "Emergency contact updated successfully", data }); };
