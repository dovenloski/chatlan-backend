const socket = io("https://chatlan-backend.onrender.com");

const chatContainer = document.getElementById("chat-container");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const fileInput = document.getElementById("file-input");
const configPanel = document.getElementById("config-panel");
const themeToggle = document.getElementById("theme-toggle");

let username = "";
while (!username) {
  username = prompt("Ingresa tu nombre:");
}

function appendMessage(msgHTML) {
  const div = document.createElement("div");
  div.className = "bubble";
  div.innerHTML = msgHTML;
  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function isImageURL(url) {
  return url.match(/\.(jpg|jpeg|png|gif)$/i);
}

function isLink(text) {
  return /(https?:\/\/[^\s]+)/g.test(text);
}

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = messageInput.value.trim();
  if (!msg) return;

  if (msg === "#acceso123") {
    configPanel.style.display = "block";
    return;
  }

  socket.emit("message", { user: username, text: msg });
  messageInput.value = "";
});

socket.on("message", (data) => {
  const user = data.user || "Archivo";

  if (data.file && isImageURL(data.file)) {
    appendMessage('<strong>' + user + ':</strong><br><img src="' + data.file + '" style="max-width:200px;">');
  } else if (typeof data.file === "string" && data.file.trim() !== "") {
    appendMessage('<strong>' + user + ':</strong> <a href="' + data.file + '" target="_blank">' + data.file + '</a>');
  } else if (data.text && isLink(data.text)) {
    appendMessage('<strong>' + user + ':</strong> <a href="' + data.text + '" target="_blank">' + data.text + '</a>');
  } else if (data.text) {
    appendMessage('<strong>' + user + ':</strong> ' + data.text);
  }
});

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("https://api.gofile.io/uploadFile", {
      method: "POST",
      headers: {
        Authorization: "Bearer kiYd34LCQ6Ak9NRAqzcrycEh145VnCPm"
      },
      body: formData
    });
    const result = await response.json();
    console.log("Respuesta subida:", result);

    const fileUrl = result?.data?.directLink || result?.data?.downloadPage;
    if (fileUrl) {
      socket.emit("message", { user: username, file: fileUrl });
    }
  } catch (err) {
    console.error("Error al subir archivo:", err);
  }
});

document.getElementById("save-config").addEventListener("click", () => {
  const title = document.getElementById("config-title").value;
  const welcome = document.getElementById("config-welcome").value;
  const bg = document.getElementById("config-bg").value;
  const bgColor = document.getElementById("config-bgcolor").value;
  const newPassword = document.getElementById("config-pass").value;

  socket.emit("updateConfig", {
    title, welcome, bg,
    bgColor,
    clavePanel: newPassword
  });
});

socket.on("configUpdate", (cfg) => {
  document.getElementById("chat-title").innerText = cfg.title;
  chatContainer.style.backgroundImage = cfg.bg ? "url('" + cfg.bg + "')" : "none";
  chatContainer.style.backgroundColor = cfg.bgColor || "#ffffff";
});

themeToggle.addEventListener("click", () => {
  const body = document.body;
  const isLight = body.classList.contains("light");

  if (isLight) {
    body.classList.remove("light");
    body.classList.add("dark");
    themeToggle.textContent = "🌙";
  } else {
    body.classList.remove("dark");
    body.classList.add("light");
    themeToggle.textContent = "☀️";
  }
});
