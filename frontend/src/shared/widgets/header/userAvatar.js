"use client";

import UserSmall from "../../components/icons/userSmall";

const UserAvatar = ({avatar}) => {
  return avatar ? (
    <img
      src={avatar}
      alt="User"
      className="w-12 h-12 rounded-full object-cover"
    />
  ) : (
    <UserSmall />
  );
};

export default UserAvatar;
