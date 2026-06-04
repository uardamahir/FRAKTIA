// Fraktia'nın kalbi burada atıyor.
// Express HTTP isteklerini, Socket.io ise kalıcı bağlantıları yönetiyor —
// ikisi de aynı Node.js sürecinde, aynı port üzerinde çalışıyor.

const express    = require("express");
const http       = require("http");
const { Server } = require("socket.io");
const cors       = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app        = express();
const httpServer = http.createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

// Sunucunun ayakta olup olmadığını anlamak için basit bir sağlık kontrolü
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Fraktia sunucusu çalışıyor" });
});

app.use("/api/auth", require("./routes/auth"));
// app.use("/api/lore",   require("./routes/lore"));   // Faz 3
// app.use("/api/game",   require("./routes/game"));   // Faz 4
// app.use("/api/scores", require("./routes/scores")); // Faz 4

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || "*" }
});

// Şimdilik sadece bağlantıyı log'luyoruz; oda mantığı Faz 4'te gelecek
io.on("connection", (socket) => {
  console.log(`Bir ajan bağlandı: ${socket.id}`);
  socket.on("disconnect", () => console.log(`Ajan ayrıldı: ${socket.id}`));
});

const PORT = process.env.PORT || 5000;

// Önce veritabanına bağlanmayı dene, sonra sunucuyu başlat
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Fraktia sunucusu dinliyor — port ${PORT}`);
  });
});

module.exports = { app, httpServer }; // testler için dışa aktarıyoruz
