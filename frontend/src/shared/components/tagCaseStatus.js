import React from "react";
import { useTranslations } from "next-intl";

import Ellipse from "./icons/ellipse";

const StatusTag = ({ status }) => {
  const t = useTranslations();

  let text = "";
  let statusClasses = "";

  switch (status) {
    case "OPEN":
      text = t(`case_details.case_status.${status}`);
      break;
    case "ON_HOLD":
      text = t(`case_details.case_status.${status}`);
      break;
    case "CLOSED":
      text = t(`case_details.case_status.${status}`);
      break;
    default:
      break;
  }

  const baseClasses =
    "flex gap-2 items-center justify-center h-[40px] text-center text-[20px] font-normal rounded-30 px-4";

  return (
    <span className={`${baseClasses} ${statusClasses}`}>
      {status === "OPEN" && <Ellipse width={20} height={20} />}
      {status !== "OPEN" && <Ellipse color="#d8d6ef" width={20} height={20} />}
      {text}
    </span>
  );
};

export default StatusTag;
