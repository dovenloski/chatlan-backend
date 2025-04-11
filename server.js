
const express = require('express');
const http = require('http');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(express.json());

let config = {
  title: "ChatLAN",
  welcome: "Bienvenido a ChatLAN",
  bgImage: "",
  bgColor: "#000000",
  clavePanel: "#acceso123"
};

io.on('connection', (socket) => {
  socket.emit("configUpdate", config);

  socket.on("message", (data) => {
    io.emit("message", data);
  });

  socket.on("updateConfig", (newConfig) => {
    config = { ...config, ...newConfig };
    io.emit("configUpdate", config);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
