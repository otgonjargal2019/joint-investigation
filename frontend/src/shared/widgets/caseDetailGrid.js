import { useTranslations } from "next-intl";

const formatDate = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return dateString;
  }
};

const GrayDiv = ({ className, children }) => (
  <div
    className={`bg-color-72 py-1.5 px-3 border-b border-color-53 ${className}`}
  >
    {children}
  </div>
);

const WhiteDiv = ({ className, children }) => (
  <div
    className={`py-1.5 px-3 border-b border-color-53 whitespace-normal break-words ${className}`}
  >
    {children}
  </div>
);

function CaseDetailGrid({ item }) {
  const t = useTranslations();
  return (
    <div className="grid grid-cols-[130px_1fr_140px_1fr_165px_1fr_3fr] gap-0 text-color-24 text-[20px] font-normal leading-[31px]">
      <GrayDiv className="border-t">{t("case-detail.case-number")}</GrayDiv>
      <WhiteDiv className="border-t">{`#${item?.number || ""}. ${
        item?.caseId || ""
      }`}</WhiteDiv>
      <GrayDiv className="border-t">
        {t("case-detail.date-of-occurrence")}
      </GrayDiv>
      <WhiteDiv className="border-t">
        {formatDate(item?.investigationDate)}
      </WhiteDiv>
      <GrayDiv className="border-t">
        {t("case-detail.ranking-of-investigate-responses")}
      </GrayDiv>
      <WhiteDiv className="border-t">{item?.priority}</WhiteDiv>
      <GrayDiv className="border-t">{t("case-detail.other-matters")}</GrayDiv>
      <GrayDiv>{t("case-detail.country-concerned")}</GrayDiv>
      <WhiteDiv>{item?.relatedCountries}</WhiteDiv>
      <GrayDiv>{t("case-detail.content-type")}</GrayDiv>
      <WhiteDiv>{item?.contentType}</WhiteDiv>
      <GrayDiv>{t("case-detail.types-of-copyright-infringement")}</GrayDiv>
      <WhiteDiv>
        {item?.infringementType
          ? t(`case_details.case_infringement_type.${item?.infringementType}`)
          : ""}
      </WhiteDiv>
      <WhiteDiv className="row-span-3 border-l text-[18px]">
        {item?.etc}
      </WhiteDiv>
      <GrayDiv>{t("case-detail.incident-name")}</GrayDiv>
      <WhiteDiv className="col-span-5">{item?.caseName}</WhiteDiv>
      <GrayDiv>{t("case-detail.case-overview")}</GrayDiv>
      <WhiteDiv className="col-span-5 text-[18px]">
        {item?.caseOutline}
      </WhiteDiv>
    </div>
  );
}

export default CaseDetailGrid;
