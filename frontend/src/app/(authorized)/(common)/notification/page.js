"use client";
import React from "react";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

import PageTitle from "@/shared/components/pageTitle/page";
import RemoveArrow from "@/shared/components/icons/removeArrow";
import CheckCircle from "@/shared/components/icons/checkCircle";
import Button from "@/shared/components/button";
import { notificationQuery } from "@/entities/notification";

const NotificationItem = ({
  title,
  content,
  createdAt,
  isRead,
  relatedUrl,
}) => {
  const contentObj = content ? JSON.parse(content) : {};
  return (
    <div
      className={`border border-color-66 rounded-5 shadow-md p-4 ${
        isRead ? "bg-white" : "bg-color-84"
      }`}
    >
      <div className="text-black text-[20px] font-bold mb-[3px]">{title}</div>

      <div className="grid grid-cols-[150px_1fr] gap-x-4 gap-y-1 text-[18px] font-medium text-color-25">
        {Object.entries(contentObj).map(([label, value], idx) => (
          <React.Fragment key={`${label}-${idx}`}>
            <div>{label}</div>
            <div>{value}</div>
          </React.Fragment>
        ))}
      </div>

      <div className="text-right text-color-25 text-sm mt-2">{createdAt}</div>
    </div>
  );
};

const olddata = [
  {
    status: "사건 종료",
    caseNumber: "3254",
    name: "웹툰 A 무단 복제사건",
    date: "2024-02-09 18:32:44",
    isRead: true,
  },
  {
    status: "사건 종료",
    caseNumber: "3254",
    name: "웹툰 A 무단 복제사건",
    date: "2024-02-09 18:32:44",
    isRead: true,
  },
];

function NotificationPage() {
  const t = useTranslations();

  const { data, isPending } = useQuery(notificationQuery.getNotifications());

  return (
    <div>
      <PageTitle title={t("notification")} />
      <div>
        <div className="flex gap-3">
          <Button className="gap-3" variant="white" size="mediumWithShadow">
            <RemoveArrow /> {t("delete-whole-thing")}
          </Button>

          <Button className="gap-3" variant="white" size="mediumWithShadow">
            <CheckCircle /> {t("full-reading")}
          </Button>
        </div>
        <div className="border border-color-36 rounded-10 mt-4 bg-white p-8 space-y-3">
          {data?.map((item) => (
            <NotificationItem
              key={item.notificationId}
              title={item.title}
              content={item.content}
              createdAt={item.createdAtFormated}
              isRead={item.isRead}
              relatedUrl={item?.relatedUrl || null}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default NotificationPage;
