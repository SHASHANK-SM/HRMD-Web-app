import * as faceapi from "face-api.js";
import canvas from "canvas";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import moment from "moment-timezone";
import nodemailer from "nodemailer";

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let modelsLoaded = false;
let modelPromise;

export const getLocalDate = () => moment().tz(process.env.APP_TIMEZONE || "Asia/Kolkata").toDate();
export const getDateKey = (date = getLocalDate()) => moment(date).tz(process.env.APP_TIMEZONE || "Asia/Kolkata").format("YYYY-MM-DD");
export const getFormattedDate = (date = getLocalDate(), delim = "/") => moment(date).tz(process.env.APP_TIMEZONE || "Asia/Kolkata").format(`DD${delim}MM${delim}YYYY`);
export const getDayOfWeek = (date = getLocalDate()) => moment(date).tz(process.env.APP_TIMEZONE || "Asia/Kolkata").format("dddd").toLowerCase();
export const getMonthRange = (year, month) => {
  const start = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, process.env.APP_TIMEZONE || "Asia/Kolkata").startOf("day");
  return { start: start.toDate(), end: start.clone().endOf("month").toDate() };
};
export const workingHoursPerDay = () => Number(process.env.WORKING_HOURS_PER_DAY || 9);

const loadModels = async () => {
  if (modelsLoaded) return;
  if (!modelPromise) {
    const modelPath = join(__dirname, "..", "facemodals");
    modelPromise = Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath),
      faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
      faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
    ]).then(() => { modelsLoaded = true; });
  }
  await modelPromise;
};

export const matchFaces = async (imagePath, savedImagePath) => {
  if (!imagePath || !savedImagePath) return false;
  await loadModels();
  const [uploadedImage, savedImage] = await Promise.all([canvas.loadImage(imagePath), canvas.loadImage(savedImagePath)]);
  const [first, second] = await Promise.all([
    faceapi.detectAllFaces(savedImage).withFaceLandmarks().withFaceDescriptors(),
    faceapi.detectAllFaces(uploadedImage).withFaceLandmarks().withFaceDescriptors(),
  ]);
  if (!first.length || !second.length) return false;
  const matcher = new faceapi.FaceMatcher(first, Number(process.env.FACE_MATCH_THRESHOLD || 0.6));
  return matcher.findBestMatch(second[0].descriptor).label !== "unknown";
};

export const sendMail = async (to, subject, html, attachments = []) => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 465),
    secure: String(process.env.EMAIL_SECURE || "true") === "true",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  return transporter.sendMail({ from: process.env.EMAIL_FROM || process.env.EMAIL_USER, to, subject, html, attachments });
};
