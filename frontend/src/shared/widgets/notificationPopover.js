import React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import * as Popover from "@radix-ui/react-popover";

import Bell from "../components/icons/bell";
import Ellipse from "../components/icons/ellipse";
import Button from "../components/button";

const NotificationPopover = ({
  notifications,
  hasNew,
  markAsRead,
  title,
  data,
  data2,
}) => {
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
          {hasNew && (
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
          className="rounded-20 bg-color-4 shadow p-4 w-[419px] h-[425px] z-50"
        >
          {notifications?.map((notif) => (
            <div
              key={notif.notificationId}
              className={`bg-color-9 ${
                notif.isRead ? "" : "border-[2px] border-color-61"
              } rounded-10 py-3 px-5 space-y-2`}
            >
              <div className="flex justify-between items-center">
                <div className="text-white text-[18px] font-bold">
                  {notif.title}
                </div>
                <div>{!notif.isRead && <Ellipse />}</div>
              </div>
            </div>
          ))}

          {/* <div className="bg-color-9 border-[2px] border-color-61 rounded-10 py-3 px-5 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-white text-[18px] font-bold">{title}</div>
              <div>
                <Ellipse />
              </div>
            </div>

            <dl
              className="grid gap-x-4 gap-y-1"
              style={{ gridTemplateColumns: "100px 200px" }}
            >
              {data.map((item, index) => (
                <React.Fragment key={index}>
                  <dt className="text-color-43 text-[16px] font-medium">
                    {item.label}
                  </dt>
                  <dd className="text-color-59 text-[16px] font-normal">
                    {item.value}
                  </dd>
                </React.Fragment>
              ))}
            </dl>
          </div>
          <div className="bg-color-9 rounded-10 mt-2.5 py-3 px-5 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-white text-[18px] font-bold">
                신규 수사 기록 추가
              </div>
            </div>

            <dl
              className="grid gap-x-4 gap-y-1"
              style={{ gridTemplateColumns: "100px 200px" }}
            >
              {data2.map((item, index) => (
                <React.Fragment key={index}>
                  <dt className="text-color-43 text-[16px] font-medium">
                    {item.label}
                  </dt>
                  <dd className="text-color-59 text-[16px] font-normal">
                    {item.value}
                  </dd>
                </React.Fragment>
              ))}
            </dl>
          </div> */}
          <div className="flex justify-center pt-6">
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
