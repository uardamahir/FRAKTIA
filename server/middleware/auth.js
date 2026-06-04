// Korumalı route'ların bekçisi.
// İstek başlığındaki JWT'yi doğrular; geçerliyse req.userId'yi doldurup devam eder,
// geçersizse 401 döndürüp isteği keser.

const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  // Beklenen format: "Bearer <token>"
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Yetkilendirme gerekli" });
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId; // sonraki route bunu kullanır
    next();
  } catch (err) {
    return res.status(401).json({ error: "Geçersiz veya süresi dolmuş oturum" });
  }
}

module.exports = authMiddleware;
