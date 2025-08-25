// Install dependencies first:
// npm init -y
// npm install socket.io express

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for testing
  },
});

app.get("/", (req, res) => {
  res.send("Hello World from Express + Socket.IO");
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.emit("hello", "Hello from Socket.IO server!");

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Socket.IO server running on http://localhost:3000");
});
