"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import Logo from "../../components/icons/logo";

const SimpleHeader = () => {
  const t = useTranslations();
  const router = useRouter();

  return (
    <div className="header-wrapper bg-color-4 px-7 rounded-20 flex justify-between items-center min-h-[104px]">
      <div className="flex gap-2 items-center">
        <div
          className="flex items-center gap-2 mr-10 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Logo />
          <h2 className="text-white application-name">{t("header.title")}</h2>
        </div>
      </div>
    </div>
  );
};

export default SimpleHeader;
