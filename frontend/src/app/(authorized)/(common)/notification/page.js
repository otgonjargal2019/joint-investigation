"use client";

import React from "react";
import { useTranslations } from "next-intl";
import InfiniteScroll from "react-infinite-scroll-component";

import Button from "@/shared/components/button";
import PageTitle from "@/shared/components/pageTitle/page";
import RemoveArrow from "@/shared/components/icons/removeArrow";
import CheckCircle from "@/shared/components/icons/checkCircle";
import NotificationItem from "@/shared/widgets/notification/notificationItem";
import { useRealTime } from "@/providers/realtimeProvider";

function NotificationPage() {
  const t = useTranslations();
  const {
    pages,
    hasMore,
    fetchNextPage,
    deleteAllNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useRealTime();

  return (
    <div>
      <PageTitle title={t("notification")} />
      <div>
        <div className="flex gap-3">
          {pages.flat().length > 0 && (
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
        <div className="border border-color-36 rounded-10 mt-4 bg-white p-8">
          <InfiniteScroll
            className="space-y-3"
            dataLength={pages.flat().length} // number of items currently loaded
            next={fetchNextPage} // fetch next page when scrolling
            hasMore={hasMore} // true/false from provider
            loader={<p className="text-center mt-2">{t("loading")}...</p>}
            height={600} // or any container height
            endMessage={
              <p className="text-center mt-2 text-color-25">
                {t("no-more-notification")}
              </p>
            }
          >
            {pages.flat().map((item) => (
              <NotificationItem
                key={item.notificationId}
                title={item.title}
                content={item.content}
                createdAt={item.createdAtFormated}
                isRead={item.isRead}
                relatedUrl={item?.relatedUrl || null}
                onClick={() => markNotificationAsRead(item.notificationId)}
              />
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
}

export default NotificationPage;
