"use client";

import { useTransition, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

import NotificationPopover from "@/shared/widgets/notificationPopover";
import BulletinBoardManagementPopover from "@/shared/widgets/bulletinBoardManagementPopover";
import Case from "../../components/icons/case";
import Logo from "../../components/icons/logo";
import Indent from "../../components/icons/indent";
import LogOut from "../../components/icons/logOut";
import Openbook from "../../components/icons/openbook";
import Dashboard from "../../components/icons/dashboard";
import PaperPlane from "../../components/icons/paperplane";
import UsersSmaller from "../../components/icons/usersSmaller";
import UserAvatar from "./userAvatar";
import Layers from "../../components/icons/layers";
import { useAuth } from "@/providers/authProviders";
import { useUserInfo } from "@/providers/userInfoProviders";
import { logout } from "@/app/actions/auth";
import { useRealTime } from "@/providers/realtimeProvider";
import { ROLES } from "@/shared/dictionary";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations();

  const {
    lastNotifications,
    unreadNotifCount,
    markNotificationAsRead,
    unreadUsersCount,
  } = useRealTime();

  const { user } = useAuth();
  if (!user) return null;

  const { userInfo } = useUserInfo();
  const isActive = (path) => pathname.startsWith(path);

  const incidentLink = useMemo(() => {
    if (user?.role === ROLES.PLATFORM_ADMIN || user?.role === ROLES.INV_ADMIN) {
      return "/manager/cases";
    } else if (
      user?.role === ROLES.INVESTIGATOR ||
      user?.role === ROLES.RESEARCHER ||
      user?.role === ROLES.COPYRIGHT_HOLDER
    ) {
      return "/investigator/cases";
    }
    return "/";
  }, [user]);

  function handleLogout() {
    startTransition(async () => {
      await logout();
      router.push("/login");
    });
  }

  const handleNavigation = (path) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="header-wrapper bg-color-4 px-4 sm:px-7 xl:px-5 rounded-20 flex justify-between items-center min-h-[104px] relative">
      {/* Logo and Title */}
      <div
        className="flex items-center gap-2 mr-4 xl:mr-5 2xl:mr-10 cursor-pointer shrink-0"
        onClick={() => router.push("/")}
      >
        <Logo />
        <h2 className="application-name">{t("header.title")}</h2>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden xl:flex items-center gap-2 flex-1 justify-center xl:justify-start">
        <button
          className={`header-btn ${isActive(incidentLink) ? "active" : ""}`}
          onClick={() => router.push(incidentLink)}
        >
          <Dashboard color="currentColor" />
          {t("header.current-state-entire-incident")}
        </button>
        <button
          className={`header-btn ${
            isActive("/status-edition-summary") ? "active" : ""
          }`}
          onClick={() => router.push("/status-edition-summary")}
        >
          <Indent color="currentColor" />
          {t("header.status-edition-summary")}
        </button>
        {user.role === ROLES.PLATFORM_ADMIN ? (
          <>
            <button
              className={`header-btn ${
                isActive("/admin/account-management") ? "active" : ""
              }`}
              onClick={() => router.push("/admin/account-management")}
            >
              <UsersSmaller color="currentColor" />
              {t("header.account-mgnt")}
            </button>
            <button
              className={`header-btn ${
                isActive("/admin/resource-management") ? "active" : ""
              }`}
              onClick={() => router.push("/admin/resource-management")}
            >
              <Layers color="currentColor" />
              {t("header.resource-mgnt")}
            </button>
            <BulletinBoardManagementPopover />
          </>
        ) : (
          <>
            <button
              className={`header-btn ${isActive("/research") ? "active" : ""}`}
              onClick={() => router.push("/research")}
            >
              <Openbook color="currentColor" />
              {t("header.research")}
            </button>
            <button
              className={`header-btn ${isActive("/notice") ? "active" : ""}`}
              onClick={() => router.push("/notice")}
            >
              <Case color="currentColor" />
              {t("header.notice")}
            </button>
          </>
        )}
      </div>

      {/* User Info and Actions */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-5">
          <button
            className="relative cursor-pointer text-white"
            onClick={() => router.push("/messenger")}
          >
            <PaperPlane color="#C3C3C3" size={24} />
            {unreadUsersCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-color-17 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {unreadUsersCount}
              </span>
            )}
          </button>

          <NotificationPopover
            notifications={lastNotifications}
            unreadCount={unreadNotifCount}
            markAsRead={markNotificationAsRead}
          />
        </div>

        <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
          <button
            className="cursor-pointer"
            onClick={() => router.push("/profile")}
          >
            <UserAvatar avatar={userInfo?.profileImageUrl} />
          </button>
          <div className="hidden sm:block">
            <div className="text-white text-[20px] font-medium">
              {userInfo?.nameKr || userInfo?.nameEn}
            </div>
            <div
              className="
                hidden
                xl:flex xl:flex-col
                2xl:flex-row 2xl:items-center
                text-color-51 text-[13px] sm:text-[15px] font-medium
              "
            >
              <span>{userInfo?.headquarterName}</span>
              <div className="hidden 2xl:block w-[1px] h-4 bg-color-51 mx-3" />
              <span>{userInfo?.departmentName}</span>
            </div>
          </div>
          <div className="hidden sm:block w-[2px] h-12 bg-color-101 mx-2" />
          <button
            className="cursor-pointer"
            onClick={handleLogout}
            disabled={isPending}
          >
            <LogOut color="#C3C3C3" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="xl:hidden flex flex-col gap-1 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div
            className={`w-6 h-0.5 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          ></div>
          <div
            className={`w-6 h-0.5 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? "opacity-0" : ""
            }`}
          ></div>
          <div
            className={`w-6 h-0.5 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          ></div>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-color-4 rounded-b-20 shadow-lg z-50 mt-2">
          <div className="p-4 space-y-3">
            {/* Mobile User Info */}
            <div className="flex items-center gap-3 pb-3 border-b border-color-101">
              <UserAvatar avatar={userInfo?.profileImageUrl} size={50} />
              <div>
                <div className="text-white text-[18px] font-medium">
                  {userInfo?.nameKr || userInfo?.nameEn}
                </div>
                <div className="text-color-51 text-[13px] font-medium">
                  {/* {user.headquarters} • {user.department} */}
                  {userInfo?.headquarterName} • {userInfo?.departmentName}
                </div>
              </div>
            </div>

            {/* Mobile Navigation Items */}
            <div className="space-y-2">
              <button
                className={`header-btn mobile-btn ${
                  isActive(incidentLink) ? "active" : ""
                }`}
                onClick={() => handleNavigation(incidentLink)}
              >
                <Dashboard color="currentColor" />

                {t("header.current-state-entire-incident")}
              </button>

              <button
                className={`header-btn mobile-btn ${
                  isActive("/status-edition-summary") ? "active" : ""
                }`}
                onClick={() => handleNavigation("/status-edition-summary")}
              >
                <Indent color="currentColor" />

                {t("header.status-edition-summary")}
              </button>

              {user.role === ROLES.PLATFORM_ADMIN ? (
                <>
                  <button
                    className={`header-btn mobile-btn ${
                      isActive("/admin/account-management") ? "active" : ""
                    }`}
                    onClick={() =>
                      handleNavigation("/admin/account-management")
                    }
                  >
                    <UsersSmaller color="currentColor" />
                    {t("header.account-mgnt")}
                  </button>

                  <button
                    className={`header-btn mobile-btn ${
                      isActive("/admin/resource-management") ? "active" : ""
                    }`}
                    onClick={() =>
                      handleNavigation("/admin/resource-management")
                    }
                  >
                    <Layers color="currentColor" />
                    {t("header.resource-mgnt")}
                  </button>

                  <button
                    className={`header-btn mobile-btn ${
                      isActive("/admin/notice-management") ? "active" : ""
                    }`}
                    onClick={() => handleNavigation("/admin/notice-management")}
                  >
                    <Case color="currentColor" />
                    {t("header.notice-mgnt")}
                  </button>

                  <button
                    className={`header-btn mobile-btn ${
                      isActive("/admin/research-management") ? "active" : ""
                    }`}
                    onClick={() =>
                      handleNavigation("/admin/research-management")
                    }
                  >
                    <Openbook color="currentColor" />
                    {t("header.research-mgnt")}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`header-btn mobile-btn ${
                      isActive("/research") ? "active" : ""
                    }`}
                    onClick={() => handleNavigation("/research")}
                  >
                    <Openbook color="currentColor" />
                    {t("header.research")}
                  </button>
                  <button
                    className={`header-btn mobile-btn ${
                      isActive("/notice") ? "active" : ""
                    }`}
                    onClick={() => handleNavigation("/notice")}
                  >
                    <Case color="currentColor" />
                    {t("header.notice")}
                  </button>
                </>
              )}
            </div>

            {/* Mobile Actions */}
            {/* <div className="flex items-center gap-4 pt-3 border-t border-color-101">
              <button
                className="cursor-pointer p-2"
                onClick={() => handleNavigation("/messenger")}
              >
                <PaperPlane color="#C3C3C3" />
              </button>

              <NotificationPopover
                title="사건 종료"
                data={[
                  { label: "사건번호", value: "3254" },
                  { label: "사건 명", value: "웹툰 A 무단 복제사건" },
                  { label: "변경 일시", value: "2024-02-09 18:32:44" },
                ]}
                data2={[
                  { label: "사건번호", value: "3254" },
                  { label: "사건 명", value: "영화 B 무단 스트리밍 사건" },
                  { label: "수사 기록 명", value: "관련자 제보" },
                  { label: "업데이트 일시", value: "2024-01-05 13:22:09" },
                ]}
              />
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
