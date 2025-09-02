"use client";

import { useTranslations } from "next-intl";

import Button from "../../components/button";
import NoticeHeader from "../../components/postHeader/page";
import PostNavigator from "../../components/postNavigator/page";
import FileAttachment from "../../components/fileAttachment/page";

const Detail = ({ current, prev, next, onClickList, onClickNavigate }) => {
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
          title: current?.title,
          date: current?.createdAtStr,
          author:
            current?.creator?.nameKr ||
            current?.creator?.nameKr ||
            current?.creator?.loginId,
          view: "125",
        }}
      />

      <div
        className="p-6 px-10 text-black text-[20px] font-normal"
        dangerouslySetInnerHTML={{ __html: current?.content }}
      ></div>

      <FileAttachment
        files={[{ name: "2025 국제 공조수사 워크샵 계획안.docx" }]}
      />

      <div className="flex justify-center p-1.5">
        <Button onClick={onClickList}>{t("list")}</Button>
      </div>

      <PostNavigator prev={prev} next={next} onClick={onClickNavigate} />
    </div>
  );
};

export default Detail;
