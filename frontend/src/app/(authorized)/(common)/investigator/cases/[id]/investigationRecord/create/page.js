"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import PageTitle from "@/shared/components/pageTitle/page";
import Button from "@/shared/components/button";
import Cancel from "@/shared/components/icons/cancel";
import CreateDoc from "@/shared/components/icons/createDoc";
import CheckRectangle from "@/shared/components/icons/checkRectangle";
import CaseForm from "@/shared/widgets/caseForm";
import { useCaseById } from "@/entities/case";
import { useCreateInvestigationRecordWithFiles } from "@/entities/investigation";

const IncidentCreatePage = () => {
  const t = useTranslations();
  const router = useRouter();
  const {
    register,
    watch,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      recordName: "",
      securityLevel: "option3",
      progressStatus: "PRE_INVESTIGATION",
      overview: ""
    }
  });

  const params = useParams();
  const caseId = params.id;

  // State for file management
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [reportFiles, setReportFiles] = useState([]);
  const [digitalEvidenceFiles, setDigitalEvidenceFiles] = useState([]);

  const {
    data: caseData,
    isLoading,
    error
  } = useCaseById({ id: caseId });

  const createInvestigationRecordMutation = useCreateInvestigationRecordWithFiles();

  useEffect(() => {
    reset({
      recordName: "",
      securityLevel: "option3",
      progressStatus: "PRE_INVESTIGATION",
      overview: "",
    });
  }, [reset]);

  let now = "";
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  now = `${year}-${month}-${day}`;

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

      setSelectedFiles(prev => [...prev, ...files]);
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

  // Form submission handler
  const onSubmit = async (formData) => {
    try {
      // Validate required fields
      if (!formData.recordName?.trim()) {
        alert(t("Please enter a record name"));
        return;
      }

      // Prepare investigation record data
      const recordData = {
        recordName: formData.recordName.trim(),
        content: formData.overview || "",
        progressStatus: formData.progressStatus,
        securityLevel: parseInt(formData.securityLevel?.replace('option', '')) || 3,
        overview: formData.overview || "",
        caseId: caseId
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

      // Call the mutation
      const result = await createInvestigationRecordMutation.mutateAsync({
        record: recordData,
        files: allFiles,
        fileTypes,
        digitalEvidenceFlags,
        investigationReportFlags
      });

      // Show success message
      toast.success(t('incident.saved-successfully'), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });

      // Navigate back to case detail
      router.push(`/investigator/cases/${caseId}`);
    } catch (error) {
      console.error('Failed to create investigation record:', error);

      // Show error message
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create investigation record";
      alert(`${t("Error")}: ${errorMessage}`);
    }
  };

  // Cancel handler
  const handleCancel = () => {
    router.push(`/investigator/cases/${caseId}`);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">Error loading case data</div>;
  }

  return (
    <div className="flex justify-center">
      <div className="w-[1283px]">
        <PageTitle title={t("create-new-investigation-record")} />
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="white"
                size="mediumWithShadow"
                className="gap-3"
                onClick={handleCancel}
              >
                <Cancel />
                {t("cancel")}
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
            <div>
              <Button
                type="submit"
                variant="yellow"
                size="mediumWithShadow"
                className="gap-3"
                disabled={createInvestigationRecordMutation.isPending}
              >
                <CheckRectangle />
                {/* {createInvestigationRecordMutation.isPending ? t("creating...") : t("registering")} */}
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
                item1: now,
                item2: `#${caseData?.number}` || "",
                item3: caseData?.caseName || "",
                item4: caseData?.creator?.nameKr || "",
                item5: caseData?.creator?.nameKr || "",
                item6: caseData?.reviewer?.nameKr || "",
                item7: caseData?.updatedAt,
                // item8: "test2",
              }}
              data={{
                item1: watch("recordName") || "사건 B 목격자 관련 제보",
              }}
              report={reportFiles.map((file, index) => ({
                name: file.name,
                size: `${(file.size / 1024).toFixed(1)}KB`,
                onRemove: () => removeReportFile(index)
              }))}
              digitalEvidence={digitalEvidenceFiles.map((file, index) => ({
                name: file.name,
                size: `${(file.size / 1024).toFixed(1)}KB`,
                onRemove: () => removeDigitalEvidenceFile(index)
              }))}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentCreatePage;
