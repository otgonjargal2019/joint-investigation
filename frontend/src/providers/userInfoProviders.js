"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userQuery } from "@/entities/user/user.query";

const UserInfoContext = createContext();

export const UserInfoProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [listCountry, setListCountry] = useState([]);
  const [listHeadquarter, setListHeadquarter] = useState([]);
  const [listDepartment, setListDepartment] = useState([]);

  const { data } = useQuery(userQuery.getUserProfile());

  useEffect(() => {
    if (!data) return;
    setUserInfo(data.userData);
    setListCountry(data.listCountry || []);
    setListHeadquarter(data.listHeadquarter || []);
    setListDepartment(data.listDepartment || []);
  }, [data]);

  const updateUserStatus = (newStatus) => {
    setUserInfo((prev) => {
      if (!prev) return prev;
      return { ...prev, status: newStatus };
    });
  };

  return (
    <UserInfoContext.Provider
      value={{
        userInfo,
        listCountry,
        listHeadquarter,
        listDepartment,
        updateUserStatus,
      }}
    >
      {children}
    </UserInfoContext.Provider>
  );
};

export const useUserInfo = () => {
  const context = useContext(UserInfoContext);
  if (!context) {
    throw new Error("useUserInfo must be used within an UserInfoProvider");
  }
  return context;
};
