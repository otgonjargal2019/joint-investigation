import React from "react";
import { useTranslations } from "next-intl";

import Ellipse from "./icons/ellipse";

const StatusTag = ({ status }) => {
  const t = useTranslations();

  let text = "";
  let statusClasses = "";

  switch (status) {
    case "ONGOING":
      text = t("tag.ongoing");
      statusClasses = "border-[2px] border-color-61 text-color-24";
      break;
    case "COLLECTINGDIGITAL":
      text = t("tag.collecting-digital-evidence");
      statusClasses = "border border-color-42 text-color-20";
      break;
    default:
      text = t("tag.ongoing");
      statusClasses = "border-[2px] border-color-61";
  }

  const baseClasses =
    "flex gap-2 items-center h-[40px] text-center text-[20px] font-normal rounded-30 bg-white px-4";

  return (
    <span className={`${baseClasses} ${statusClasses}`}>
      {status === "ONGOING" && <Ellipse width={20} height={20} />}
      {text}
    </span>
  );
};

export default StatusTag;
