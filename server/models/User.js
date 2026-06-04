// Bir oyuncuyu temsil eden MongoDB şeması.
// Şifreyi asla düz metin tutmuyoruz; kaydetmeden önce bcrypt ile hash'liyoruz.

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Kullanıcı adı zorunlu"],
      unique: true,
      trim: true,
      minlength: [3, "Kullanıcı adı en az 3 karakter olmalı"],
      maxlength: [20, "Kullanıcı adı en fazla 20 karakter olabilir"]
    },
    email: {
      type: String,
      required: [true, "E-posta zorunlu"],
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    // Oyuncunun toplam puanı — leaderboard için burada özetlenir
    totalScore: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true } // createdAt ve updatedAt otomatik eklenir
);

// Düz şifreyi alıp hash'i kaydeden yardımcı (statik metod)
userSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

// Girişte şifreyi doğrulayan örnek metod
userSchema.methods.verifyPassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
