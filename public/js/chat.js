/* eslint-disable quotes */
// eslint-disable-next-line no-undef
const socket = io.connect("https://95.88.107.166:443");

const message = document.getElementById("message-input");
const sendMsg = document.getElementById("send-message");
const user = document.getElementById("username-input");
const sendUser = document.getElementById("send-username");
const displayMsg = document.getElementById("display-message");
const typingLabel = document.getElementById("typing-label");
const chatWindow = document.getElementById("chat-window");
const usersCounter = document.getElementById("users-counter");
const msgErr = document.getElementById("message-error");
const userErr = document.getElementById("username-error");
const join = document.getElementById("you-joined");
const chat = document.getElementById("chat");
const login = document.getElementById("login-page");

let isAdmin = false;

sendUser.addEventListener("click", () => {
  if (user.value === null || user.value.trim().length === 0) {
    userErr.innerHTML = "🚨 Name is required!";
    return;
  }

  if (user.value === "admin-fw" || user.value.trim().length === 0) {
    isAdmin = true;
    user.value = "Falling Walls";
  }

  userErr.innerHTML = "";
  login.style.display = "none";
  chat.style.display = "block";
  join.innerHTML = "<p>You have joined the chat!<p>";
  socket.emit("new-user", user.value);
});

sendMsg.addEventListener("click", () => {
  if (message.value === null || message.value.trim().length === 0) {
    msgErr.innerHTML = "🚨 Message is required!";
    return;
  }

  socket.emit("new-message", {
    message: message.value,
    username: user.value,
  });
  message.value = "";
  msgErr.innerHTML = "";
});

message.addEventListener("keypress", () => {
  socket.emit("is-typing", user.value);
});

socket.on("user-connected", (username) => {
  displayMsg.innerHTML += `<p><strong>${username}</strong> has connected!</p>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

socket.on("broadcast", (number) => {
  usersCounter.innerHTML = number;
});

socket.on("delete", (id) => {
  document.getElementById(id).remove();
});

socket.on("new-message", (data) => {
  typingLabel.innerHTML = "";
  if (isAdmin) {
    displayMsg.innerHTML += `<p id='${data.messageId}'><strong>${
      data.username
    }</strong><em> at ${new Date().getHours()}:${new Date().getMinutes()}</em> : ${
      data.message
    }<button onclick="socket.emit('delete', this.parentElement.id)">delete</button></p>`;
  } else {
    displayMsg.innerHTML += `<p id='${data.messageId}'><strong>${
      data.username
    }</strong><em> at ${new Date().getHours()}:${new Date().getMinutes()}</em> : ${
      data.message
    }</p>`;
  }

  chatWindow.scrollTop = chatWindow.scrollHeight;
});

socket.on("is-typing", (username) => {
  typingLabel.innerHTML = `<p>${username} is typing...</p>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

socket.on("user-disconnected", (username) => {
  if (username == null) {
    displayMsg.innerHTML += "<p>Unlogged user has disconnected!</p>";
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } else {
    displayMsg.innerHTML += `<p><strong>${username}</strong> has disconnected!</p>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});
