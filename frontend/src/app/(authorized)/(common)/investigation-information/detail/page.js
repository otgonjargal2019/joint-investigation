"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import Button from "@/shared/components/button";
import InvestigationInfoDetail from "@/shared/widgets/investigationInfoDetail";
import PageTitle from "@/shared/components/pageTitle/page";

function InvestigationInfoDetailPage() {
  const t = useTranslations();
  const router = useRouter();

  const onClickList = () => router.push("/investigation-information");

  return (
    <div>
      <PageTitle title={t("header.investigation-information")} />

      <div className="flex justify-center mt-4">
        <div className="max-w-[1200px] w-full">
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="white">{t("edit")}</Button>
            <Button variant="white">{t("delete")}</Button>
          </div>
          <InvestigationInfoDetail onClickList={onClickList} />
        </div>
      </div>
    </div>
  );
}

export default InvestigationInfoDetailPage;
