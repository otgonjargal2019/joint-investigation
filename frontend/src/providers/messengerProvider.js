"use client";

import { createContext, useContext, useState, useEffect } from "react";

const MessengerContext = createContext();

export const MessengerProvider = ({ children }) => {
  const [unreadUsersCount, setUnreadUsersCount] = useState(0);

  const [unreadUsers, setUnreadUsers] = useState(new Set());

  useEffect(() => {
    setUnreadUsersCount(unreadUsers.size);
  }, [unreadUsers]);

  return (
    <MessengerContext.Provider
      value={{
        unreadUsersCount,
        setUnreadUsersCount,
        unreadUsers,
        setUnreadUsers,
      }}
    >
      {children}
    </MessengerContext.Provider>
  );
};

export const useMessenger = () => useContext(MessengerContext);
