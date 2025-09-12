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

const RealtimeContext = createContext();

export const RealtimeProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [serverUrl] = useState(
    process.env.NEXT_PUBLIC_SOCKET_API_URL || "http://localhost:3001"
  );

  const [allNotifications, setAllNotifications] = useState([]);
  const [lastNotifications, setLastNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const connectSocket = useCallback(async () => {
    if (socketRef.current?.connected) return;
    try {
      const res = await fetch("/api/socket-token", { credentials: "include" });
      const data = await res.json();
      const socketToken = data.socketToken;

      const socket = io(serverUrl, {
        transports: ["websocket", "polling"],
        auth: { token: socketToken },
      });

      // On connect
      socket.on("connect", () => {
        socket.emit("getLastNotifications", (notifs) =>
          setLastNotifications(notifs)
        );
        socket.emit("getAllNotifications", (notifs) =>
          setAllNotifications(notifs)
        );
        socket.emit("notifications:getUnreadCount", setUnreadCount);
      });

      // New notification
      socket.on("notification:new", (notif) => {
        setLastNotifications((prev) => [notif, ...prev].slice(0, 5));
        setAllNotifications((prev) => [notif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      // Updates (mark read / mark all read)
      socket.on(
        "notifications:update",
        ({ allNotifications, lastNotifications }) => {
          setAllNotifications(allNotifications);
          setLastNotifications(lastNotifications);
          const unread = allNotifications.filter((n) => !n.isRead).length;
          setUnreadCount(unread);
        }
      );

      socketRef.current = socket;
    } catch (err) {
      console.error("Socket connection error:", err);
    }
  }, [serverUrl]);

  useEffect(() => {
    connectSocket();
    return () => socketRef.current?.disconnect();
  }, [connectSocket]);

  const markNotificationAsRead = useCallback((notifId) => {
    socketRef.current?.emit("notifications:markRead", notifId, (res) => {
      if (!res?.success) console.error("Failed");
    });
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    socketRef.current?.emit("notifications:markAllRead", (res) => {
      if (!res?.success) console.error("Failed");
    });
  }, []);

  return (
    <RealtimeContext.Provider
      value={{
        allNotifications,
        lastNotifications,
        unreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealTime = () => useContext(RealtimeContext);
