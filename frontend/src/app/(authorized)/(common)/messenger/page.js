"use client";

import io from "socket.io-client";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useLayoutEffect } from "react";

import { useAuth } from "@/providers/authProviders";
import PageTitle from "@/shared/components/pageTitle/page";
import { useMessenger } from "@/providers/messengerProvider";
import Circle from "@/shared/components/icons/circle";
import Ellipse from "@/shared/components/icons/ellipse";
import PaperPlane from "@/shared/components/icons/paperplane";
import MagnifyingGlass from "@/shared/components/icons/magnifyingGlass";

const limit = 10;

export default function MessengerPage() {
  const { user } = useAuth();
  if (!(user && user.token && user.userId)) return null;

  const t = useTranslations();
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
      { peerId: peer.userId, limit },
      (res) => {
        if (!res) return;
        const sorted = [...res].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setAllMessages(sorted);
        if (sorted.length > 0) oldestMessageRef.current = sorted[0].createdAt;

        //  emit mark as read
        socketRef.current.emit("markMessagesAsRead", {
          peerId: peer.userId,
        });
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
      { peerId: peerId, before, limit },
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
      // senderId: currentUserId,
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

  console.log("filteredMessages:", filteredMessages);

  return (
    <div className="messenger">
      <PageTitle title={t("header.messenger")} />

      {/* Container with fixed height */}
      <div className="flex gap-4 h-[680px]">
        {/* Left panel: Users list */}
        <div className="w-[450px] bg-white border border-color-36 rounded-10 pb-4 overflow-auto">
          {/* Search bar */}
          <div className="m-5 h-[60px] bg-color-74 rounded-5 flex items-center p-4 gap-3">
            <MagnifyingGlass />
            <input
              type="text"
              className="px-4 outline-none text-color-4 text-[18px] font-normal w-full"
              placeholder={t("placeholder.chat-search")}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Users */}
          {users.length === 0 ? (
            <div className="text-sm text-gray-500 text-center">
              No users found
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u.userId}
                className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-color-80 transition-colors ${
                  selectedPeer?.userId === u.userId ? "bg-color-80" : ""
                }`}
                onClick={() => handleSelectPeer(u)}
              >
                <div className="w-[17px]">
                  {unreadUsers.has(u.userId) && (
                    <Ellipse color="#564CDF" width={15} height={15} />
                  )}
                </div>
                <Circle />
                <div className="w-full">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-black text-[18px] font-semibold">
                      {u.displayName}
                    </div>
                    <div className="text-color-35 text-[16px] font-normal">
                      {"date"}
                    </div>
                  </div>
                  <div className="text-color-35 text-[16px] truncate">
                    {/* last message */}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right panel: Chat box */}
        <div className="flex-1 flex flex-col bg-white border border-color-36 rounded-10">
          {/* Header */}
          <div className="h-[89px] border-b border-color-36 flex items-center px-6">
            <h3 className="text-black text-[24px] font-semibold">
              {selectedPeer?.displayName || ""}
            </h3>
          </div>

          {/* Messages */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-auto space-y-3 px-2"
              onScroll={handleScroll}
            >
              {filteredMessages.length === 0 ? (
                <div className="text-sm text-gray-500 text-center mt-4">
                  No messages
                </div>
              ) : (
                filteredMessages.map((m, index) => {
                  const isMe = m.senderId === currentUserId;
                  return (
                    <div
                      key={
                        m.messageId || `${m.senderId}-${m.createdAt}-${index}`
                      }
                      className={`flex ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isMe && <Circle className="mt-1" />}
                      <div
                        className={`flex flex-col ${
                          isMe ? "items-end" : "items-start"
                        } max-w-[70%]`}
                      >
                        <div className="flex gap-2 items-center mb-1">
                          {!isMe && (
                            <span className="text-black text-[16px] font-semibold">
                              {selectedPeer.displayName}
                            </span>
                          )}
                          <span className="text-color-35 text-[14px] font-normal">
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div
                          className={`px-4 py-3 rounded-5 text-[16px] break-words ${
                            isMe
                              ? "bg-color-61 text-black"
                              : "bg-color-1 text-black"
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Send message */}
            <div className="mt-4 flex gap-3 border border-color-36 rounded-5 px-3 h-[60px] items-center bg-white">
              <input
                type="text"
                className="flex-1 outline-none placeholder-color-35 text-[16px] text-color-4"
                placeholder="메시지를 입력하세요."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                type="button"
                className="bg-color-20 text-white px-4 py-2 rounded-5 hover:bg-color-30 transition-colors"
                onClick={handleSend}
                aria-label="Send message"
              >
                <PaperPlane />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
