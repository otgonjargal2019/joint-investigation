"use client";

import Image from "next/image";
import Circle from "@/shared/components/icons/circle";
import Ellipse from "@/shared/components/icons/ellipse";

export default function SidebarUserList({
  users,
  selectedPeer,
  unreadUsers,
  onSelect,
}) {
  return (
    <div>
      {users.length === 0 ? (
        <div className="text-sm text-gray-500 text-center">No users found</div>
      ) : (
        users.map((u) => (
          <div
            key={u.userId}
            className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-color-80 transition-colors ${
              selectedPeer?.userId === u.userId ? "bg-color-80" : ""
            }`}
            onClick={() => onSelect?.(u)}
          >
            <div className="w-[15px] flex-shrink-0">
              {unreadUsers?.has(u.userId) && (
                <Ellipse color="#564CDF" width={15} height={15} />
              )}
            </div>
            <div className="relative w-[60px] h-[60px] flex-shrink-0">
              {u?.profileImageUrl ? (
                <Image
                  src={u.profileImageUrl}
                  alt={u.displayName || "user image"}
                  fill
                  sizes="60px"
                  className="rounded-full object-cover"
                />
              ) : (
                <Circle width={60} height={60} />
              )}
            </div>
            <div className="w-full">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-black text-[18px] font-semibold">
                    {u.displayName}
                  </div>
                  <div className="text-color-41 font-normal text-[18px] truncate w-[208px]">
                    {u.lastMessage}
                  </div>
                </div>
                <div className="text-color-35 text-[16px] font-normal">
                  {u.lastMessageTime &&
                    new Date(u.lastMessageTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
