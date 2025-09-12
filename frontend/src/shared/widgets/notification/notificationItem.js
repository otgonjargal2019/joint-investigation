import React from "react";

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

export default NotificationItem;
