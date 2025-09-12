"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { profileQuery}  from "@/entities/profile/profile.query";

const UserInfoContext = createContext();

export const UserInfoProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);

  const { data } = useQuery(profileQuery.getProfile());

  useEffect(() => {
    if (!data) return;
    const headquarter = Array.isArray(data?.listHeadquarter)
      ? data.listHeadquarter.find(h => h.id === data.userData?.headquarterId)
      : null;

    const department = Array.isArray(data?.listDepartments)
      ? data.listDepartments.find(d => d.id === data.userData?.departmentId)
      : null;
    setUserInfo({
      ...data?.userData,
      headquarterName: headquarter?.name || null,
      departmentName: department?.name || null
    });
  }, [data]);


  return (
    <UserInfoContext.Provider value={{ userInfo }}>
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


