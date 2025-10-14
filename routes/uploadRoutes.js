import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const upload = multer({ dest: "temp/" });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Không có file được gửi lên" });

    const result = await cloudinary.uploader.upload(req.file.path, { folder: "yoga-blog" });
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      imageUrl: result.secure_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ⚙️ Đây là dòng quan trọng nhất
export default router;
