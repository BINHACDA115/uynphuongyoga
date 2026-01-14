import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS_HASH = process.env.ADMIN_PASS_HASH;
const SECRET = process.env.JWT_SECRET;

// --- API đăng nhập ---
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Thiếu thông tin đăng nhập" });
  }

  if (username !== ADMIN_USER) {
    return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
  }

  const isMatch = await bcrypt.compare(password, ADMIN_PASS_HASH);
  if (!isMatch) {
    return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
  }

  const token = jwt.sign(
    { role: "admin" },
    SECRET,
    { expiresIn: "2h" }
  );

  res.json({ message: "Đăng nhập thành công", token });
});

// --- Middleware xác thực token ---
export const verifyToken = (req, res, next) => {
  const header = req.headers["authorization"];

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Chưa đăng nhập" });
  }

  const token = header.split(" ")[1];

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ error: "Token không hợp lệ hoặc hết hạn" });
    }

    req.user = decoded;
    next();
  });
};

export default router;
