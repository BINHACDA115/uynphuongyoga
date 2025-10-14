import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Blog from "../models/Blog.js";
import { verifyToken } from "./authRoutes.js";



const router = express.Router();

// --- Đảm bảo thư mục uploads tồn tại ---
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📂 Tạo thư mục 'uploads' mới.");
}

// --- Cấu hình multer ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

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

// --- Thêm bài viết mới (kèm upload ảnh) ---
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const newBlog = new Blog({
      title: req.body.title,
      shortDescription: req.body.shortDescription,
      content: req.body.content,
      image: imageUrl
    });
    await newBlog.save();
    res.json({ message: "Thêm bài viết thành công", blog: newBlog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Cập nhật bài viết (có thể thay ảnh) ---
router.put("/:id", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Không tìm thấy bài viết" });

    // Nếu có ảnh mới → xóa ảnh cũ (nếu tồn tại)
    if (req.file && blog.image) {
      const oldPath = path.join(process.cwd(), blog.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        image: req.file ? `/uploads/${req.file.filename}` : blog.image
      },
      { new: true }
    );

    res.json({ message: "Cập nhật thành công", blog: updatedBlog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Xóa bài viết (và ảnh kèm theo) ---
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Không tìm thấy bài viết" });

    // Nếu có ảnh → xóa file trong uploads/
    if (blog.image) {
      const imgPath = path.join(process.cwd(), blog.image);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
        console.log(`🗑 Ảnh ${blog.image} đã bị xóa`);
      }
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa bài viết và ảnh kèm theo" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



export default router;
