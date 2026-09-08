import Notification from "../models/NotificationModal.js";
import { success, failure } from "../lib/response.js";

export const listNotifications = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const [data, total, unread] = await Promise.all([
    Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Notification.countDocuments({ recipient: req.user._id }), Notification.countDocuments({ recipient: req.user._id, read: false }),
  ]);
  return success(res, { data, meta: { page, limit, total, unread, totalPages: Math.ceil(total / limit) } });
};
export const markRead = async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { read: true }, { new: true });
  if (!n) return failure(res, 404, "Notification not found");
  return success(res, { message: "Notification marked as read", data: n });
};
export const markAllRead = async (req, res) => { const result = await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true }); return success(res, { message: "Notifications marked as read", data: { updated: result.modifiedCount } }); };
