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

  const [notifications, setNotifications] = useState([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const fetchLastNotifications = useCallback(() => {
    if (!socketRef.current) return;

    socketRef.current.emit("getLastNotifications", (notifications) => {
      setNotifications(notifications);
    });
  }, []);

  const fetchUnreadCount = useCallback(() => {
    if (!socketRef.current) return;

    socketRef.current.emit("notifications:getUnreadCount", (count) => {
      setHasNewNotification(count > 0);
    });
  }, []);

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

      socket.off("connect").on("connect", () => {
        console.log(`Socket connected: ${socket.id}`);
        fetchLastNotifications();
        fetchUnreadCount();
      });

      socket
        .off("disconnect")
        .on("disconnect", () => console.log("Socket disconnected"));

      // Listen for new notification
      socket.off("notification").on("notification", (notif) => {
        setNotifications((prev) => [notif, ...prev].slice(0, 5));
        setHasNewNotification(true);
      });

      // Listen for updates from mark read/all read
      socket
        .off("notifications:update")
        .on("notifications:update", (notifs) => {
          setNotifications(notifs.slice(0, 5));
          fetchUnreadCount();
        });

      socketRef.current = socket;
    } catch (err) {
      console.error("Socket connection error:", err);
    }
  }, [serverUrl, fetchLastNotifications, fetchUnreadCount]);

  useEffect(() => {
    connectSocket();
    return () => socketRef.current?.disconnect();
  }, [connectSocket]);

  const markAllAsRead = useCallback(() => {
    socketRef.current?.emit("notifications:markAllRead", (res) => {
      if (res?.success) {
        setHasNewNotification(false);
        fetchLastNotifications();
      } else {
        console.error("Failed to mark all notifications as read");
      }
    });
  }, [fetchLastNotifications]);

  const markNotificationAsRead = useCallback(
    (notifId) => {
      socketRef.current?.emit("notifications:markRead", notifId, (res) => {
        if (res?.success) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
          );
          fetchUnreadCount();
        } else {
          console.error("Failed to mark notification as read");
        }
      });
    },
    [fetchUnreadCount]
  );

  return (
    <RealtimeContext.Provider
      value={{
        notifications,
        markAllAsRead,
        hasNewNotification,
        markNotificationAsRead,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealTime = () => useContext(RealtimeContext);
