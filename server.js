
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Configurar CORS para aceptar cualquier origen
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware necesarios
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Opcional si sirves archivos estáticos

// Socket.io
io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  socket.on("message", (data) => {
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });
});

// Escuchar en el puerto
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Servidor ChatLAN corriendo en el puerto", PORT);
});
