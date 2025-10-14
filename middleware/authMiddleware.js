import jwt from "jsonwebtoken";

const SECRET = "supersecret_yogablog_2025";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Không có token" });

  const token = authHeader.split(" ")[1]; // bỏ chữ 'Bearer'
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token không hợp lệ hoặc hết hạn" });
    req.user = user;
    next();
  });
};
