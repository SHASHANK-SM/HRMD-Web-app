import { sendMail } from "../lib/attendanceUtils.js";
export const sendEmails = async (user) => {
  if (!user?.email) return null;
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const url = `${baseUrl}/pass-change/${encodeURIComponent(user.empId)}/${encodeURIComponent(user.email)}/${encodeURIComponent(user.positionType || "employee")}/${user._id}`;
  return sendMail(user.email,"Employee Login Details",`<p>Dear ${user.name},</p><p>Your account has been created.</p><p><a href="${url}">Open HRMS</a></p>`);
};
