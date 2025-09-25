"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import Button from "@/shared/components/button";
import PageTitle from "@/shared/components/pageTitle/page";
import ChevronLeft from "@/shared/components/icons/chevronLeft";
import CheckCircle from "@/shared/components/icons/checkCircle";
import CancelCircle from "@/shared/components/icons/cancelCircle";
import CaseForm from "@/shared/widgets/caseForm";
import Modal from "@/shared/components/modal";
import TypingOverlay from "@/shared/widgets/typingOverlay";
import {
  useInvestigationRecord,
  useRejectInvestigationRecord,
  useApproveInvestigationRecord,
  REVIEW_STATUS,
} from "@/entities/investigation";

const InquiryDetailPage = () => {
  const params = useParams();
  const caseId = params.id;
  const inquiryId = params.inquiryId;

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [denyModalOpen, setDenyModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [captchaCompleted, setCaptchaCompleted] = useState(false);

  const router = useRouter();

  // Fetch investigation record data
  const {
    data: investigationRecord,
    isLoading,
    error,
  } = useInvestigationRecord(inquiryId);

  // Reject mutation
  const rejectMutation = useRejectInvestigationRecord();

  // Approve mutation
  const approveMutation = useApproveInvestigationRecord();

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
        securityLevel: `option${investigationRecord.securityLevel || 3}`,
        progressStatus:
          investigationRecord.progressStatus || "PRE_INVESTIGATION",
        overview: investigationRecord.content || "",
        recordName: investigationRecord.recordName || "",
      });
    }
  }, [investigationRecord, reset]);

  const navigateBack = () => {
    router.push(`/manager/cases/${caseId}`);
  };

  const handleRejectInvestigation = () => {
    if (!rejectionReason.trim()) {
      toast.info(t("incident.reason-required"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    rejectMutation.mutate(
      {
        recordId: inquiryId,
        rejectionReason: rejectionReason.trim(),
      },
      {
        onSuccess: () => {
          setDenyModalOpen(false);
          setRejectionReason("");
          toast.success(t("incident.saved-successfully"), {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          navigateBack();
        },
        onError: (error) => {
          console.error("Failed to reject investigation record:", error);
          toast.error(t("incident.error-occurred"), {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        },
      }
    );
  };

  const handleApproveInvestigation = () => {
    if (!captchaCompleted) {
      toast.info(t("incident.typing-verification-prompt"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    approveMutation.mutate(
      {
        recordId: inquiryId,
      },
      {
        onSuccess: () => {
          setApproveModalOpen(false);
          setCaptchaCompleted(false);
          toast.success(t("incident.approved-successfully"), {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          navigateBack();
        },
        onError: (error) => {
          console.error("Failed to approve investigation record:", error);
          toast.error(t("incident.error-occurred"), {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        },
      }
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">{t("loading")}</div>
      </div>
    );
  }

  // Show not found state
  if (!investigationRecord) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">{t("incident.not-found")}</div>
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
              <ChevronLeft />
              {t("go-back")}
            </Button>
          </div>
          <div className="flex gap-2">
            {(investigationRecord?.reviewStatus === REVIEW_STATUS.PENDING && (
              <>
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
              </>
            ))}
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
              requestedAt: investigationRecord?.requestedAt || "",
              item8: investigationRecord?.reviewStatus || "",
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
            {t("incident.approval-guideline-1")}
            <br />
            {t("incident.approval-guideline-2")}
          </div>
          <TypingOverlay
            text={t("incident.approval-statement")}
            onComplete={() => setCaptchaCompleted(true)}
          />
          <div className="flex justify-center gap-4">
            <Button
              variant="gray2"
              size="form"
              className="w-[148px]"
              onClick={() => {
                setApproveModalOpen(false);
                setCaptchaCompleted(false);
              }}
              disabled={approveMutation.isPending}
            >
              {t("cancel")}
            </Button>
            <Button
              size="form"
              className="w-[148px]"
              onClick={handleApproveInvestigation}
              disabled={approveMutation.isPending || !captchaCompleted}
            >
              {approveMutation.isPending ? "처리중..." : t("check")}
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
            {t("incident.reason-for-rejection-prompt")}
          </div>
          <textarea
            className="w-full h-[200px] border border-color-32 rounded-10 placeholder-color-50 text-[20px] font-medium px-[20px] py-[10px] outline-none"
            placeholder={t("placeholder.reason")}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <div className="flex justify-center gap-4">
            <Button
              variant="gray2"
              size="form"
              className="w-[148px]"
              onClick={() => {
                setDenyModalOpen(false);
                setRejectionReason("");
              }}
              disabled={rejectMutation.isPending}
            >
              {t("cancel")}
            </Button>
            <Button
              size="form"
              className="w-[148px]"
              onClick={handleRejectInvestigation}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
            >
              {rejectMutation.isPending ? "처리중..." : t("check")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InquiryDetailPage;
