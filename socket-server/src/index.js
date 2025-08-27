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

  // Get users you've chatted with
  socket.on("getChatUsers", async (userId, ack) => {
    if (!userId) return;

    socket.userId = userId; // store userId on socket
    socket.join(`user:${userId}`);
    console.log(`${socket.id} joined as user ${userId}`);

    try {
      // 1. Find all unique userIds you have messages with
      const messages = await Message.findAll({
        where: { [Op.or]: [{ senderId: userId }, { recipientId: userId }] },
        attributes: ["senderId", "recipientId", "content", "createdAt"],
        raw: true,
      });

      const peerIds = new Set();
      messages.forEach((msg) => {
        if (msg.senderId !== userId) peerIds.add(msg.senderId);
        if (msg.recipientId !== userId) peerIds.add(msg.recipientId);
      });

      if (peerIds.size === 0) {
        if (typeof ack === "function") ack([]);
        return;
      }

      // 2. Fetch user details and last message for each peer
      const usersWithLastMessage = await Promise.all(
        Array.from(peerIds).map(async (peerId) => {
          const lastMsg = await Message.findOne({
            where: {
              [Op.or]: [
                { senderId: userId, recipientId: peerId },
                { senderId: peerId, recipientId: userId },
              ],
            },
            order: [["createdAt", "DESC"]],
            raw: true,
          });

          const user = await User.findByPk(peerId, { raw: true });
          return {
            userId: user.userId,
            displayName: user.nameEn || user.nameKr || user.loginId,
            lastMessage: lastMsg ? lastMsg.content : null,
            lastMessageTime: lastMsg ? lastMsg.createdAt : null,
          };
        })
      );

      if (typeof ack === "function") ack(usersWithLastMessage);
    } catch (e) {
      console.error("getChatUsers error:", e);
      if (typeof ack === "function") ack([]);
    }
  });

  socket.on("searchUsers", async (searchText, ack) => {
    if (!socket.userId) return;
    const text = String(searchText || "").trim();
    if (!text) return ack([]);

    try {
      const users = await User.findAll({
        where: {
          userId: { [Op.not]: socket.userId },
          [Op.or]: [
            { loginId: { [Op.iLike]: `%${text}%` } },
            { nameEn: { [Op.iLike]: `%${text}%` } },
            { nameKr: { [Op.iLike]: `%${text}%` } },
          ],
        },
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
      console.error("searchUsers error:", e);
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
