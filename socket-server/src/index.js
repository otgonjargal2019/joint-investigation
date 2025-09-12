import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

import sequelize from "./config/database.js";
import { User, Message, Notification } from "./models/index.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Socket.IO server running!"));

// Listen for REST-triggered notification pushes
app.post("/notify-user", async (req, res) => {
  const { userId, title, content, relatedUrl } = req.body;
  if (!userId || !title)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const notification = await Notification.create({
      userId,
      title,
      content,
      relatedUrl,
    });

    // Emit to user via socket
    io.to(`user:${userId}`).emit("notification:new", notification);

    res.json({ success: true, notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  transports: ["websocket"],
});

// Database connection
sequelize
  .sync()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("DB connection error:", err));

// Socket auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token provided"));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    //console.log("Socket auth payload:", payload);
    socket.userId = payload.sub; //daraa solivol solih userId bolgoj
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// Connection
io.on("connection", (socket) => {
  console.log(`User connected: socketId=${socket.id}, userId=${socket.userId}`);
  socket.join(`user:${socket.userId}`);

  // Emit initial status
  socket.emit("connectionStatus", { status: "connected" });

  //-------------------------notification start-----------------------------------------

  // Send last 5 notifications
  socket.on("getLastNotifications", async (ack) => {
    try {
      const notifications = await Notification.findAll({
        where: { userId: socket.userId },
        order: [["createdAt", "DESC"]],
        limit: 5,
      });
      ack?.(notifications);
    } catch (err) {
      console.error("Failed to get notifications:", err);
      ack?.([]);
    }
  });

  // Fetch all notifications
  socket.on("getAllNotifications", async (ack) => {
    try {
      const notifications = await Notification.findAll({
        where: { userId: socket.userId },
        order: [["createdAt", "DESC"]],
      });
      ack?.(notifications);
    } catch (err) {
      console.error("Failed to get all notifications:", err);
      ack?.([]);
    }
  });

  // Mark notification as read
  socket.on("notifications:markRead", async (notifId, ack) => {
    try {
      const notif = await Notification.findByPk(notifId);
      if (!notif) return ack?.({ success: false, error: "Not found" });

      notif.isRead = true;
      await notif.save();

      const allNotifications = await Notification.findAll({
        where: { userId: socket.userId },
        order: [["createdAt", "DESC"]],
      });
      const lastNotifications = allNotifications.slice(0, 5);

      socket.emit("notifications:update", {
        allNotifications,
        lastNotifications,
      });

      ack?.({ success: true, notification: notif });
    } catch (err) {
      console.error(err);
      ack?.({ success: false });
    }
  });

  // Mark all notifications as read
  socket.on("notifications:markAllRead", async (ack) => {
    try {
      await Notification.update(
        { isRead: true },
        { where: { userId: socket.userId, isRead: false } }
      );
      const allNotifications = await Notification.findAll({
        where: { userId: socket.userId },
        order: [["createdAt", "DESC"]],
      });
      const lastNotifications = allNotifications.slice(0, 5);
      socket.emit("notifications:update", {
        allNotifications,
        lastNotifications,
      });
      ack?.({ success: true });
    } catch (err) {
      console.error(err);
      ack?.({ success: false });
    }
  });

  // Unread count
  socket.on("notifications:getUnreadCount", async (ack) => {
    try {
      const count = await Notification.count({
        where: { userId: socket.userId, isRead: false },
      });
      ack?.(count);
    } catch (err) {
      console.error(err);
      ack?.(0);
    }
  });
  //-------------------------notification end-----------------------------------------

  // Handle chat users
  socket.on("getChatUsers", async (ack) => {
    const userId = socket.userId;
    if (!userId) return ack?.([]);

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

      if (peerIds.size === 0) return ack?.([]);

      // 2. Fetch user details and last message for each peer
      const usersWithLastMessage = await Promise.all(
        Array.from(peerIds).map(async (peerId) => {
          const [lastMsg, unreadCount] = await Promise.all([
            Message.findOne({
              where: {
                [Op.or]: [
                  { senderId: userId, recipientId: peerId },
                  { senderId: peerId, recipientId: userId },
                ],
              },
              order: [["createdAt", "DESC"]],
              raw: true,
            }),
            Message.count({
              where: {
                senderId: peerId,
                recipientId: userId,
                isRead: false,
              },
            }),
          ]);

          const user = await User.findByPk(peerId, { raw: true });
          return {
            userId: user.userId,
            displayName: user.nameEn || user.nameKr || user.loginId,
            lastMessage: lastMsg?.content || null,
            lastMessageTime: lastMsg?.createdAt || null,
            hasUnreadMessages: unreadCount > 0,
          };
        })
      );

      ack?.(usersWithLastMessage);
    } catch (e) {
      console.error("getChatUsers error:", e);
      ack?.([]);
    }
  });

  // Search users
  socket.on("searchUsers", async (searchText, ack) => {
    const userId = socket.userId;
    if (!userId) return ack?.([]);

    const text = String(searchText || "").trim();
    if (!text) return ack([]);

    try {
      const users = await User.findAll({
        where: {
          userId: { [Op.not]: userId },
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

      ack?.(
        users.map((u) => ({
          userId: u.userId,
          displayName: u.nameEn || u.nameKr || u.loginId,
        }))
      );
    } catch (e) {
      console.error("searchUsers error:", err);
      ack?.([]);
    }
  });

  // Send message
  socket.on("sendDirectMessage", async ({ recipientId, content }, callback) => {
    const userId = socket.userId;
    if (!userId || !recipientId || !content) {
      callback?.({ error: "Invalid message data" });
      return;
    }

    try {
      const message = await Message.create({
        senderId: userId,
        recipientId,
        content,
        isRead: false, // explicitly set isRead to false for new messages
      });

      // Emit to sender
      io.to(`user:${userId}`).emit("directMessage", {
        ...message.toJSON(),
        isRead: true, // messages from self are always "read"
      });

      // Emit to recipient
      io.to(`user:${recipientId}`).emit("directMessage", {
        ...message.toJSON(),
        isRead: false,
      });

      callback?.(null, message); // success callback
    } catch (e) {
      console.error("sendDirectMessage error", e);
      callback?.({ error: "Failed to send message" });
    }
  });

  // Get history
  socket.on("getHistory", async ({ peerId, before, limit = 50 }, ack) => {
    const userId = socket.userId;
    if (!userId || !peerId) return ack?.([]);

    const where = {
      [Op.or]: [
        { senderId: userId, recipientId: peerId },
        { senderId: peerId, recipientId: userId },
      ],
    };
    if (before) {
      where.createdAt = { [Op.lt]: before };
    }

    try {
      const messages = await Message.findAll({
        where,
        order: [["createdAt", "DESC"]],
        limit,
        raw: true,
      });

      ack?.(messages);
    } catch (e) {
      console.error("getHistory error", e);
      ack?.([]);
    }
  });

  // mark messages as read
  socket.on("markMessagesAsRead", async ({ peerId }) => {
    const userId = socket.userId;
    try {
      const [updatedCount] = await Message.update(
        { isRead: true },
        {
          where: {
            senderId: peerId,
            recipientId: userId,
            isRead: false,
          },
        }
      );

      if (updatedCount > 0) {
        console.log(
          `Marked ${updatedCount} messages as read for user ${userId}`
        );
      }
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(
      `User disconnected: socketId=${socket.id}, userId=${socket.userId}, reason=${reason}`
    );
  });
});

server.listen(process.env.PORT || 3001, () =>
  console.log(`Socket.IO server running on port ${process.env.PORT || 3001}`)
);
