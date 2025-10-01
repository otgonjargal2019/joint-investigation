"use client";

import { useTranslations } from "next-intl";

import "./caseCard.css";

const CaseCard = ({
  size = "small",
  label,
  code,
  desc,
  color,
  country,
  isLoading = true,
  onClick,
}) => {
  const t = useTranslations();

  return (
    <div
      className="case-card-wrapper w-full flex bg-white rounded-10 shadow-md overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <div
            className={`bg-color-94 ${
              size == "small" ? "case-card-head" : "case-card-head-2"
            } flex justify-center items-center flex-shrink-0`}
          >
            <div className="text-white text-[18px] font-[500]">-</div>
          </div>
          <div className="flex p-5 items-center min-w-0 flex-1">
            <div className="text-color-46 text-[20px] font-[400] truncate">
              {t("case-card.no-events-assigned")}
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className={`${color} ${
              size == "small" ? "case-card-head" : "case-card-head-2"
            } flex flex-col justify-center items-center flex-shrink-0`}
          >
            <div className="text-[18px] font-[500] text-white text-center px-1">
              {label}
            </div>
            <div className="text-[17px] font-[400] text-color-1 text-center px-1">
              {country}
            </div>
          </div>
          <div className="p-5 text-[20px] text-color-24 min-w-0 flex-1">
            <div className="font-[400] truncate">{code}</div>
            <div className="font-[700] truncate">{desc}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default CaseCard;
