// MongoDB bağlantısını kuran modül.
// Geliştirmenin bu aşamasında Atlas henüz bağlı olmayabilir;
// o yüzden bağlantı yoksa sunucuyu çökertmek yerine uyarı verip devam ediyoruz.

const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI tanımlı değil — veritabanı olmadan devam ediliyor.");
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Arşiv açıldı — MongoDB bağlandı.");
    return true;
  } catch (err) {
    console.error("MongoDB bağlantısı kurulamadı:", err.message);
    return false;
  }
}

module.exports = connectDB;
