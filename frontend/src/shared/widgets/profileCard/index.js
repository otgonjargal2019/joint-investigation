"use client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import Bell from "../../components/icons/bell";
import User from "../../components/icons/user";
import PaperPlane from "../../components/icons/paperplane";
import "./profileCard.css";

const ProfileCard = ({
  name,
  unreadNotifications,
  unreadMessages,
  department,
  headquarters,
}) => {
  const t = useTranslations();

  const router = useRouter();

  return (
    <div className="profile-card-wrapper bg-color-7 rounded-20 p-[18px] shadow-md">
      <div className="flex justify-end">
        <button
          className="text-color-54 text-right text-[16px] font-normal cursor-pointer"
          onClick={() => router.push("/profile")}
        >
          {t("profile-card.modifying-membership-information")}
        </button>
      </div>

      <div className="flex flex-col gap-4 justify-center items-center text-center mt-8">
        <User />
        <p className="text-white text-[24px]">{name}</p>
        <div className="flex items-center gap-[10px] bg-color-88 rounded-[5px] px-8 py-[5px] text-color-89 text-[24px]">
          <p>{headquarters}</p>
          <div className="w-[2px] h-[25px] bg-color-87"></div>
          <p>{department}</p>
        </div>
        <div className="w-full px-3 flex justify-between items-center">
          <div className="flex gap-3">
            <Bell />
            <p className="text-white">
              {t("profile-card.unread-notifications")}
            </p>
          </div>
          <div className="text-[20px] flex gap-2">
            <button
              className="text-color-90 font-[700] underline cursor-pointer"
              onClick={() => router.push("/notification")}
            >
              {unreadNotifications}
            </button>
            <span className="text-color-69 font-[350]">{t("case")}</span>
          </div>
        </div>
        <div className="w-full px-3 flex justify-between items-center">
          <div className="flex gap-3">
            <PaperPlane />
            <p className="text-white">{t("profile-card.unread-messages")}</p>
          </div>
          <div className="text-[20px] flex gap-2">
            <button
              className="text-color-90 font-[700] underline cursor-pointer"
              onClick={() => router.push("/messenger")}
            >
              {unreadMessages}
            </button>
            <span className="text-color-69 font-[350]">{t("case")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
