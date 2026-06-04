// MongoDB bağlantısını ve User modelini doğrulayan basit test.
// Çalıştır:  node test-connection.js
// Başarılıysa veritabanına bir test kullanıcısı yazıp siler.
require("dns").setServers(["8.8.8.8", "8.8.4.4"]);
require("dotenv").config();
const mongoose = require("mongoose");
const User     = require("./models/User");


async function run() {
  if (!process.env.MONGO_URI) {
    console.error("HATA: .env dosyasında MONGO_URI tanımlı değil.");
    process.exit(1);
  }

  try {
    console.log("Bağlanılıyor...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ MongoDB bağlantısı başarılı.");

    // Test kullanıcısı oluştur
    const hash = await User.hashPassword("test1234");
    const suffix = Math.floor(Math.random() * 10000);
    const user = await User.create({
  username: "ajan_" + suffix,
  email: "test_" + suffix + "@fraktia.dev",
  passwordHash: hash
});

    console.log("✓ Test kullanıcısı yazıldı:", user.username);

    // Şifre doğrulama testi
    const ok = await user.verifyPassword("test1234");
    console.log("✓ Şifre doğrulama:", ok ? "çalışıyor" : "HATA");

    // Temizlik — test kullanıcısını sil
    await User.deleteOne({ _id: user._id });
    console.log("✓ Test kullanıcısı silindi (temizlik tamam).");

    console.log("\nHer şey çalışıyor! Auth sistemi MongoDB ile hazır.");
  } catch (err) {
    console.error("✗ HATA:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
