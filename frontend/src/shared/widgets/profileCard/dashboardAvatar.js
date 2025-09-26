"use client";

import User from "../../components/icons/user";

const DashboardAvatar = ({ avatar }) => {
  return avatar ? (
    <img
      src={avatar}
      alt="Dashboard Avatar"
      className="w-24 h-24 rounded-full object-cover"
    />
  ) : (
    <User />
  );
};

export default DashboardAvatar;
