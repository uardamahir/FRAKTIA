// Kayıt, giriş ve oturum kontrolü.
// Başarılı kayıt/girişte bir JWT üretip istemciye veriyoruz;
// istemci bunu saklayıp sonraki isteklerde "Bearer" başlığıyla gönderiyor.

const express = require("express");
const jwt     = require("jsonwebtoken");
const User    = require("../models/User");
const auth    = require("../middleware/auth");

const router = express.Router();

// Token üreten küçük yardımcı — kimliği 7 gün geçerli imzalıyoruz
function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/auth/register — yeni hesap
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Tüm alanlar zorunlu" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Şifre en az 6 karakter olmalı" });
    }

    // Aynı kullanıcı adı veya e-posta var mı?
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(409).json({ error: "Bu kullanıcı adı veya e-posta zaten kayıtlı" });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ username, email, passwordHash });

    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, totalScore: user.totalScore }
    });
  } catch (err) {
    res.status(500).json({ error: "Kayıt sırasında bir hata oluştu" });
  }
});

// POST /api/auth/login — mevcut hesapla giriş
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "E-posta ve şifre zorunlu" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "E-posta veya şifre hatalı" });
    }

    const valid = await user.verifyPassword(password);
    if (!valid) {
      return res.status(401).json({ error: "E-posta veya şifre hatalı" });
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, totalScore: user.totalScore }
    });
  } catch (err) {
    res.status(500).json({ error: "Giriş sırasında bir hata oluştu" });
  }
});

// GET /api/auth/me — token geçerli mi, kim olduğumu döndür (korumalı)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});

module.exports = router;
