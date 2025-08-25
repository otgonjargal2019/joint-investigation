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
      <WhiteDiv className="border-t">{item?.data1}</WhiteDiv>
      <GrayDiv className="border-t">
        {t("case-detail.date-of-occurrence")}
      </GrayDiv>
      <WhiteDiv className="border-t">{item?.data2}</WhiteDiv>
      <GrayDiv className="border-t">
        {t("case-detail.ranking-of-investigate-responses")}
      </GrayDiv>
      <WhiteDiv className="border-t">C0</WhiteDiv>
      <GrayDiv className="border-t">{t("case-detail.other-matters")}</GrayDiv>
      <GrayDiv>{t("case-detail.country-concerned")}</GrayDiv>
      <WhiteDiv>{item?.data3}</WhiteDiv>
      <GrayDiv>{t("case-detail.content-type")}</GrayDiv>
      <WhiteDiv>{item?.data4}</WhiteDiv>
      <GrayDiv>{t("case-detail.types-of-copyright-infringement")}</GrayDiv>
      <WhiteDiv>{item?.data5}</WhiteDiv>
      <WhiteDiv className="row-span-3 border-l text-[18px]">
        {item?.data6}
      </WhiteDiv>
      <GrayDiv>{t("case-detail.incident-name")}</GrayDiv>
      <WhiteDiv className="col-span-5">{item?.data7}</WhiteDiv>
      <GrayDiv>{t("case-detail.case-overview")}</GrayDiv>
      <WhiteDiv className="col-span-5 text-[18px]">{item?.data8}</WhiteDiv>
    </div>
  );
}

export default CaseDetailGrid;
