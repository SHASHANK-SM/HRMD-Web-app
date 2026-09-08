import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const uploadDir = process.env.UPLOAD_DIR || "uploads";
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  },
});

const allowed = new Map([
  ["image/jpeg", [".jpg", ".jpeg"]],
  ["image/png", [".png"]],
  ["application/pdf", [".pdf"]],
]);

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const extensions = allowed.get(file.mimetype) || [];
  if (!extensions.includes(ext)) return cb(new Error("Only JPG, PNG and PDF files are allowed"));
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE || 5 * 1024 * 1024), files: 10 },
});

export const deleteFile = async (filePath) => {
  try { await fs.promises.unlink(filePath); } catch (error) { if (error.code !== "ENOENT") console.error(error); }
};
export const resolveUploadPath = (storedPath) => storedPath ? path.resolve(storedPath) : null;
export default upload;
