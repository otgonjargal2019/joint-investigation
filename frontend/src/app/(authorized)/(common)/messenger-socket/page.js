"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import io from "socket.io-client";

export default function MessengerSocketPage() {
  const [serverUrl, setServerUrl] = useState(
    process.env.NEXT_PUBLIC_SOCKET_API_URL || "http://localhost:3001"
  );
  const [currentUserId, setCurrentUserId] = useState("");
  const [selectedPeerId, setSelectedPeerId] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [peers, setPeers] = useState([]);
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [status, setStatus] = useState("disconnected");

  const socket = useMemo(
    () => io(serverUrl, { transports: ["websocket"] }),
    [serverUrl]
  );
  const historyRef = useRef([]);

  useEffect(() => {
    setStatus("connecting");
    socket.on("connect", () => setStatus("connected"));
    socket.on("disconnect", () => setStatus("disconnected"));

    // Re-register if currentUserId is set
    if (currentUserId) {
      socket.emit("register", Number(currentUserId));
    }

    // Live incoming messages
    socket.on("directMessage", (msg) => {
      historyRef.current = [...historyRef.current, msg];
      setHistory(historyRef.current.slice());
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("directMessage");
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // Register current user
  function handleRegister() {
    if (!currentUserId) return;
    socket.emit("register", Number(currentUserId));
  }

  // Send a direct message
  function handleSend() {
    if (!currentUserId || !selectedPeerId || !messageContent.trim()) return;
    socket.emit("sendDirectMessage", {
      senderId: Number(currentUserId),
      receiverId: Number(selectedPeerId),
      content: messageContent,
    });
    setMessageContent("");
  }

  // Load peers list
  function handleLoadPeers() {
    if (!currentUserId) return;
    socket.emit("getPeers", { userId: Number(currentUserId) }, (res) => {
      if (res && res.error) return alert(res.error);
      setPeers(Array.isArray(res) ? res : []);
    });
  }

  // Load history for selected peer
  function handleLoadHistory() {
    if (!currentUserId || !selectedPeerId) return;
    socket.emit(
      "getHistory",
      { userA: Number(currentUserId), userB: Number(selectedPeerId) },
      (res) => {
        if (res && res.error) return alert(res.error);
        historyRef.current = Array.isArray(res) ? res : [];
        setHistory(historyRef.current);
      }
    );
  }

  // Search users by username
  function handleSearchUsers() {
    if (!searchQuery.trim()) return;
    socket.emit("searchUsers", { username: searchQuery.trim() }, (res) => {
      if (res && res.error) return alert(res.error);
      setSearchResults(Array.isArray(res) ? res : []);
    });
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Messenger (Socket.IO Demo)</h1>
      <div className="text-sm">
        Status: <span className="font-mono">{status}</span>
      </div>

      <div className="space-y-2 p-3 border rounded">
        <div className="flex items-center gap-2">
          <label className="min-w-28">Server URL</label>
          <input
            className="border p-2 flex-1"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="min-w-28">Your User ID</label>
          <input
            className="border p-2"
            type="number"
            value={currentUserId}
            onChange={(e) => setCurrentUserId(e.target.value)}
          />
          <button
            className="cursor-pointer bg-blue-600 text-white px-3 py-2 rounded"
            onClick={handleRegister}
          >
            Register
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3 p-3 border rounded">
          <div className="flex items-center gap-2">
            <label className="min-w-28">Search users</label>
            <input
              className="border p-2 flex-1"
              placeholder="username contains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="cursor-pointer bg-gray-700 text-white px-3 py-2 rounded"
              onClick={handleSearchUsers}
            >
              Search
            </button>
          </div>
          <div className="max-h-48 overflow-auto border rounded">
            {searchResults.map((u) => (
              <div
                key={u.id}
                className={`p-2 border-b cursor-pointer ${
                  String(selectedPeerId) === String(u.id) ? "bg-gray-100" : ""
                }`}
                onClick={() => setSelectedPeerId(String(u.id))}
              >
                <div className="font-medium">{u.displayName || u.username}</div>
                <div className="text-xs text-gray-500">ID: {u.id}</div>
              </div>
            ))}
            {searchResults.length === 0 && (
              <div className="p-2 text-sm text-gray-500">No results</div>
            )}
          </div>
        </div>

        <div className="space-y-3 p-3 border rounded">
          <div className="flex items-center gap-2">
            <label className="min-w-28">Peers</label>
            <button
              className="cursor-pointer bg-gray-700 text-white px-3 py-2 rounded"
              onClick={handleLoadPeers}
            >
              Load peers
            </button>
          </div>
          <div className="max-h-48 overflow-auto border rounded">
            {peers.map((u) => (
              <div
                key={u.id}
                className={`p-2 border-b cursor-pointer ${
                  String(selectedPeerId) === String(u.id) ? "bg-gray-100" : ""
                }`}
                onClick={() => setSelectedPeerId(String(u.id))}
              >
                <div className="font-medium">{u.displayName || u.username}</div>
                <div className="text-xs text-gray-500">ID: {u.id}</div>
              </div>
            ))}
            {peers.length === 0 && (
              <div className="p-2 text-sm text-gray-500">No peers</div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2 p-3 border rounded">
        <div className="flex items-center gap-2">
          <label className="min-w-28">Selected Peer ID</label>
          <input
            className="border p-2"
            type="number"
            value={selectedPeerId}
            onChange={(e) => setSelectedPeerId(e.target.value)}
          />
          <button
            className="cursor-pointer bg-gray-700 text-white px-3 py-2 rounded"
            onClick={handleLoadHistory}
          >
            Load history
          </button>
        </div>
        <div className="border rounded max-h-64 overflow-auto p-2 space-y-2">
          {history.map((m) => (
            <div
              key={m.id}
              className={`p-2 rounded ${
                String(m.senderId) === String(currentUserId)
                  ? "bg-blue-50"
                  : "bg-gray-50"
              }`}
            >
              <div className="text-xs text-gray-500">
                {new Date(m.createdAt).toLocaleString()}
              </div>
              <div className="text-sm">
                <span className="font-semibold">{m.senderId}</span>: {m.content}
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="text-sm text-gray-500">No messages</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            className="border p-2 flex-1"
            placeholder="Type a message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button
            className="cursor-pointer bg-blue-600 text-white px-3 py-2 rounded"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
