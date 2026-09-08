import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";

const checkUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authorization token missing or malformed" });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({ success: false, message: "Authorization token missing" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(payload.id).select("-__v");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    if (Number(payload.tokenVersion || 0) !== Number(user.tokenVersion || 0)) {
      return res.status(401).json({ success: false, message: "Session has been invalidated" });
    }
    if (user.empStatus === "inactive") {
      return res.status(403).json({ success: false, message: "Account is inactive" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    next(error);
  }
};

export default checkUser;
