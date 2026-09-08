import User from "../models/user.js";
import { success } from "../lib/response.js";
export const getSettings=async(req,res)=>{const user=await User.findById(req.user._id).select("preferences").lean();return success(res,{data:user?.preferences||{}});};
export const updateSettings=async(req,res)=>{const preferences=req.body?.preferences ?? req.body;if(!preferences||typeof preferences!=="object"||Array.isArray(preferences))return res.status(400).json({success:false,message:"preferences must be an object"});const user=await User.findByIdAndUpdate(req.user._id,{preferences},{new:true}).select("preferences");return success(res,{message:"Settings updated successfully",data:user.preferences});};
