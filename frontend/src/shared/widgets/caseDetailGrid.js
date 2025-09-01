import { useTranslations } from "next-intl";

const GrayDiv = ({ className, children }) => (
  <div
    className={`bg-color-72 py-1.5 px-3 border-b border-color-53 ${className}`}
  >
    {children}
  </div>
);

const WhiteDiv = ({ className, children }) => (
  <div className={`py-1.5 px-3 border-b border-color-53 ${className}`}>
    {children}
  </div>
);

function CaseDetailGrid({ item }) {
  const t = useTranslations();
  return (
    <div className="grid grid-cols-[130px_1fr_140px_1fr_165px_1fr_3fr] gap-0 text-color-24 text-[20px] font-normal leading-[31px]">
      <GrayDiv className="border-t">{t("case-detail.case-number")}</GrayDiv>
      <WhiteDiv className="border-t">{item?.caseId}</WhiteDiv>
      <GrayDiv className="border-t">
        {t("case-detail.date-of-occurrence")}
      </GrayDiv>
      <WhiteDiv className="border-t">{item?.createdAt}</WhiteDiv>
      <GrayDiv className="border-t">
        {t("case-detail.ranking-of-investigate-responses")}
      </GrayDiv>
      <WhiteDiv className="border-t">{item?.priority}</WhiteDiv>
      <GrayDiv className="border-t">{t("case-detail.other-matters")}</GrayDiv>
      <GrayDiv>{t("case-detail.country-concerned")}</GrayDiv>
      <WhiteDiv>{item?.creator?.country}</WhiteDiv>
      <GrayDiv>{t("case-detail.content-type")}</GrayDiv>
      <WhiteDiv>{item?.contentType}</WhiteDiv>
      <GrayDiv>{t("case-detail.types-of-copyright-infringement")}</GrayDiv>
      <WhiteDiv>{item?.infringementType}</WhiteDiv>
      <WhiteDiv className="row-span-3 border-l text-[18px]">
        {item?.etc}
      </WhiteDiv>
      <GrayDiv>{t("case-detail.incident-name")}</GrayDiv>
      <WhiteDiv className="col-span-5">{item?.caseName}</WhiteDiv>
      <GrayDiv>{t("case-detail.case-overview")}</GrayDiv>
      <WhiteDiv className="col-span-5 text-[18px]">{item?.caseOutline}</WhiteDiv>
    </div>
  );
}

export default CaseDetailGrid;
