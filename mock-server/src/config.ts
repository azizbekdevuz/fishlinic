import dotenv from "dotenv";
import path from "path";

dotenv.config();

export const PORT = Number(process.env.PORT) || 4000;
export const SERIAL_PATH = process.env.SERIAL_PATH || "auto";
export const SERIAL_BAUD = Number(process.env.SERIAL_BAUD || 9600);
export const AI_BASE_URL = process.env.AI_BASE_URL || "http://localhost:8000";

export const DEFAULT_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://fishlinic.vercel.app",
];

export const ALLOWED_ORIGINS = (() => {
  const envOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return envOrigins.length ? envOrigins : DEFAULT_ORIGINS;
})();

export const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, "data"));


