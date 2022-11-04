/* eslint-disable prefer-arrow-callback */
/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable import/no-unresolved */
const path = require("path");
const express = require("express");

const app = express();
const server = require("http").Server(app);
const socket = require("socket.io");

const mysql = require("mysql");

const io = socket(server);

const PID = process.pid;
const PORT = process.env.PORT || 3000;
const users = {};
let usersNum = 0;

const connection = mysql.createConnection({
  host: "wp562.webpack.hosteurope.de",
  user: "db13478678-db134",
  password: "Buz97913",
  database: "db13478678-chat",
});

connection.connect();

setInterval(function () {
  connection.query("SELECT 1");
}, 5000);

function makeId(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.use(express.static(path.join(__dirname, "public")));

// eslint-disable-next-line no-shadow
io.on("connection", (socket) => {
  console.log(`The socket is connected! Socket id: ${socket.id}`);
  usersNum += 1;

  socket.on("new-user", (username) => {
    io.emit("broadcast", `Online: ${usersNum}`);
    users[socket.id] = username;
    connection.query(
      "SELECT * FROM `messages` ORDER BY id ASC LIMIT 50",
      function (error, results, fields) {
        results.forEach((element) => {
          io.to(socket.id).emit("new-message", element);
        });
      }
    );
    socket.broadcast.emit("user-connected", username);
  });

  socket.on("new-message", (data) => {
    const message = { ...data, messageId: makeId(10) };
    const query = connection.query(
      "INSERT INTO messages SET ?",
      message,
      // eslint-disable-next-line prefer-arrow-callback
      function (error) {
        if (error) throw error;
        // Neat!
      }
    );
    console.log(query.sql); // INSERT INTO posts SET `id` = 1, `title` = 'Hello MySQL'
    io.emit("new-message", message);
  });

  socket.on("delete", (data) => {
    connection.query(
      "DELETE FROM `messages` WHERE `messageId` = ?",
      [data],
      function (error, results, fields) {
        if (error) throw error;
        io.emit("delete", data);
      }
    );
  });

  socket.on("is-typing", (username) => {
    socket.broadcast.emit("is-typing", username);
  });

  socket.on("disconnect", () => {
    usersNum -= 1;
    io.emit("broadcast", `Online: ${usersNum}`);
    socket.broadcast.emit("user-disconnected", users[socket.id]);
    delete users[socket.id];
  });
});

server.listen(PORT, () => {
  console.log(
    `The server is Listening on http://localhost:${PORT} \nPID: ${PID}\n`
  );
});
