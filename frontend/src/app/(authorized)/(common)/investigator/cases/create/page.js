"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import PageTitle from "@/shared/components/pageTitle/page";
import Button from "@/shared/components/button";
import Cancel from "@/shared/components/icons/cancel";
import CreateDoc from "@/shared/components/icons/createDoc";
import CheckRectangle from "@/shared/components/icons/checkRectangle";
import CaseForm from "@/shared/widgets/caseForm";
import { useEffect } from "react";

const IncidentCreatePage = () => {
  const t = useTranslations();
  const {
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    reset({
      securityLevel: "option3",
      progressStatus: "option1",
      overview:
        "성명불상자가 저작권자의 이용허락 없이 해외의 동영상 공유 플랫폼 사이트에 업로드한 영상저작물에 팝업창 제공방식으로 링크를 제공하는 다시 보기 링크 사이트를 개설하여 운영·관리함 ",
    });
  }, []);

  return (
    <div className="flex justify-center">
      <div className="w-[1283px]">
        <PageTitle title={t("create-new-investigation-record")} />
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="white" size="mediumWithShadow" className="gap-3">
              <Cancel />
              {t("cancel")}
            </Button>
            <Button variant="white" size="mediumWithShadow" className="gap-3">
              <div className="ml-[6px] w-[30px]"><CreateDoc width={20} height={22} /></div>
              {t("upload-investigation-material")}
            </Button>
          </div>
          <div>
            <Button variant="yellow" size="mediumWithShadow" className="gap-3">
              <CheckRectangle />
              {t("registering")}
            </Button>
          </div>
        </div>
        <div className=" bg-white border border-color-36 rounded-10 px-[70px] py-6">
          <div className="text-center">
            <h2 className="text-black text-[30px] font-bold">
              {t("header.case-investigation-record")}
            </h2>
          </div>
          <CaseForm
            register={register}
            watch={watch}
            errors={errors}
            headerInfo={{
              item1: "2024-02-28",
              item2: "156",
              item3: "사건 B",
              item4: "고광천",
              item5: "고광천",
              item6: "김철수",
              item7: "test1",
              item8: "test2",
            }}
            data={{
              item1: "사건 B 목격자 관련 제보",
            }}
            report={[{ name: "sample2.mp4", size: "40.5KB" }]}
            digitalEvidence={[
              { name: "sample3.mp4", size: "40.5KB" },
              { name: "sample4.mp4", size: "41.5KB" },
              { name: "sample5.mp4", size: "42.5KB" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default IncidentCreatePage;
