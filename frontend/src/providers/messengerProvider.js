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
  const connectSocket = useCallback(async () => {
    if (socketRef.current?.connected) return;

    const res = await fetch("/api/socket-token", { credentials: "include" });
    const data = await res.json();
    const socketToken = data.socketToken;

    //console.log("socketToken yu irev:", socketToken);

    const socket = io(serverUrl, {
      // transports: ["websocket"],
      auth: { token: socketToken },
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
  }, [serverUrl]);

  useEffect(() => {
    if (!user?.userId) return;

    let isMounted = true;

    const setupSocket = async () => {
      await connectSocket();
      if (!isMounted) return;

      const socket = socketRef.current;
      if (!socket) return;

      // Attach event listeners
      socket.on("directMessage", async (msg) => {
        if (msg.recipientId === user.userId) {
          if (msg.senderId !== user.userId) {
            setUnreadUsers((prev) => {
              const updated = new Set(prev);
              if (!msg.isRead) updated.add(msg.senderId);
              return updated;
            });

            socket.emit("getChatUsers", (users) => {
              socket.emit("refreshUserList", users);
            });
          }
        }
      });

      socket.emit("getChatUsers", (users) => {
        const unreadSet = new Set();
        users.forEach((u) => {
          if (u.hasUnreadMessages) unreadSet.add(u.userId);
        });
        setUnreadUsers(unreadSet);
        socket.emit("refreshUserList", users);
      });
    };

    setupSocket();

    return () => {
      isMounted = false;
      const socket = socketRef.current;
      if (socket) {
        socket.off("directMessage");
        socket.disconnect();
      }
    };
  }, [user?.userId, connectSocket]);

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
