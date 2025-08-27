"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

import { useAuth } from "@/providers/authProviders";

export default function MessengerPage() {
  const { user } = useAuth();

  const [serverUrl] = useState(
    process.env.NEXT_PUBLIC_SOCKET_API_URL || "http://localhost:3001"
  );
  const [currentUserId, setCurrentUserId] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [status, setStatus] = useState("disconnected");

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(serverUrl, { transports: ["websocket"] });

    socketRef.current.on("connect", () => setStatus("connected"));
    socketRef.current.on("disconnect", () => setStatus("disconnected"));

    // Receive all new messages from server
    socketRef.current.on("directMessage", (msg) => {
      console.log("msg:::", msg);
      setAllMessages((prev) => {
        // Avoid duplicates
        const exists = prev.some((m) => m.messageId === msg.messageId);
        if (exists) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socketRef.current.off("connect");
      socketRef.current.off("disconnect");
      socketRef.current.off("directMessage");
      socketRef.current.disconnect();
    };
  }, [serverUrl]);

  const handleRegister = () => {
    if (!currentUserId) return;
    socketRef.current.emit("register", currentUserId, (res) => {
      setUsers(res);
    });
  };

  const handleSelectPeer = (peer) => {
    setSelectedPeer(peer);
    socketRef.current.emit(
      "getHistory",
      { userA: currentUserId, userB: peer.userId },
      (res) => {
        setAllMessages((prev) => {
          const ids = new Set(prev.map((m) => m.messageId));
          const merged = [
            ...prev,
            ...(res || []).filter((m) => !ids.has(m.messageId)),
          ];
          return merged;
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

    setMessageContent(""); // Clear input
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

      <div className="flex items-center gap-2">
        <input
          className="border p-2"
          placeholder="Your User ID"
          value={currentUserId}
          onChange={(e) => setCurrentUserId(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-3 py-2 rounded"
          onClick={handleRegister}
        >
          Register
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Users list */}
        <div className="p-3 border rounded max-h-96 overflow-auto">
          <h2 className="font-semibold mb-2">Users</h2>
          {users.length === 0 && (
            <div className="text-sm text-gray-500">No other users</div>
          )}
          {users.map((u) => (
            <div
              key={u.userId}
              className={`p-2 border-b cursor-pointer ${
                selectedPeer?.userId === u.userId ? "bg-gray-100" : ""
              }`}
              onClick={() => handleSelectPeer(u)}
            >
              {u.displayName} (ID: {u.userId})
            </div>
          ))}
        </div>

        {/* Chat box */}
        <div className="p-3 border rounded flex flex-col max-h-96">
          <h2 className="font-semibold mb-2">Chat</h2>
          <div className="flex-1 overflow-auto border rounded p-2 mb-2">
            {filteredMessages.length === 0 && (
              <div className="text-sm text-gray-500">No messages</div>
            )}
            {filteredMessages.map((m) => (
              <div
                key={m.messageId}
                className={`p-1 rounded my-1 ${
                  m.senderId === currentUserId ? "bg-blue-50" : "bg-gray-50"
                }`}
              >
                <div className="text-xs text-gray-500">
                  {new Date(m.createdAt).toLocaleString()}
                </div>
                <div>
                  <strong>{m.senderId}</strong>: {m.content}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
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
