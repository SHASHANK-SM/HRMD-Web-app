import { Router } from "express";
import checkUser from "../middlewares/CkeckUser.js";
import { getSettings, updateSettings } from "../controllers/SettingsController.js";
const router=Router();
router.get("/",checkUser,getSettings); router.patch("/",checkUser,updateSettings);
export default router;
