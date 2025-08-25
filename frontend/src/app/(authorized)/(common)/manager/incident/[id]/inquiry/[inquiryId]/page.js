"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import Button from "@/shared/components/button";
import PageTitle from "@/shared/components/pageTitle/page";
import ChevronLeft from "@/shared/components/icons/chevronLeft";
import CheckCircle from "@/shared/components/icons/checkCircle";
import CancelCircle from "@/shared/components/icons/cancelCircle";
import CaseForm from "@/shared/widgets/caseForm";
import Modal from "@/shared/components/modal";

const InquiryDetailPage = () => {
  const params = useParams();
  const incidentId = params.id;
  const inquiryId = params.inquiryId;

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [denyModalOpen, setDenyModalOpen] = useState(false);

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
        <PageTitle title={t("case-detail.inquiry-of-investigation-records")} />
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="white" size="mediumWithShadow" className="gap-3">
              <ChevronLeft />
              {t("go-back")}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="pink"
              size="mediumWithShadow"
              className="gap-3"
              onClick={() => setDenyModalOpen(true)}
            >
              <CancelCircle />
              {t("deny")}
            </Button>
            <Button
              variant="yellow"
              size="mediumWithShadow"
              className="gap-3"
              onClick={() => setApproveModalOpen(true)}
            >
              <CheckCircle />
              {t("approve")}
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
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        size="w568"
      >
        <div className="space-y-8">
          <h3 className="text-color-8 text-[24px] font-medium text-center">
            {t("approval-investigation-records")}
          </h3>
          <div className="bg-color-77 rounded-20 text-color-24 text-[20px] font-normal text-center p-4">
            수사 보고서를 검토한 뒤 아래 란에 글씨를 따라
            <br />
            입력한 뒤, 확인 버튼을 눌러주세요.
          </div>
          <input
            name="capcha"
            className="border w-full border-color-32 rounded-10 placeholder-color-50 text-[20px] font-medium px-[20px] py-[10px]"
            placeholder="위 수사 기록을 검토하였으며 최종 승인합니다."
          />
          <div className="flex justify-center gap-4">
            <Button
              variant="gray2"
              size="form"
              className="w-[148px]"
              onClick={() => setApproveModalOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button size="form" className="w-[148px]">
              {t("check")}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={denyModalOpen}
        onClose={() => setDenyModalOpen(false)}
        size="w568"
      >
        <div className="space-y-8">
          <h3 className="text-color-8 text-[24px] font-medium text-center">
            {t("refusal-investigation-records")}
          </h3>
          <div className="bg-color-77 rounded-20 text-color-24 text-[20px] font-normal text-center p-4 py-5">
            반려 사유를 작성해주세요
          </div>
          <textarea
            className="w-full h-[200px] border border-color-32 rounded-10 placeholder-color-50 text-[20px] font-medium px-[20px] py-[10px]"
            placeholder="반려 사유 작성"
          />
          <div className="flex justify-center gap-4">
            <Button
              variant="gray2"
              size="form"
              className="w-[148px]"
              onClick={() => setDenyModalOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button size="form" className="w-[148px]">
              {t("check")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InquiryDetailPage;
