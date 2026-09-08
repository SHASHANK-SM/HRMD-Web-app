import { Router } from "express";
import checkUser from "../middlewares/CkeckUser.js";
import { listNotifications, markRead, markAllRead } from "../controllers/NotificationController.js";
const router=Router();
router.get("/",checkUser,listNotifications);
router.patch("/:id/read",checkUser,markRead);
router.patch("/read-all",checkUser,markAllRead);
export default router;
