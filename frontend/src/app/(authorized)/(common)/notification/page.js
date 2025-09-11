"use client";

import { useTranslations } from "next-intl";

import PageTitle from "@/shared/components/pageTitle/page";
import RemoveArrow from "@/shared/components/icons/removeArrow";
import CheckCircle from "@/shared/components/icons/checkCircle";
import Button from "@/shared/components/button";

const NotificationItem = ({ status, caseNumber, name, date, isRead }) => {
  return (
    <div
      className={`border border-color-66 rounded-5 shadow-md p-4 ${
        isRead ? "bg-color-84" : "bg-white"
      }`}
    >
      <div className="text-black text-[20px] font-bold mb-[3px]">{status}</div>

      <div
        className="grid gap-y-1 gap-x-4 text-[18px] font-medium text-color-25"
        style={{ gridTemplateColumns: "100px 1fr" }}
      >
        <div>사건번호</div>
        <div>{caseNumber}</div>
        <div>사건 명</div>
        <div>{name}</div>
        <div>변경 일시</div>
        <div>{date}</div>
      </div>
    </div>
  );
};

function Notification() {
  const t = useTranslations();
  const data = [
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
    {
      status: "사건 종료",
      caseNumber: "3254",
      name: "웹툰 A 무단 복제사건",
      date: "2024-02-09 18:32:44",
      isRead: false,
    },
    {
      status: "사건 종료",
      caseNumber: "3254",
      name: "웹툰 A 무단 복제사건",
      date: "2024-02-09 18:32:44",
      isRead: false,
    },
    {
      status: "사건 종료",
      caseNumber: "3254",
      name: "웹툰 A 무단 복제사건",
      date: "2024-02-09 18:32:44",
      isRead: false,
    },
    {
      status: "사건 종료",
      caseNumber: "3254",
      name: "웹툰 A 무단 복제사건",
      date: "2024-02-09 18:32:44",
      isRead: false,
    },
  ];

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
          {data.map((item, idx) => (
            <NotificationItem
              key={idx}
              status={item.status}
              caseNumber={item.caseNumber}
              name={item.name}
              date={item.date}
              isRead={item.isRead}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Notification;
