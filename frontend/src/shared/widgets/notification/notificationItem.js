import React from "react";
import { useTranslations } from "next-intl";

const NotificationItem = ({ title, content, createdAt, isRead, onClick }) => {
  const t = useTranslations();
  const contentObj = content ? JSON.parse(content) : {};

  return (
    <div
      className={`border border-color-66 rounded-5 shadow-md p-4 cursor-pointer ${
        isRead ? "bg-white" : "bg-color-84"
      }`}
      onClick={onClick}
    >
      <div className="text-black text-[20px] font-bold mb-[3px]">
        {t(title)}
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[18px] font-medium text-color-25">
        {Object.entries(contentObj).map(([label, value], idx) => (
          <React.Fragment key={`${label}-${idx}`}>
            <div>{t(label)}</div>
            <div>
              {label === "NOTIFICATION-KEY.PREVIOUS-PROGRESS" ||
              label === "NOTIFICATION-KEY.CURRENT-PROGRESS" ||
              label === "NOTIFICATION-KEY.PREVIOUS-ROLE" ||
              label === "NOTIFICATION-KEY.CURRENT-ROLE"
                ? t(value)
                : value}
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="text-right text-color-25 text-sm mt-2">{createdAt}</div>
    </div>
  );
};

export default NotificationItem;
