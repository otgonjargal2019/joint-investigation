import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database.js";
import { User, Message } from "./models/index.js";
import { Op, fn, literal } from "sequelize";

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

// No REST APIs — Socket.IO only

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

  // Get distinct peers a user has chatted with
  // Client: socket.emit('getPeers', { userId }, (peers) => { ... })
  socket.on("getPeers", async ({ userId }, ack) => {
    try {
      if (!userId) {
        if (typeof ack === "function") ack({ error: "userId is required" });
        return;
      }
      const rows = await Message.findAll({
        where: { [Op.or]: [{ senderId: userId }, { receiverId: userId }] },
        attributes: [
          [
            fn(
              "DISTINCT",
              literal(
                `CASE WHEN "sender_id" = ${userId} THEN "receiver_id" ELSE "sender_id" END`
              )
            ),
            "peerId",
          ],
        ],
        raw: true,
      });
      const peerIds = rows.map((r) => r.peerId).filter(Boolean);
      const peers = await User.findAll({ where: { id: { [Op.in]: peerIds } } });
      if (typeof ack === "function") ack(peers);
    } catch (e) {
      console.error("getPeers error", e);
      if (typeof ack === "function") ack({ error: "Failed to fetch peers" });
    }
  });

  // Get chat history between two users
  // Client: socket.emit('getHistory', { userA, userB }, (messages) => { ... })
  socket.on("getHistory", async ({ userA, userB }, ack) => {
    try {
      if (!userA || !userB) {
        if (typeof ack === "function")
          ack({ error: "userA and userB are required" });
        return;
      }
      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { senderId: userA, receiverId: userB },
            { senderId: userB, receiverId: userA },
          ],
        },
        order: [["createdAt", "ASC"]],
      });
      if (typeof ack === "function") ack(messages);
    } catch (e) {
      console.error("getHistory error", e);
      if (typeof ack === "function") ack({ error: "Failed to fetch history" });
    }
  });

  // Search users by username (case-insensitive)
  // Client: socket.emit('searchUsers', { username }, (users) => { ... })
  socket.on("searchUsers", async ({ username }, ack) => {
    try {
      if (!username) {
        if (typeof ack === "function") ack({ error: "username is required" });
        return;
      }
      const users = await User.findAll({
        where: { username: { [Op.iLike]: `%${username}%` } },
        limit: 50,
        order: [["username", "ASC"]],
      });
      if (typeof ack === "function") ack(users);
    } catch (e) {
      console.error("searchUsers error", e);
      if (typeof ack === "function") ack({ error: "Failed to search users" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(process.env.PORT, () =>
  console.log(`Socket.IO server running on port ${process.env.PORT}`)
);
