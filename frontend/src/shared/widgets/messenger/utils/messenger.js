"use client";

export const mergeMessages = (prevMessages, newMessages, prepend = false) => {
  const map = new Map();
  const combined = prepend
    ? [...newMessages, ...prevMessages]
    : [...prevMessages, ...newMessages];
  combined.forEach((m) => map.set(m.messageId, m));
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );
};

export const movePeerFirst = (list, peer) => {
  if (!peer) return list;

  const existing = Array.isArray(list)
    ? list.find((u) => u.userId === peer.userId)
    : null;

  const top = {
    ...peer,
    lastMessage: peer.lastMessage ?? existing?.lastMessage ?? "",
    lastMessageTime: peer.lastMessageTime ?? existing?.lastMessageTime ?? null,
  };

  const rest = Array.isArray(list)
    ? list.filter((u) => u.userId !== peer.userId)
    : [];

  return [top, ...rest];
};
