import express from "express";
import jwt from "jsonwebtoken";


const router = express.Router();

// Cấu hình tài khoản cố định
const ADMIN_USER = "admin";
const ADMIN_PASS = "123456"; // bạn có thể đổi ở đây
const SECRET = "yoga_blog_admin_2025"; // secret để ký token

// --- API đăng nhập ---
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ user: "admin" }, SECRET, { expiresIn: "2h" });
    res.json({ message: "Đăng nhập thành công", token });
  } else {
    res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
  }
});

// --- Middleware xác thực token ---
export const verifyToken = (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "Chưa đăng nhập" });

  const token = header.split(" ")[1];
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token không hợp lệ hoặc hết hạn" });
    req.user = decoded;
    next();
  });
};

export default router;
