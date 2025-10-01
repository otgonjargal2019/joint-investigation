"use client";

import { useLayoutEffect } from "react";

export default function useChatScroll({
  containerRef,
  selectedPeer,
  allMessages,
  currentUserId,
  markMessagesAsRead,
  limit = 10,
}) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !selectedPeer) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      50;
    const justSelectedPeer = allMessages.length <= limit;

    if (isNearBottom || justSelectedPeer) {
      container.scrollTop = container.scrollHeight;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const senderId = entry.target.getAttribute("data-sender-id");
          if (senderId && String(senderId) !== String(currentUserId)) {
            markMessagesAsRead(senderId);
          }
        });
      },
      { threshold: 0.5 }
    );

    const unreadMessages = container.querySelectorAll(
      '.message-bubble[data-is-read="false"]'
    );
    unreadMessages.forEach((msg) => observer.observe(msg));

    return () => observer.disconnect();
  }, [
    containerRef,
    selectedPeer,
    allMessages,
    currentUserId,
    markMessagesAsRead,
    limit,
  ]);
}
