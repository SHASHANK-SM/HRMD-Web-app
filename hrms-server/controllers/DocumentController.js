import fs from "fs";
import path from "path";
import Document from "../models/EmployeeDocumentModal.js";
import User from "../models/user.js";
import { failure, success } from "../lib/response.js";
import { deleteFile } from "../lib/multerConfig.js";

const allowedTypes = new Set(["resume", "id-proof", "certificate", "offer-joining", "experience-letter", "profile-photo", "other"]);
const ownerOrHr = async (req, id) => req.user.role === "hr" ? User.findOne({ _id: id, head: req.user._id }) : String(id) === String(req.user._id) ? User.findById(req.user._id).select("_id") : null;

export const uploadDocument = async (req, res) => {
  const userId = req.user.role === "hr" ? req.body.userId : req.user._id;
  if (!userId || !req.file) return failure(res, 400, "userId and file are required");
  if (!await ownerOrHr(req, userId)) return failure(res, 403, "You cannot manage documents for this employee");
  const documentType = req.body.documentType || "other";
  if (!allowedTypes.has(documentType)) { await deleteFile(req.file.path); return failure(res, 400, "Invalid document type"); }
  const doc = await Document.create({ documentName: req.body.documentName || req.file.originalname, documentType, originalName: req.file.originalname, path: req.file.path, mimeType: req.file.mimetype, size: req.file.size, userId });
  return success(res, { status: 201, message: "Document uploaded successfully", data: doc });
};

export const listDocuments = async (req, res) => {
  const userId = req.user.role === "hr" ? req.params.userId : req.user._id;
  if (!await ownerOrHr(req, userId)) return failure(res, 403, "You cannot view these documents");
  const query = { userId };
  if (req.query.documentType) query.documentType = req.query.documentType;
  if (req.query.search?.trim()) {
    const search = req.query.search.trim();
    query.$or = [
      { documentName: { $regex: search, $options: "i" } },
      { originalName: { $regex: search, $options: "i" } },
      { documentType: { $regex: search, $options: "i" } },
    ];
  }
  const data = await Document.find(query).sort({ createdAt: -1 }).lean();
  return success(res, { data });
};

export const downloadDocument = async (req, res) => {
  const doc = await Document.findById(req.params.id).lean();
  if (!doc) return failure(res, 404, "Document not found");
  if (!await ownerOrHr(req, doc.userId)) return failure(res, 403, "You cannot access this document");
  if (!fs.existsSync(path.resolve(doc.path))) return failure(res, 404, "Document file not found");
  res.download(path.resolve(doc.path), doc.originalName);
};

export const replaceDocument = async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return failure(res, 404, "Document not found");
  if (!await ownerOrHr(req, doc.userId)) return failure(res, 403, "You cannot replace this document");
  if (!req.file) return failure(res, 400, "Replacement file is required");
  const oldPath = doc.path;
  doc.originalName = req.file.originalname; doc.path = req.file.path; doc.mimeType = req.file.mimetype; doc.size = req.file.size;
  if (req.body.documentName) doc.documentName = req.body.documentName;
  await doc.save(); await deleteFile(oldPath);
  return success(res, { message: "Document replaced successfully", data: doc });
};

export const deleteDocument = async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return failure(res, 404, "Document not found");
  if (req.user.role !== "hr" && String(doc.userId) !== String(req.user._id)) return failure(res, 403, "You cannot delete this document");
  if (req.user.role === "hr" && !(await ownerOrHr(req, doc.userId))) return failure(res, 403, "You cannot delete this document");
  await Document.deleteOne({ _id: doc._id }); await deleteFile(doc.path);
  return success(res, { message: "Document deleted successfully" });
};
