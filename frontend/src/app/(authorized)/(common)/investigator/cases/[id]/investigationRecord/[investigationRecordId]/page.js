"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import Button from "@/shared/components/button";
import PageTitle from "@/shared/components/pageTitle/page";
import Cancel from "@/shared/components/icons/cancel";
import CheckRectangle from "@/shared/components/icons/checkRectangle";
import EditFile from "@/shared/components/icons/editFile";
import CreateDoc from "@/shared/components/icons/createDoc";
import CaseForm from "@/shared/widgets/caseForm";
import {
  useInvestigationRecord,
} from "@/entities/investigation";
import { REVIEW_STATUS } from "@/entities/investigation/model/constants";

const InquiryDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id;
  const investigationRecordId = params.investigationRecordId;

  // Fetch investigation record data
  const {
    data: investigationRecord,
    isLoading,
    error,
  } = useInvestigationRecord(investigationRecordId);

  const t = useTranslations();
  const {
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (investigationRecord) {
      reset({
        securityLevel: `option${investigationRecord.securityLevel}`,
        progressStatus:
          investigationRecord.progressStatus,
        overview: investigationRecord.content || "",
        recordName: investigationRecord.recordName || "",
      });
    }
  }, [investigationRecord, reset]);

  const navigateBack = () => {
    router.push(`/investigator/cases/${caseId}`);
  };

  console.log("investigationRecord", investigationRecord);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">{t("loading")}</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-500">
          {t("loading-error")}: {error.message}
        </div>
      </div>
    );
  }

  // Show not found state
  if (!investigationRecord) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">{t("record-not-found")}</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-[1283px]">
        <PageTitle title={t("case-detail.inquiry-of-investigation-records")} />
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="white"
              size="mediumWithShadow"
              className="gap-3"
              onClick={navigateBack}
            >
              <Cancel />
              {t("incident.cancel-editing")}
            </Button>
            <Button
              type="button"
              variant="white"
              size="mediumWithShadow"
              className="gap-3"
            >
              <div className="ml-[6px] w-[30px]"><CreateDoc width={20} height={22} /></div>
              {t("upload-investigation-material")}
            </Button>
          </div>
          <div className="flex gap-2">
            {(investigationRecord.reviewStatus === REVIEW_STATUS.WRITING || investigationRecord.reviewStatus === REVIEW_STATUS.REJECTED) && (
              <>
                <Button
                  variant="yellow"
                  size="mediumWithShadow"
                  className="gap-3"
                  // onClick={() => setDenyModalOpen(true)}
                >
                  <EditFile />
                  {t("incident.edit")}
                </Button>
                <Button
                  variant="yellow"
                  size="mediumWithShadow"
                  className="gap-3"
                  // onClick={() => setApproveModalOpen(true)}
                >
                  <CheckRectangle />
                  {t("incident.request-review")}
                </Button>
              </>
            )}
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
            readonly={true}
            headerInfo={{
              item1:
                investigationRecord?.caseInstance?.creationDate ||
                investigationRecord?.createdAt?.split("T")[0] ||
                "",
              item2:
                investigationRecord?.caseInstance?.caseNumber ||
                investigationRecord?.number ||
                "",
              item3: investigationRecord?.caseInstance?.caseName || "",
              item4: investigationRecord?.creator?.nameKr || "",
              item5: investigationRecord?.creator?.nameKr || "",
              item6: investigationRecord?.reviewer?.nameKr || "",
              item7: investigationRecord?.updatedAt || "",
              item8: [REVIEW_STATUS.REJECTED, REVIEW_STATUS.APPROVED].includes(investigationRecord?.reviewStatus) ? t(`incident.REVIEW_STATUS.${investigationRecord?.reviewStatus}`) : "",
            }}
            data={{
              item1:
                investigationRecord?.recordName || "사건 B 목격자 관련 제보",
            }}
            report={
              investigationRecord?.attachedFiles
                ?.filter((file) => file.fileType === "REPORT")
                .map((file) => ({
                  name: file.fileName,
                  url: file.storagePath,
                  size: file.fileSize
                    ? `${(file.fileSize / 1024).toFixed(1)}KB`
                    : "Unknown",
                })) || []
            }
            digitalEvidence={
              investigationRecord?.attachedFiles
                ?.filter((file) => file.fileType === "EVIDENCE")
                .map((file) => ({
                  name: file.fileName,
                  url: file.storagePath,
                  size: file.fileSize
                    ? `${(file.fileSize / 1024).toFixed(1)}KB`
                    : "Unknown",
                })) || []
            }
          />
        </div>
      </div>
    </div>
  );
};

export default InquiryDetailPage;
