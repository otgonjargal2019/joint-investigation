import { useTranslations } from "next-intl";

import Button from "../components/button";
import NoticeHeader from "../components/postHeader/page";
import PostNavigator from "../components/postNavigator/page";
import FileAttachment from "../components/fileAttachment/page";

const InvestigationInfoDetail = ({ onClickList }) => {
  const t = useTranslations();

  return (
    <div className="w-full space-y-4.5">
      <NoticeHeader
        label={{
          date: t("date"),
          author: t("author"),
          view: t("view"),
        }}
        info={{
          title: "2025 상반기 국제공조수사 워크샵 개최 안내",
          date: "2025.05.19",
          author: "관리자",
          view: "125",
        }}
      />

      <div className="p-6 px-10 text-black text-[20px] font-normal">
        2025년 상반기 국제공조수사 워크샵 개최안내의 자세한 내용은 첨부파일을
        확인하시기 바랍니다.
      </div>

      <FileAttachment
        files={[{ name: "2025 국제 공조수사 워크샵 계획안.docx" }]}
      />

      <div className="flex justify-center p-1.5">
        <Button onClick={onClickList}>{t("list")}</Button>
      </div>

      <PostNavigator
        prevTitle={"인터폴 협력 사례 공유 세미나 참가 신청 안내"}
        nextTitle={"국제 수사정보 공유 시스템 사용자 교육 일정 공지"}
        onClick={(p) => console.log(p)}
      />
    </div>
  );
};

export default InvestigationInfoDetail;
