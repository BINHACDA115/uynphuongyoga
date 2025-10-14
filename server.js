import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import blogRoutes from "./routes/blogRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = 5000;

// --- Kết nối MongoDB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ DB error:", err));

// --- Middleware ---
app.use(cors({
  origin: ["https://https://uynphuongyoga.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// --- Cho phép truy cập file ảnh upload ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Routes ---
app.use("/api/blogs", blogRoutes);

// --- Start Server ---
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

app.use("/api/auth", authRoutes);
