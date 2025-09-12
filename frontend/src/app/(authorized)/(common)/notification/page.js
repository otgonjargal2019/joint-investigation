"use client";

import React from "react";
import { useTranslations } from "next-intl";

import Button from "@/shared/components/button";
import PageTitle from "@/shared/components/pageTitle/page";
import RemoveArrow from "@/shared/components/icons/removeArrow";
import CheckCircle from "@/shared/components/icons/checkCircle";
import NotificationItem from "@/shared/widgets/notification/notificationItem";

import { useRealTime } from "@/providers/realtimeProvider";

function NotificationPage() {
  const t = useTranslations();
  const {
    allNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteAllNotifications,
  } = useRealTime();

  return (
    <div>
      <PageTitle title={t("notification")} />
      <div>
        <div className="flex gap-3">
          {allNotifications?.length > 0 && (
            <>
              <Button
                className="gap-3"
                variant="white"
                size="mediumWithShadow"
                onClick={deleteAllNotifications}
              >
                <RemoveArrow /> {t("delete-whole-thing")}
              </Button>

              <Button
                className="gap-3"
                variant="white"
                size="mediumWithShadow"
                onClick={markAllNotificationsAsRead}
              >
                <CheckCircle /> {t("full-reading")}
              </Button>
            </>
          )}
        </div>
        <div className="border border-color-36 rounded-10 mt-4 bg-white p-8 space-y-3">
          {allNotifications?.length > 0 ? (
            allNotifications?.map((item) => (
              <NotificationItem
                key={item.notificationId}
                title={item.title}
                content={item.content}
                createdAt={item.createdAtFormated}
                isRead={item.isRead}
                relatedUrl={item?.relatedUrl || null}
                onClick={() => markNotificationAsRead(item.notificationId)}
              />
            ))
          ) : (
            <div className="text-center text-color-25 text-sm mt-2">
              {t("no-nofication")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationPage;
