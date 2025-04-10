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

const upload = multer({ dest: "uploads/" });
const configPath = path.join(__dirname, "config.json");

let config = {
  title: "ChatLAN",
  welcome: "¡Bienvenido al chat!",
  bg: "",
  bgColor: "#ffffff",
  clavePanel: "#acceso123"
};

// Cargar config existente si hay
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

app.use(express.static("uploads"));
app.use(express.json());

app.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  const fileStream = fs.createReadStream(filePath);
  const fileName = req.file.originalname;

  const formData = new FormData();
  formData.append("file", fileStream, fileName);
  formData.append("expires", "1d");
  formData.append("maxDownloads", "100");

  try {
    const response = await axios.post("https://file.io", formData, {
      headers: formData.getHeaders()
    });

    const fileUrl = response.data.link;
    io.emit("message", { file: fileUrl });
    res.sendStatus(200);
  } catch (err) {
    console.error("Error al subir a file.io:", err.message);
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
  console.log("Servidor ChatLAN corriendo...");
});
