"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useLayoutEffect } from "react";

import { useAuth } from "@/providers/authProviders";
import { useRealTime } from "@/providers/realtimeProvider";
import PageTitle from "@/shared/components/pageTitle/page";
import Circle from "@/shared/components/icons/circle";
import Ellipse from "@/shared/components/icons/ellipse";
import PaperPlane from "@/shared/components/icons/paperplane";
import UserSearchBox from "@/shared/widgets/messenger/userSearchBox";

const limit = 10;

export default function MessengerPage() {
  const { user } = useAuth();
  if (!(user && user.userId)) return null;

  const t = useTranslations();
  const currentUserId = user.userId;
  const { socket, unreadUsers, markMessagesAsRead } = useRealTime();

  const selectedPeerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const oldestMessageRef = useRef(null);

  const [chatUsers, setChatUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);

  const [selectedPeer, setSelectedPeer] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
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

  const movePeerFirst = (list, peer) => {
    if (!peer) return list;
    const rest = list.filter((u) => u.userId !== peer.userId);

    const top = {
      userId: peer.userId,
      displayName: peer.displayName ?? peer.name ?? peer.loginId ?? "Unknown",
      profileImageUrl: peer.profileImageUrl ?? null,
      lastMessage: peer.lastMessage ?? "",
      lastMessageTime: peer.lastMessageTime ?? null,
      ...peer,
    };
    return [top, ...rest];
  };

  useEffect(() => {
    if (!socket) return;

    const handleDirectMessage = (msg) => {
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

        if (
          msg.senderId === selectedPeerRef.current.userId &&
          msg.recipientId === currentUserId
        ) {
          markMessagesAsRead(msg.senderId);
        }

        if (nearBottom) {
          requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
          });
        }
      } else if (
        msg.senderId !== currentUserId &&
        msg.recipientId === currentUserId
      ) {
        socket.emit("getChatUsers", (res) => {
          setChatUsers(res);

          setDisplayedUsers((prev) => {
            return selectedPeerRef.current
              ? movePeerFirst(res, selectedPeerRef.current)
              : res;
          });
        });
      }
    };

    socket.on("directMessage", handleDirectMessage);

    socket.on("refreshUserList", (updatedUsers) => {
      setChatUsers(updatedUsers);
      setDisplayedUsers((prev) =>
        selectedPeerRef.current
          ? movePeerFirst(updatedUsers, selectedPeerRef.current)
          : updatedUsers
      );
    });

    // Initial user list fetch
    socket.emit("getChatUsers", (res) => {
      setChatUsers(res);
      setDisplayedUsers(res);
    });

    return () => {
      socket.off("directMessage", handleDirectMessage);
      socket.off("refreshUserList");
    };
  }, [socket, currentUserId]);

  useEffect(() => {
    selectedPeerRef.current = selectedPeer;
  }, [selectedPeer]);

  const handleSelectPeer = (peer) => {
    setSelectedPeer(peer);

    markMessagesAsRead(peer.userId);

    if (socket) {
      socket.emit("getHistory", { peerId: peer.userId, limit }, (res) => {
        if (!res) return;
        const sorted = [...res].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setAllMessages(sorted);
        if (sorted.length > 0) oldestMessageRef.current = sorted[0].createdAt;
      });
    }
  };

  useLayoutEffect(() => {
    if (!chatContainerRef.current || !selectedPeer) return;

    const container = chatContainerRef.current;

    // Only auto-scroll if:
    // 1. User just selected a peer (allMessages length small) OR
    // 2. User is already near the bottom (new message)
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      50;

    const justSelectedPeer = allMessages.length <= limit;

    if (isNearBottom || justSelectedPeer) {
      container.scrollTop = container.scrollHeight;
    }

    // Mark messages as read when they become visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute("data-message-id");
            const senderId = entry.target.getAttribute("data-sender-id");
            if (senderId && senderId !== currentUserId) {
              markMessagesAsRead(senderId);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe all unread messages from the selected peer
    const unreadMessages = container.querySelectorAll(
      '.message-bubble[data-is-read="false"]'
    );
    unreadMessages.forEach((msg) => observer.observe(msg));

    return () => {
      observer.disconnect();
    };
  }, [allMessages, selectedPeer, currentUserId, markMessagesAsRead]);

  const fetchHistory = (peerId, before = null) => {
    if (isFetchingOlder || !socket) return;
    setIsFetchingOlder(true);

    const container = chatContainerRef.current;
    const previousScrollHeight = container.scrollHeight;

    socket.emit("getHistory", { peerId: peerId, before, limit }, (res) => {
      setIsFetchingOlder(false);
      if (!res || res.length === 0) return;

      const sorted = [...res].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      setAllMessages((prev) => mergeMessages(sorted, prev, true));
      oldestMessageRef.current = sorted[0].createdAt;

      // Maintain scroll position when loading older messages
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight - previousScrollHeight;
      });
    });
  };

  // Add: handle scroll to load older messages when reaching top
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container || !selectedPeer) return;

    // If user scrolled to top area, try to fetch older messages
    if (container.scrollTop <= 10 && oldestMessageRef.current) {
      fetchHistory(selectedPeer.userId, oldestMessageRef.current);
    }
  };

  const handleSend = () => {
    if (!currentUserId || !selectedPeer || !messageContent.trim() || !socket) {
      return;
    }

    const message = {
      recipientId: selectedPeer.userId,
      content: messageContent.trim(),
    };

    // Clear input immediately for better UX
    const contentToSend = messageContent;
    setMessageContent("");

    socket.emit("sendDirectMessage", message, (error, result) => {
      if (error) {
        console.error("Failed to send message:", error);
        // Restore the message content if sending failed
        setMessageContent(contentToSend);
        // You can add error handling UI here
        return;
      }
      // Message sent successfully, input is already cleared
      // Optionally scroll to bottom
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    });
  };

  const handlePickSearchUser = (user) => {
    setDisplayedUsers((prev) =>
      movePeerFirst(prev.length ? prev : chatUsers, user)
    );
    setChatUsers((prev) => movePeerFirst(prev, user));
    handleSelectPeer(user);
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

  // Popover keyboard navigation is handled inside UserSearchBox

  return (
    <div className="messenger">
      <PageTitle title={t("header.messenger")} />

      <div className="flex gap-4 h-[680px]">
        <div className="w-[450px] bg-white border border-color-36 rounded-10 pb-4 overflow-auto">
          <div className="m-5">
            <UserSearchBox onPick={handlePickSearchUser} />
          </div>

          {displayedUsers.length === 0 ? (
            <div className="text-sm text-gray-500 text-center">
              No users found
            </div>
          ) : (
            displayedUsers.map((u) => (
              <div
                key={u.userId}
                className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-color-80 transition-colors ${
                  selectedPeer?.userId === u.userId ? "bg-color-80" : ""
                }`}
                onClick={() => handleSelectPeer(u)}
              >
                <div className="w-[15px] flex-shrink-0">
                  {unreadUsers.has(u.userId) && (
                    <Ellipse color="#564CDF" width={15} height={15} />
                  )}
                </div>
                <div className="relative w-[60px] h-[60px] flex-shrink-0">
                  {u?.profileImageUrl ? (
                    <Image
                      src={u.profileImageUrl}
                      alt={u.displayName || "user image"}
                      fill
                      sizes="60px"
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <Circle width={60} height={60} />
                  )}
                </div>
                <div className="w-full">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="text-black text-[18px] font-semibold">
                        {u.displayName}
                      </div>
                      <div className="text-color-41 font-normal text-[18px] truncate w-[208px]">
                        {u.lastMessage}
                      </div>
                    </div>
                    <div className="text-color-35 text-[16px] font-normal">
                      {u.lastMessageTime &&
                        new Date(u.lastMessageTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex-1 flex flex-col bg-white border border-color-36 rounded-10">
          <div className="h-[89px] border-b border-color-36 flex items-center px-6">
            <h3 className="text-black text-[24px] font-semibold">
              {selectedPeer?.displayName || ""}
            </h3>
          </div>

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
                      className={`flex gap-4 ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isMe && (
                        <div className="relative w-[50px] h-[50px] flex-shrink-0">
                          {selectedPeer?.profileImageUrl ? (
                            <Image
                              src={selectedPeer.profileImageUrl}
                              alt={selectedPeer.displayName || "user image"}
                              fill
                              sizes="50px"
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <Circle width={50} height={50} />
                          )}
                        </div>
                      )}

                      <div
                        className={`flex flex-col ${
                          isMe ? "items-end" : "items-start"
                        } max-w-[70%]`}
                      >
                        <div className="flex gap-2 items-center mb-1">
                          {!isMe && (
                            <span className="text-black text-[18px] font-normal">
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
                          className={`message-bubble px-4 py-3 rounded-5 text-[16px] break-words whitespace-pre-wrap ${
                            isMe
                              ? "bg-color-61 text-black"
                              : "bg-color-1 text-black"
                          }`}
                          data-message-id={m.messageId}
                          data-sender-id={m.senderId}
                          data-is-read={m.isRead || isMe ? "true" : "false"}
                        >
                          {m.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {selectedPeer && (
              <div className="mt-4 flex gap-3 border border-color-36 rounded-5 px-3 min-h-[62px] max-h-[62px] items-start py-2 bg-white">
                <textarea
                  className="flex-1 outline-none placeholder-color-35 text-[16px] text-color-4 resize-none py-2 h-[50px] overflow-y-auto"
                  placeholder="메시지를 입력하세요."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (e.shiftKey) {
                        // Allow new line with Shift+Enter
                        return;
                      } else {
                        // Prevent default Enter behavior and send message
                        e.preventDefault();
                        handleSend();
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  className="bg-color-20 text-white px-3 py-2 rounded-5 transition-colors mt-1"
                  onClick={handleSend}
                  aria-label="Send message"
                >
                  <PaperPlane />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
