import { Router } from "express";
import checkUser from "../middlewares/CkeckUser.js";
import { getProfile, updateProfile, updateAddress, updateEmergencyContact } from "../controllers/ProfileController.js";
const router=Router();
router.get("/",checkUser,getProfile); router.patch("/",checkUser,updateProfile); router.put("/address",checkUser,updateAddress); router.put("/emergency-contact",checkUser,updateEmergencyContact);
export default router;
