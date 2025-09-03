import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import * as Popover from "@radix-ui/react-popover";

import Box from "../components/icons/box";
import Case from "../components/icons/case";
import Openbook from "../components/icons/openbook";

const BulletinBoardManagementPopover = () => {
  const t = useTranslations();
  const router = useRouter();

  const [selected, setSelected] = useState(null);

  const handleClick = (key, path) => {
    setSelected(key);
    router.push(path);
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button aria-label="BulletinBoardManagement" className={`header-btn`}>
          <Box color="currentColor" />
          {t("header.bulletin-mgnt")}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="center"
          sideOffset={22}
          alignOffset={0}
          className="rounded-10 bg-color-4 shadow p-[5px] z-50"
        >
          <div className="flex flex-col gap-2">
            <button
              className={`header-btn ${
                selected === "notice" ? "active" : "popover"
              }`}
              onClick={() => handleClick("notice", "/admin/notice-management")}
            >
              <Case color="currentColor" />
              {t("header.notice-mgnt")}
            </button>

            <button
              className={`header-btn ${
                selected === "research" ? "active" : "popover"
              }`}
              onClick={() =>
                handleClick("research", "/admin/research-management")
              }
            >
              <Openbook color="currentColor" />
              {t("header.research-mgnt")}
            </button>
          </div>

          <Popover.Arrow className="fill-color-4" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default BulletinBoardManagementPopover;
