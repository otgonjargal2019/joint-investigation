"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useLayoutEffect } from "react";

import { useAuth } from "@/providers/authProviders";
import { useRealTime } from "@/providers/realtimeProvider";
import PageTitle from "@/shared/components/pageTitle/page";
import ChatComposer from "@/shared/widgets/messenger/chatComposer";
import ChatMessages from "@/shared/widgets/messenger/chatMessages";
import UserSearchBox from "@/shared/widgets/messenger/userSearchBox";
import SidebarUserList from "@/shared/widgets/messenger/sidebarUserList";

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
      displayName: peer.displayName ?? "Unknown",
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

  return (
    <div className="messenger">
      <PageTitle title={t("header.messenger")} />

      <div className="flex gap-4 h-[680px]">
        <div className="w-[450px] bg-white border border-color-36 rounded-10 pb-4 overflow-auto">
          <div className="m-5">
            <UserSearchBox onPick={handlePickSearchUser} />
          </div>

          <SidebarUserList
            users={displayedUsers}
            selectedPeer={selectedPeer}
            unreadUsers={unreadUsers}
            onSelect={handleSelectPeer}
          />
        </div>

        <div className="flex-1 flex flex-col bg-white border border-color-36 rounded-10">
          <div className="h-[89px] border-b border-color-36 flex items-center px-6">
            <h3 className="text-black text-[24px] font-semibold">
              {selectedPeer?.displayName || ""}
            </h3>
          </div>

          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <ChatMessages
              containerRef={chatContainerRef}
              messages={allMessages}
              selectedPeer={selectedPeer}
              currentUserId={currentUserId}
              onScroll={handleScroll}
            />

            {selectedPeer && (
              <ChatComposer
                value={messageContent}
                onChange={setMessageContent}
                onSend={handleSend}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
