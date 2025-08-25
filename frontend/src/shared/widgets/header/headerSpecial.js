"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import Logo from "../../components/icons/logo";
import LogOut from "../../components/icons/logOut";

import { useAuth } from "@/providers/authProviders";
import { logout } from "@/app/actions/auth";

const HeaderSpecial = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations();

  const { user } = useAuth();
  if (!user) return null;

  function handleLogout() {
    startTransition(async () => {
      await logout();
      router.push("/login");
    });
  }

  return (
    <div className="header-wrapper bg-black px-4 sm:px-7 xl:px-5 flex justify-between items-center min-h-[104px] relative">
      {/* Logo and Title */}
      <div
        className="flex-1 flex items-center justify-center gap-2 mr-4 md:mr-10 cursor-pointer shrink-0"
        onClick={() => router.push("/")}
      >
        <Logo />
        <h2 className="text-white application-name hidden sm:block">
          {t("header.title")}
        </h2>
      </div>

      {/* User Info and Actions */}
      <div className="flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12">
        <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
          <button
            className="cursor-pointer"
            onClick={handleLogout}
            disabled={isPending}
          >
            <LogOut color="#C3C3C3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderSpecial;
