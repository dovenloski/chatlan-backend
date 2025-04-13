
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("ChatLAN Backend funcionando");
});

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);
  socket.on("message", (data) => {
    io.emit("message", data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Servidor en puerto", PORT));
