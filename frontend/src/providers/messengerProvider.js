"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./authProviders";

const MessengerContext = createContext();

export const MessengerProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [unreadUsersCount, setUnreadUsersCount] = useState(0);
  const [unreadUsers, setUnreadUsers] = useState(new Set());
  const [serverUrl] = useState(
    process.env.NEXT_PUBLIC_SOCKET_API_URL || "http://localhost:3001"
  );

  // Update unread count whenever unreadUsers changes
  useEffect(() => {
    setUnreadUsersCount(unreadUsers.size);
  }, [unreadUsers]);

  // Socket connection management
  const connectSocket = useCallback(() => {
    if (!user?.token || socketRef.current?.connected) return;

    const socket = io(serverUrl, {
      transports: ["websocket"],
      auth: { token: user.token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log(`Socket connected: ${socket.id}`);
      setConnectionStatus("connected");
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      setConnectionStatus("disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setConnectionStatus("error");
    });

    socketRef.current = socket;
  }, [user?.token, serverUrl]);

  // Initialize socket and handle messages
  useEffect(() => {
    if (!user?.token) return;

    connectSocket();
    const socket = socketRef.current;

    // Handle direct messages to update unread count
    socket.on("directMessage", async (msg) => {
      if (msg.recipientId === user.userId) {
        // Always update unread state for incoming messages
        if (msg.senderId !== user.userId) {
          // Only for messages from others
          console.log(
            "Received message, updating unread state for:",
            msg.senderId
          );

          // Update unread users
          setUnreadUsers((prev) => {
            const updated = new Set(prev);
            if (!msg.isRead) {
              updated.add(msg.senderId);
            }
            return updated;
          });

          // Refresh chat users list to include new sender
          socket.emit("getChatUsers", (users) => {
            socket.emit("refreshUserList", users); // Emit event to update user list in MessengerPage
          });
        }
      }
    });

    // Get initial unread messages and users
    socket.emit("getChatUsers", (users) => {
      const unreadSet = new Set();
      users.forEach((u) => {
        if (u.hasUnreadMessages) {
          unreadSet.add(u.userId);
        }
      });
      setUnreadUsers(unreadSet);
      socket.emit("refreshUserList", users); // Initial user list broadcast
    });

    return () => {
      if (socket) {
        socket.off("directMessage");
        socket.disconnect();
      }
    };
  }, [user?.token, user?.userId, connectSocket]);

  // Handle marking messages as read
  const markMessagesAsRead = useCallback((peerId) => {
    if (!socketRef.current || !peerId) return;

    socketRef.current.emit("markMessagesAsRead", { peerId });
    setUnreadUsers((prev) => {
      const updated = new Set(prev);
      updated.delete(peerId);
      return updated;
    });
  }, []);

  const value = {
    socket: socketRef.current,
    connectionStatus,
    unreadUsersCount,
    unreadUsers,
    setUnreadUsers,
    markMessagesAsRead,
  };

  return (
    <MessengerContext.Provider value={value}>
      {children}
    </MessengerContext.Provider>
  );
};

export const useMessenger = () => useContext(MessengerContext);
