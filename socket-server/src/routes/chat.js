import { Op, col, fn, literal } from "sequelize";
import { Message, User } from "../models/index.js";

// Send a message between two users
// POST /api/chat/send
// body: { senderId, receiverId, content }
export async function sendMessageHandler(req, res) {
  try {
    const { senderId, receiverId, content } = req.body;
    if (!senderId || !receiverId || !content) {
      return res
        .status(400)
        .json({ message: "senderId, receiverId and content are required" });
    }

    const message = await Message.create({ senderId, receiverId, content });
    return res.status(201).json(message);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to send message" });
  }
}

// Get the list of users a specific user has chatted with
// GET /api/chat/peers/:userId
export async function getPeersHandler(req, res) {
  try {
    const { userId } = req.params;
    // Find distinct counterpart userIds from messages
    const rows = await Message.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
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
    return res.json(peers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch peers" });
  }
}

// Get previous chat history between two users
// GET /api/chat/history?userA=1&userB=2
export async function getHistoryHandler(req, res) {
  try {
    const { userA, userB } = req.query;
    if (!userA || !userB) {
      return res.status(400).json({ message: "userA and userB are required" });
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
    return res.json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch history" });
  }
}

// Search users by username (case-insensitive)
// GET /api/users/search?username=foo
export async function searchUsersHandler(req, res) {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ message: "username is required" });
    }
    const users = await User.findAll({
      where: {
        username: { [Op.iLike]: `%${username}%` },
      },
      limit: 50,
      order: [["username", "ASC"]],
    });
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to search users" });
  }
}
