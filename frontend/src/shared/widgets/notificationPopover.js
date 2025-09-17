import React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import * as Popover from "@radix-ui/react-popover";

import Bell from "../components/icons/bell";
import Ellipse from "../components/icons/ellipse";
import Button from "../components/button";

const NotificationPopover = ({ notifications, unreadCount, markAsRead }) => {
  const t = useTranslations();
  const router = useRouter();

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          title="Notifications"
          aria-label="Notifications"
          className="relative cursor-pointer"
        >
          <Bell color="#C3C3C3" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-color-61 w-3 h-3 rounded-full"></span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="center"
          sideOffset={38}
          alignOffset={0}
          className="rounded-20 bg-color-4 shadow w-[419px] h-[425px] p-4 z-50 flex flex-col"
        >
          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2">
            {notifications?.map((notif) => (
              <div
                key={notif.notificationId}
                className={`bg-color-9 ${
                  notif.isRead ? "" : "border-[2px] border-color-61"
                } rounded-10 py-3 px-5 cursor-pointer`}
                onClick={() => {
                  if (notif.relatedUrl) {
                    router.push(notif.relatedUrl);
                  }
                  markAsRead(notif.notificationId);
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="text-white text-[18px] font-bold">
                    {notif.title}
                  </div>
                  <div>{!notif.isRead && <Ellipse />}</div>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-1">
                  {notif?.content &&
                    Object.entries(JSON.parse(notif.content)).map(
                      ([label, value], idx) => (
                        <React.Fragment key={`${label}-${idx}`}>
                          <div className="text-color-43 text-[16px] font-medium">
                            {label}
                          </div>
                          <div className="text-color-59 text-[16px] font-normal">
                            {value}
                          </div>
                        </React.Fragment>
                      )
                    )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <Button
              size="extraSmall"
              variant="dark2"
              onClick={() => router.push("/notification")}
            >
              {t("see-more")}
            </Button>
          </div>

          <Popover.Arrow className="fill-color-4" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default NotificationPopover;
