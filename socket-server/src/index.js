import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database.js";
import { User, Message } from "./models/index.js";
import { Op } from "sequelize";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Socket.IO server running!"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

sequelize
  .sync()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("DB connection error:", err));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  let currentUserId = null;

  // Register user and return all other users
  socket.on("register", async (userId, ack) => {
    if (!userId) return;
    currentUserId = userId;
    socket.join(`user:${userId}`);
    console.log(`${socket.id} registered as user ${userId}`);

    try {
      const users = await User.findAll({
        where: { userId: { [Op.not]: userId } },
        attributes: ["userId", "nameEn", "nameKr", "loginId"],
        order: [["nameEn", "ASC"]],
        raw: true,
      });

      const mapped = users.map((u) => ({
        userId: u.userId,
        displayName: u.nameEn || u.nameKr || u.loginId,
      }));

      if (typeof ack === "function") ack(mapped);
    } catch (e) {
      console.error("getAllUsers error", e);
      if (typeof ack === "function") ack([]);
    }
  });

  // Send message
  socket.on("sendDirectMessage", async ({ senderId, recipientId, content }) => {
    if (!senderId || !recipientId || !content) return;
    try {
      const message = await Message.create({
        senderId,
        recipientId,
        content,
      });
      io.to(`user:${senderId}`).emit("directMessage", message);
      io.to(`user:${recipientId}`).emit("directMessage", message);
    } catch (e) {
      console.error("sendDirectMessage error", e);
    }
  });

  // Get chat history
  socket.on("getHistory", async ({ userA, userB }, ack) => {
    if (!userA || !userB) return ack([]);
    try {
      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { senderId: userA, recipientId: userB },
            { senderId: userB, recipientId: userA },
          ],
        },
        order: [["createdAt", "ASC"]],
        raw: true,
      });
      if (typeof ack === "function") ack(messages);
    } catch (e) {
      console.error("getHistory error", e);
      if (typeof ack === "function") ack([]);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(process.env.PORT || 3001, () =>
  console.log(`Socket.IO server running on port ${process.env.PORT || 3001}`)
);
