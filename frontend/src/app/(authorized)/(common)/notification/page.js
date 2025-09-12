"use client";

import React from "react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

import Button from "@/shared/components/button";
import PageTitle from "@/shared/components/pageTitle/page";
import RemoveArrow from "@/shared/components/icons/removeArrow";
import CheckCircle from "@/shared/components/icons/checkCircle";
import NotificationItem from "@/shared/widgets/notification/notificationItem";
import {
  notificationQuery,
  useDeleteAll,
  useReadAll,
} from "@/entities/notification";

function NotificationPage() {
  const t = useTranslations();

  const { data, isPending, refetch } = useQuery(
    notificationQuery.getNotifications()
  );

  const readAllMutation = useReadAll();
  const deleteAllMutation = useDeleteAll();

  const onDeleteAll = () => {
    deleteAllMutation.mutate(undefined, {
      onSuccess: (res) => {
        toast.success(res.data.message, {
          autoClose: 3000,
          position: "top-center",
        });
        refetch();
      },
      onError: (err) => {
        toast.error(err.response.data.message, {
          position: "top-center",
          autoClose: 2000,
        });
      },
    });
  };

  const onReadAll = () => {
    readAllMutation.mutate(undefined, {
      onSuccess: (res) => {
        toast.success(res.data.message, {
          autoClose: 3000,
          position: "top-center",
        });
        refetch();
      },
      onError: (err) => {
        toast.error(err.response.data.message, {
          position: "top-center",
          autoClose: 2000,
        });
      },
    });
  };

  const notifications = data?.data;

  return (
    <div>
      <PageTitle title={t("notification")} />
      <div>
        <div className="flex gap-3">
          {notifications?.length > 0 && (
            <>
              <Button
                className="gap-3"
                variant="white"
                size="mediumWithShadow"
                onClick={onDeleteAll}
              >
                <RemoveArrow /> {t("delete-whole-thing")}
              </Button>

              <Button
                className="gap-3"
                variant="white"
                size="mediumWithShadow"
                onClick={onReadAll}
              >
                <CheckCircle /> {t("full-reading")}
              </Button>
            </>
          )}
        </div>
        <div className="border border-color-36 rounded-10 mt-4 bg-white p-8 space-y-3">
          {notifications?.length > 0 ? (
            notifications?.map((item) => (
              <NotificationItem
                key={item.notificationId}
                title={item.title}
                content={item.content}
                createdAt={item.createdAtFormated}
                isRead={item.isRead}
                relatedUrl={item?.relatedUrl || null}
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
