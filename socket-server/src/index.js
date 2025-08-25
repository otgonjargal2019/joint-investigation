import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database.js";
import { User, Message } from "./models/index.js";
import {
  sendMessageHandler,
  getPeersHandler,
  getHistoryHandler,
  searchUsersHandler,
} from "./routes/chat.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

// Connect to database
sequelize
  .sync()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("DB connection error:", err));

// REST APIs
app.post("/api/chat/send", sendMessageHandler);
app.get("/api/chat/peers/:userId", getPeersHandler);
app.get("/api/chat/history", getHistoryHandler);
app.get("/api/users/search", searchUsersHandler);

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Users can register their userId to receive DMs in a personal room
  socket.on("register", (userId) => {
    if (!userId) return;
    socket.join(`user:${userId}`);
    console.log(`${socket.id} registered as user ${userId}`);
  });

  // Direct message event: { senderId, receiverId, content }
  socket.on("sendDirectMessage", async ({ senderId, receiverId, content }) => {
    if (!senderId || !receiverId || !content) return;
    try {
      const message = await Message.create({ senderId, receiverId, content });
      // emit to both participants
      io.to(`user:${senderId}`).emit("directMessage", message);
      io.to(`user:${receiverId}`).emit("directMessage", message);
    } catch (e) {
      console.error("sendDirectMessage error", e);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(process.env.PORT, () =>
  console.log(`Socket.IO server running on port ${process.env.PORT}`)
);
