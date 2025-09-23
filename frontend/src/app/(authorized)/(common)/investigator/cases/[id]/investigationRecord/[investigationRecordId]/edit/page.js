"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import Button from "@/shared/components/button";
import PageTitle from "@/shared/components/pageTitle/page";
import Cancel from "@/shared/components/icons/cancel";
import EditFile from "@/shared/components/icons/editFile";
import CreateDoc from "@/shared/components/icons/createDoc";
import CaseForm from "@/shared/widgets/caseForm";
import {
  useInvestigationRecord,
  useUpdateInvestigationRecordWithFiles,
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

  // Update investigation record with files mutation
  const updateInvestigationRecordMutation = useUpdateInvestigationRecordWithFiles();

  // State for file management
  const [reportFiles, setReportFiles] = useState([]);
  const [digitalEvidenceFiles, setDigitalEvidenceFiles] = useState([]);

  const t = useTranslations();
  const {
    register,
    watch,
    reset,
    handleSubmit,
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
    router.push(`/investigator/cases/${caseId}/investigationRecord/${investigationRecordId}`);
  };

  // File upload handler with categorization
  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '*/*';

    input.onchange = (event) => {
      const files = Array.from(event.target.files);

      // Simple categorization dialog or you could implement a modal
      const fileType = window.confirm(
        'Click OK for Investigation Report files, Cancel for Digital Evidence files'
      );

      if (fileType) {
        setReportFiles(prev => [...prev, ...files]);
      } else {
        setDigitalEvidenceFiles(prev => [...prev, ...files]);
      }
    };

    input.click();
  };

  // Remove file handlers
  const removeReportFile = (index) => {
    setReportFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeDigitalEvidenceFile = (index) => {
    setDigitalEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateInvestigationRecord = async (formData) => {
    try {
      // Prepare the update request data
      const updateData = {
        recordId: investigationRecordId,
        recordName: formData.recordName,
        content: formData.overview,
        securityLevel: formData.securityLevel ? parseInt(formData.securityLevel.replace('option', '')) : investigationRecord.securityLevel,
        progressStatus: formData.progressStatus || investigationRecord.progressStatus,
      };

      // Prepare file arrays
      const allFiles = [...reportFiles, ...digitalEvidenceFiles];
      const fileTypes = [
        ...reportFiles.map(() => 'REPORT'),
        ...digitalEvidenceFiles.map(() => 'EVIDENCE')
      ];
      const digitalEvidenceFlags = [
        ...reportFiles.map(() => false),
        ...digitalEvidenceFiles.map(() => true)
      ];
      const investigationReportFlags = [
        ...reportFiles.map(() => true),
        ...digitalEvidenceFiles.map(() => false)
      ];

      // Call the mutation with new files
      await updateInvestigationRecordMutation.mutateAsync({
        record: updateData,
        files: allFiles,
        fileTypes: fileTypes,
        digitalEvidenceFlags: digitalEvidenceFlags,
        investigationReportFlags: investigationReportFlags
      });

      toast.success(t("incident.update-success"));

      // Clear files after successful update
      setReportFiles([]);
      setDigitalEvidenceFiles([]);

      // Navigate back to view page
      router.push(`/investigator/cases/${caseId}`);

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        t("incident.update-error")
      );
    }
  };

  console.log("investigationRecord", investigationRecord);

  let reviewResult = "";

  let reviewedAt = "";
  if (investigationRecord?.reviewedAt) {
    const date = new Date(investigationRecord?.reviewedAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    reviewedAt = `${year}-${month}-${day}`;
  }

  switch (investigationRecord?.reviewStatus) {
    case REVIEW_STATUS.REJECTED:
      reviewResult = <span className="text-[red]">{`${reviewedAt}(${t(`incident.REVIEW_STATUS.${investigationRecord?.reviewStatus}`)})`}</span>;
      break;
    case REVIEW_STATUS.APPROVED:
      reviewResult = <span className="text-[#5D5996]">{`${reviewedAt}`}</span>;
      break;

    case REVIEW_STATUS.PENDING:
      reviewResult = <span className="text-[#6B62D3]">{`${t(`incident.REVIEW_STATUS.${investigationRecord?.reviewStatus}`)}`}</span>;
      break;

    default:
      break;
  }

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
              onClick={handleFileUpload}
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
                  onClick={handleSubmit(handleUpdateInvestigationRecord)}
                  disabled={updateInvestigationRecordMutation.isPending}
                >
                  <EditFile />
                  {updateInvestigationRecordMutation.isPending
                    ? t("incident.updating")
                    : t("incident.save-changes")
                  }
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
            readonly={false}
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
              item8: reviewResult,
            }}
            data={{
              item1:
                investigationRecord?.recordName || "사건 B 목격자 관련 제보",
            }}
            report={[
              // Existing files
              ...(investigationRecord?.attachedFiles
                ?.filter((file) => file.fileType === "REPORT")
                .map((file) => ({
                  name: file.fileName,
                  url: file.storagePath,
                  size: file.fileSize
                    ? `${(file.fileSize / 1024).toFixed(1)}KB`
                    : "Unknown",
                })) || []),
              // New files to be uploaded
              ...reportFiles.map((file, index) => ({
                name: file.name,
                size: `${(file.size / 1024).toFixed(1)}KB`,
                onRemove: () => removeReportFile(index),
                isNew: true
              }))
            ]}
            digitalEvidence={[
              // Existing files
              ...(investigationRecord?.attachedFiles
                ?.filter((file) => file.fileType === "EVIDENCE")
                .map((file) => ({
                  name: file.fileName,
                  url: file.storagePath,
                  size: file.fileSize
                    ? `${(file.fileSize / 1024).toFixed(1)}KB`
                    : "Unknown",
                })) || []),
              // New files to be uploaded
              ...digitalEvidenceFiles.map((file, index) => ({
                name: file.name,
                size: `${(file.size / 1024).toFixed(1)}KB`,
                onRemove: () => removeDigitalEvidenceFile(index),
                isNew: true
              }))
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default InquiryDetailPage;
