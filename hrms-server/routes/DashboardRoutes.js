import { Router } from "express";
import checkUser from "../middlewares/CkeckUser.js";
import allowRole from "../middlewares/AllowRole.js";
import { hrDashboard, employeeDashboard } from "../controllers/DashboardController.js";
const router=Router();
router.get("/hr",checkUser,allowRole("hr"),hrDashboard);
router.get("/employee",checkUser,allowRole("employee","manager"),employeeDashboard);
export default router;
