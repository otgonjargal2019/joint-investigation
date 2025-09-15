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

  const [lastNotifications, setLastNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pages, setPages] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  // -------------------- PAGINATION --------------------
  const fetchNextPage = useCallback(() => {
    if (!hasMore || !socketRef.current) return;

    const allNotifs = pages.flat();
    const lastNotif = allNotifs[allNotifs.length - 1];
    const before = lastNotif?.createdAt || null;

    socketRef.current.emit(
      "notifications:getPage",
      { before, limit: 20 },
      (newNotifs) => {
        if (!newNotifs.length) setHasMore(false);
        setPages((prev) => [...prev, newNotifs]);
      }
    );
  }, [pages, hasMore]);

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
        socket.emit("notifications:getLast5", (notifs) =>
          setLastNotifications(notifs)
        );
        socket.emit("notifications:getUnreadCount", setUnreadCount);

        if (pages.length === 0) fetchNextPage();
      });

      // New notification
      socket.on("notification:new", (notif) => {
        setLastNotifications((prev) => [notif, ...prev].slice(0, 5));
        setPages((prev) => {
          if (!prev.length) return [[notif]];
          const firstPage = [notif, ...prev[0]];
          return [firstPage, ...prev.slice(1)];
        });
        setUnreadCount((prev) => prev + 1);
      });

      socketRef.current = socket;
    } catch (err) {
      console.error("Socket connection error:", err);
    }
  }, [serverUrl, pages]);

  useEffect(() => {
    connectSocket();
    return () => socketRef.current?.disconnect();
  }, [connectSocket]);

  const markNotificationAsRead = useCallback((notifId) => {
    socketRef.current?.emit("notifications:markRead", notifId, (res) => {
      if (!res?.success) {
        console.error("Failed to mark notification as read");
        return;
      }

      setPages((prevPages) =>
        prevPages.map((page) =>
          page.map((notif) =>
            notif.notificationId === notifId
              ? { ...notif, isRead: true }
              : notif
          )
        )
      );
      setLastNotifications((prev) =>
        prev.map((notif) =>
          notif.notificationId === notifId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    });
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    socketRef.current?.emit("notifications:markAllRead", (res) => {
      if (!res?.success) {
        console.error("Failed to mark all notifications as read");
        return;
      }

      setPages((prevPages) =>
        prevPages.map((page) =>
          page.map((notif) => ({ ...notif, isRead: true }))
        )
      );
      setLastNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    });
  }, []);

  const deleteAllNotifications = useCallback(() => {
    socketRef.current?.emit("notifications:deleteAll", (res) => {
      if (!res?.success) {
        console.error("Failed to delete all notifications");
        return;
      }

      setPages([]);
      setLastNotifications([]);
      setUnreadCount(0);
      setHasMore(false);
    });
  }, []);

  return (
    <RealtimeContext.Provider
      value={{
        lastNotifications,
        unreadCount,
        pages,
        hasMore,
        fetchNextPage,
        deleteAllNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealTime = () => useContext(RealtimeContext);
