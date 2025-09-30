"use client";

import Image from "next/image";
import Circle from "@/shared/components/icons/circle";

export default function ChatMessages({
  containerRef,
  messages,
  selectedPeer,
  currentUserId,
  onScroll,
}) {
  if (!selectedPeer) {
    return (
      <div className="flex-1 overflow-auto px-2 flex items-center justify-center text-sm text-gray-500">
        Select a conversation
      </div>
    );
  }

  const filtered = messages.filter(
    (m) =>
      (m.senderId === currentUserId && m.recipientId === selectedPeer.userId) ||
      (m.senderId === selectedPeer.userId && m.recipientId === currentUserId)
  );

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto space-y-3 px-2"
      onScroll={onScroll}
    >
      {filtered.length === 0 ? (
        <div className="text-sm text-gray-500 text-center mt-4">
          No messages
        </div>
      ) : (
        filtered.map((m, index) => {
          const isMe = m.senderId === currentUserId;
          return (
            <div
              key={m.messageId || `${m.senderId}-${m.createdAt}-${index}`}
              className={`flex gap-4 ${isMe ? "justify-end" : "justify-start"}`}
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
                    isMe ? "bg-color-61 text-black" : "bg-color-1 text-black"
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
  );
}
