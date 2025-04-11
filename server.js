require('dotenv').config();
const express = require("express");
const http = require("http");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const upload = multer({ dest: "uploads/" });
const configPath = path.join(__dirname, "config.json");

let config = {
  title: "ChatLAN",
  welcome: "¡Bienvenido al chat!",
  bg: "",
  bgColor: "#ffffff",
  clavePanel: "#acceso123"
};

if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

app.use(express.static("uploads"));
app.use(express.json());

app.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  const fileName = req.file.originalname;

  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath), fileName);
    formData.append("token", process.env.GOFILE_TOKEN);

    const response = await axios.post("https://api.gofile.io/uploadFile", formData, {
      headers: formData.getHeaders()
    });

    console.log("Respuesta de GoFile:", response.data);

    const fileUrl = response.data?.data?.downloadPage;

    if (fileUrl) {
      io.emit("message", {
        user: "Archivo",
        file: fileUrl
      });
    } else {
      console.error("No se recibió enlace válido de GoFile.");
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Error al subir a GoFile:", err.message);
    res.sendStatus(500);
  } finally {
    fs.unlink(filePath, () => {});
  }
});

io.on("connection", (socket) => {
  socket.emit("configUpdate", config);

  socket.on("message", (data) => {
    io.emit("message", data);
  });

  socket.on("updateConfig", (newConfig) => {
    config = {
      ...config,
      ...newConfig,
      bgColor: newConfig.bgColor || config.bgColor,
      clavePanel: newConfig.clavePanel || config.clavePanel
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    io.emit("configUpdate", config);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Servidor ChatLAN 2.5 corriendo con autenticación GoFile...");
});
