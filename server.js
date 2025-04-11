const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  socket.on("message", (data) => {
    io.emit("message", data);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Servidor ChatLAN corriendo...");
});