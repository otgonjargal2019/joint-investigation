"use client";

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
  return (
    <div
      className={`border border-color-66 rounded-5 shadow-md p-4 ${
        isRead ? "bg-white" : "bg-color-84"
      }`}
    >
      <div className="text-black text-[20px] font-bold mb-[3px]">{title}</div>

      <div
        className="grid gap-y-1 gap-x-4 text-[18px] font-medium text-color-25"
        style={{ gridTemplateColumns: "100px 1fr" }}
      >
        <div>사건번호</div>
        <div>test1</div>
        <div>사건 명</div>
        <div>test2</div>
        <div>변경 일시</div>
        <div>{createdAt}</div>
      </div>
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
