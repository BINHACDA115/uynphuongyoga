import express from "express";
import multer from "multer";
import Blog from "../models/Blog.js";
import { verifyToken } from "./authRoutes.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const router = express.Router();

// ⚙️ Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ⚙️ Cấu hình Multer (tạo file tạm)
const upload = multer({ dest: "temp/" });

/* ==========================
   🟢 API QUẢN LÝ BÀI VIẾT BLOG
   ========================== */

// --- Lấy tất cả bài viết ---
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Lấy 1 bài viết theo ID ---
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Không tìm thấy bài viết" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- 🆕 Thêm bài viết mới (upload lên Cloudinary) ---
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "uyenphuongyoga",
      });
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path); // xóa file tạm
    }

    const blog = new Blog({
      title: req.body.title,
      shortDescription: req.body.shortDescription,
      content: req.body.content,
      image: imageUrl,
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    console.error("❌ Upload Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- ✏️ Cập nhật bài viết ---
router.put("/:id", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Không tìm thấy bài viết" });

    let imageUrl = blog.image;

    // Nếu có ảnh mới → upload lên Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "uyenphuongyoga",
      });
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    blog.title = req.body.title;
    blog.shortDescription = req.body.shortDescription;
    blog.content = req.body.content;
    blog.image = imageUrl;

    await blog.save();
    res.json({ message: "✅ Cập nhật thành công", blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// --- 🗑 Xóa bài viết ---
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Không tìm thấy bài viết" });

    // Nếu ảnh nằm trên Cloudinary, xoá luôn
    if (blog.image && blog.image.includes("cloudinary.com")) {
      const parts = blog.image.split("/");
      const publicId = parts.slice(-2).join("/").split(".")[0]; // lấy folder + tên file
      await cloudinary.uploader.destroy(publicId);
      console.log("🗑 Ảnh Cloudinary đã bị xóa:", publicId);
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "✅ Đã xóa bài viết và ảnh Cloudinary (nếu có)" });
  } catch (error) {
    console.error("❌ Delete Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
