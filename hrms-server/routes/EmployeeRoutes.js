import { Router } from "express";
import checkUser from "../middlewares/CkeckUser.js";
import allowRole from "../middlewares/AllowRole.js";
import upload from "../lib/multerConfig.js";
import { addTimeSheet,getTimeSheet,getAttendance,getPaySlipsForEmpoyee,leavesAdded,getleaves,getTods } from "../controllers/EmployeeController.js";
const router=Router();
router.use(checkUser,allowRole("employee","manager"));
router.post("/updatetimesheet",addTimeSheet); router.get("/gettimesheet/:week",getTimeSheet); router.get("/getattendance",getAttendance); router.get("/payslips",getPaySlipsForEmpoyee); router.post("/leaves",upload.single("document"),leavesAdded); router.get("/leaves",getleaves); router.get("/todos",getTods);
export default router;
