"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import Button from "@/shared/components/button";
import PageTitle from "@/shared/components/pageTitle/page";
import InvestigationInfoDetail from "@/shared/widgets/investigationInfoDetail";

function NoticeDetailPage() {
  const t = useTranslations();
  const router = useRouter();

  const onClickList = () => router.push("/investigation-information");

  return (
    <div>
      <PageTitle title={t("header.notice")} />

      <div className="flex justify-center mt-4">
        <div className="max-w-[1200px] w-full">
          <div className="flex justify-end mb-4">
            <Button
              variant="white"
              onClick={() => router.push("/admin/announcement-management/edit")}
            >
              {t("edit")}
            </Button>
          </div>
          <InvestigationInfoDetail onClickList={onClickList} />
        </div>
      </div>
    </div>
  );
}

export default NoticeDetailPage;
