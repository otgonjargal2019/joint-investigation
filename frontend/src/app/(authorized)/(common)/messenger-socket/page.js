"use client";

import { useEffect, useRef, useState, useLayoutEffect } from "react";
import io from "socket.io-client";

import { useAuth } from "@/providers/authProviders";
import { useMessenger } from "@/providers/messengerProvider";

export default function MessengerPage() {
  const { user } = useAuth();
  if (!(user && user.token)) return null;

  const currentUserId = user.userId;
  const { unreadUsers, setUnreadUsers } = useMessenger();

  const socketRef = useRef(null);
  const selectedPeerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const oldestMessageRef = useRef(null);

  const [serverUrl] = useState(
    process.env.NEXT_PUBLIC_SOCKET_API_URL || "http://localhost:3001"
  );
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [status, setStatus] = useState("disconnected");
  const [isFetchingOlder, setIsFetchingOlder] = useState(false);

  const mergeMessages = (prevMessages, newMessages, prepend = false) => {
    const map = new Map();
    const combined = prepend
      ? [...newMessages, ...prevMessages]
      : [...prevMessages, ...newMessages];
    combined.forEach((m) => map.set(m.messageId, m));
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  };

  useEffect(() => {
    socketRef.current = io(serverUrl, {
      transports: ["websocket"],
      auth: { token: user.token },
      // reconnectionAttempts: 5, // optional: try reconnecting 5 times
      // reconnectionDelay: 1000, // 1s between attempts
    });

    socketRef.current.on("connect", () => {
      setStatus("connected");
      console.log(
        `[Messenger] Connected. SocketID=${socketRef.current.id}, UserID=${currentUserId}`
      );
    });

    socketRef.current.on("disconnect", (reason) => {
      setStatus("disconnected");
      console.log(`[Messenger] Disconnected. Reason: ${reason}`);
    });

    socketRef.current.on("directMessage", (msg) => {
      console.log(
        `[Messenger] Received message from ${msg.senderId} to ${msg.recipientId}: "${msg.content}"`
      );

      const container = chatContainerRef.current;
      const isMessageForSelected =
        selectedPeerRef.current &&
        (msg.senderId === selectedPeerRef.current.userId ||
          msg.recipientId === selectedPeerRef.current.userId ||
          msg.senderId === currentUserId);

      if (isMessageForSelected) {
        const nearBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
          50;

        setAllMessages((prev) => mergeMessages(prev, [msg]));

        if (nearBottom) {
          requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
          });
        }
      }

      if (
        msg.senderId !== currentUserId &&
        msg.senderId !== selectedPeerRef.current?.userId
      ) {
        setUnreadUsers((prev) => new Set(prev).add(msg.senderId));
      }
    });

    console.log("[Messenger] Fetching initial chat users...");
    socketRef.current.emit("getChatUsers", (res) => {
      console.log(`[Messenger] Fetched ${res.length} chat users`);
      setUsers(res);
    });

    return () => {
      console.log("[Messenger] Disconnecting socket...");
      socketRef.current.disconnect();
    };
  }, [serverUrl, currentUserId]);

  useEffect(() => {
    selectedPeerRef.current = selectedPeer;
  }, [selectedPeer]);

  const handleSelectPeer = (peer) => {
    setSelectedPeer(peer);
    setUnreadUsers((prev) => {
      const updated = new Set(prev);
      updated.delete(peer.userId);
      return updated;
    });

    socketRef.current.emit(
      "getHistory",
      { userA: currentUserId, userB: peer.userId, limit: 10 },
      (res) => {
        if (!res) return;
        const sorted = [...res].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setAllMessages(sorted);
        if (sorted.length > 0) oldestMessageRef.current = sorted[0].createdAt;
      }
    );
  };

  // Scroll to bottom whenever messages change for the selected peer
  useLayoutEffect(() => {
    if (!chatContainerRef.current) return;
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [allMessages, selectedPeer]);

  const fetchHistory = (peerId, before = null) => {
    if (isFetchingOlder) return;
    setIsFetchingOlder(true);

    const container = chatContainerRef.current;
    const previousScrollHeight = container.scrollHeight;

    socketRef.current.emit(
      "getHistory",
      { userA: currentUserId, userB: peerId, before, limit: 10 },
      (res) => {
        setIsFetchingOlder(false);
        if (!res || res.length === 0) return;

        const sorted = [...res].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        setAllMessages((prev) => mergeMessages(sorted, prev, true));
        oldestMessageRef.current = sorted[0].createdAt;

        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight - previousScrollHeight;
        });
      }
    );
  };

  const handleSend = () => {
    if (!currentUserId || !selectedPeer || !messageContent.trim()) return;

    socketRef.current.emit("sendDirectMessage", {
      senderId: currentUserId,
      recipientId: selectedPeer.userId,
      content: messageContent,
    });

    setMessageContent("");
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (!text.trim()) {
      socketRef.current.emit("getChatUsers", (res) => setUsers(res));
      return;
    }
    socketRef.current.emit("searchUsers", text, (res) => setUsers(res));
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container.scrollTop === 0 && selectedPeer) {
      fetchHistory(selectedPeer.userId, oldestMessageRef.current);
    }
  };

  const filteredMessages = selectedPeer
    ? allMessages.filter(
        (m) =>
          (m.senderId === currentUserId &&
            m.recipientId === selectedPeer.userId) ||
          (m.senderId === selectedPeer.userId &&
            m.recipientId === currentUserId)
      )
    : [];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Messenger</h1>
      <div>
        Status: <span className="font-mono">{status}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Users list */}
        <div
          className="p-3 border rounded overflow-auto"
          style={{ height: "600px" }}
        >
          <h2 className="font-semibold mb-2">Users</h2>
          <input
            type="text"
            className="border p-2 w-full mb-2"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {users.length === 0 && (
            <div className="text-sm text-gray-500">No users found</div>
          )}
          {users.map((u) => (
            <div
              key={u.userId}
              className={`p-2 border-b cursor-pointer flex items-center gap-2 ${
                selectedPeer?.userId === u.userId ? "bg-gray-100" : ""
              }`}
              onClick={() => handleSelectPeer(u)}
            >
              {unreadUsers.has(u.userId) && (
                <span className="w-3 h-3 rounded-full bg-purple-500 block"></span>
              )}
              <span>{u.displayName}</span>
            </div>
          ))}
        </div>

        {/* Chat box */}
        <div
          className="p-3 border rounded flex flex-col"
          style={{ height: "600px" }}
        >
          <h2 className="font-semibold mb-2">Chat</h2>
          <div
            ref={chatContainerRef}
            className="overflow-auto border rounded p-2 mb-2 flex-1"
            onScroll={handleScroll}
          >
            {filteredMessages.length === 0 && (
              <div className="text-sm text-gray-500">No messages</div>
            )}
            {filteredMessages.map((m, index) => (
              <div
                key={m.messageId || `${m.senderId}-${m.createdAt}-${index}`}
                className={`max-w-[70%] p-2 my-1 rounded break-words flex flex-col ${
                  m.senderId === currentUserId
                    ? "bg-blue-500 text-white self-end ml-auto items-end"
                    : "bg-gray-200 text-gray-800 self-start mr-auto items-start"
                }`}
              >
                <div className="text-xs font-semibold">
                  {m.senderId === currentUserId
                    ? "Me"
                    : selectedPeer.displayName}
                </div>
                <div className="text-[10px] text-gray-300 mb-1">
                  {new Date(m.createdAt).toLocaleString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div>{m.content}</div>
              </div>
            ))}
          </div>

          {/* Send message */}
          <div className="flex gap-2 mt-auto">
            <input
              className="border p-2 flex-1"
              placeholder="Type a message..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              className="bg-blue-600 text-white px-3 py-2 rounded"
              onClick={handleSend}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
