import { Router } from "express";
import checkUser from "../middlewares/CkeckUser.js";
import allowRole from "../middlewares/AllowRole.js";
import { createMailTemp,getWelcomeMail,updateWelcomeMail } from "../controllers/MailController.js";
const router=Router();
router.use(checkUser,allowRole("hr"));
router.post("/template",createMailTemp); router.get("/welcome-mail/:templateName/id/:id",getWelcomeMail); router.patch("/welcome-mail/:templateName/id/:id",updateWelcomeMail);
export default router;
