"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/providers/authProviders";
import { useRealTime } from "@/providers/realtimeProvider";
import PageTitle from "@/shared/components/pageTitle/page";
import ChatComposer from "@/shared/widgets/messenger/chatComposer";
import ChatMessages from "@/shared/widgets/messenger/chatMessages";
import UserSearchBox from "@/shared/widgets/messenger/userSearchBox";
import SidebarUserList from "@/shared/widgets/messenger/sidebarUserList";
import {
  mergeMessages,
  movePeerFirst,
} from "@/shared/widgets/messenger/utils/messenger";
import useChatScroll from "@/shared/widgets/messenger/hooks/useChatScroll";

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

  const [displayedUsers, setDisplayedUsers] = useState([]);

  const [selectedPeer, setSelectedPeer] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [isFetchingOlder, setIsFetchingOlder] = useState(false);

  useChatScroll({
    containerRef: chatContainerRef,
    selectedPeer,
    allMessages,
    currentUserId,
    markMessagesAsRead,
    limit,
  });

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
        const nearBottom = container
          ? container.scrollHeight -
              container.scrollTop -
              container.clientHeight <
            50
          : false;

        setAllMessages((prev) => mergeMessages(prev, [msg]));

        if (
          msg.senderId === selectedPeerRef.current.userId &&
          msg.recipientId === currentUserId
        ) {
          markMessagesAsRead(msg.senderId);
        }

        if (nearBottom && container) {
          requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
          });
        }
      } else if (
        msg.senderId !== currentUserId &&
        msg.recipientId === currentUserId
      ) {
        socket.emit("getChatUsers", (res) => {
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
      setDisplayedUsers(
        selectedPeerRef.current
          ? movePeerFirst(updatedUsers, selectedPeerRef.current)
          : updatedUsers
      );
    });

    socket.emit("getChatUsers", (res) => {
      setDisplayedUsers(res);
    });

    return () => {
      socket.off("directMessage", handleDirectMessage);
      socket.off("refreshUserList");
    };
  }, [socket, currentUserId, markMessagesAsRead]);

  useEffect(() => {
    selectedPeerRef.current = selectedPeer;
  }, [selectedPeer]);

  const handleSelectPeer = (peer) => {
    setSelectedPeer(peer);
    markMessagesAsRead(peer.userId);

    oldestMessageRef.current = null;

    if (socket) {
      socket.emit("getHistory", { peerId: peer.userId, limit }, (res) => {
        if (!res) return;
        const sorted = [...res].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setAllMessages(sorted);
        oldestMessageRef.current = sorted[0]?.createdAt ?? null;
      });
    }
  };

  const fetchHistory = (peerId, before = null) => {
    if (isFetchingOlder || !socket) return;
    setIsFetchingOlder(true);

    const container = chatContainerRef.current;
    const previousScrollHeight = container ? container.scrollHeight : 0;

    socket.emit("getHistory", { peerId: peerId, before, limit }, (res) => {
      setIsFetchingOlder(false);
      if (!res || res.length === 0) return;

      const sorted = [...res].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      setAllMessages((prev) => mergeMessages(sorted, prev, true));
      oldestMessageRef.current = sorted[0].createdAt;

      if (container) {
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight - previousScrollHeight;
        });
      }
    });
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container || !selectedPeer) return;

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

    const contentToSend = messageContent;
    setMessageContent("");

    socket.emit("sendDirectMessage", message, (error, result) => {
      if (error) {
        console.error("Failed to send message:", error);
        setMessageContent(contentToSend);
        return;
      }

      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    });
  };

  const handlePickSearchUser = (user) => {
    setDisplayedUsers((prev) => movePeerFirst(prev, user));
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
