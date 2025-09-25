"use client";

import React from "react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";

import { useUpdateCase } from "@/entities/case";
import CaseForm from "@/shared/widgets/case/form";
import { toIsoString } from "@/shared/helper/dateHelper";
import PageTitle from "@/shared/components/pageTitle/page";

function EditCase() {
  const t = useTranslations();

  const params = useParams();
  const caseId = params.id;

  const router = useRouter();
  const updateCase = useUpdateCase();

  const onSubmit = async (data) => {
    try {
      const response = await updateCase.mutateAsync({
        caseId: caseId, // Include the case ID for update
        caseName: data.caseName,
        caseOutline: data.caseOutline,
        contentType: data.contentType,
        infringementType: data.infringementType,
        relatedCountries: data.relatedCountries,
        priority: Number(data.priority),
        investigationDate: toIsoString(data.investigationDate),
        etc: data.etc,
      });

      toast.success(t("case-detail.update-success"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      router.push(`/manager/cases/${caseId}`);
    } catch (error) {
      toast.error(t("case-detail.update-error"), {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error("Failed to update case:", error);
    }
  };

  const onGoBack = () => {
    router.push(`/manager/cases/${caseId}`);
  };

  return (
    <div>
      <PageTitle title={t("edit-incident")} />
      <div className="flex flex-col items-center">
        <div className="flex justify-center">
          <CaseForm
            mode="edit"
            onSubmit={onSubmit}
            onClickCancel={onGoBack}
            caseId={caseId}
            isPending={updateCase.isPending}
          />
        </div>
      </div>
    </div>
  );
}

export default EditCase;
