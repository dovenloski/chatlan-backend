
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

// Ruta para subir la imagen de fondo
app.post('/upload-background', upload.single('background'), (req, res) => {
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, 'public', 'fondo.jpg');

  fs.rename(tempPath, targetPath, err => {
    if (err) {
      console.error("Error al mover el archivo:", err);
      return res.sendStatus(500);
    }
    res.sendStatus(200);
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
