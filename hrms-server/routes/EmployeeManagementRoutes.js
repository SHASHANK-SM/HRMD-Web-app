import { Router } from "express";
import checkUser from "../middlewares/CkeckUser.js";
import allowRole from "../middlewares/AllowRole.js";
import { listEmployees,getEmployee,createEmployee,updateEmployee,changeStatus,updateAddress,updateEmergency,departments,createDepartment,updateDepartment,deleteDepartment } from "../controllers/EmployeeManagementController.js";
const router=Router();
router.use(checkUser,allowRole("hr"));
router.get("/",listEmployees); router.get("/:id",getEmployee); router.post("/",createEmployee); router.patch("/:id",updateEmployee); router.patch("/:id/status",changeStatus); router.put("/:id/address",updateAddress); router.post("/:id/emergency-contact",updateEmergency);
router.get("/departments/list",departments); router.post("/departments",createDepartment); router.patch("/departments/:id",updateDepartment); router.delete("/departments/:id",deleteDepartment);
export default router;
