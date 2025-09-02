"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import PageTitle from "@/shared/components/pageTitle/page";
import Detail from "@/shared/widgets/post/detail";

function NoticeDetailPage() {
  const t = useTranslations();
  const router = useRouter();

  const onClickList = () => router.push("/notice");

  return (
    <div>
      <PageTitle title={t("header.notice")} />
      <div className="flex justify-center mt-16">
        <div className="max-w-[1200px] w-full">
          <Detail onClickList={onClickList} />
        </div>
      </div>
    </div>
  );
}

export default NoticeDetailPage;
