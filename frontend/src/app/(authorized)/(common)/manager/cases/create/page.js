"use client";

import { toast } from "react-toastify";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { useCreateCase } from "@/entities/case";
import CaseForm from "@/shared/widgets/case/form";
import { toIsoString } from "@/shared/helper/dateHelper";
import ChevronTabs from "@/shared/components/chevronTab";
import PageTitle from "@/shared/components/pageTitle/page";
import InvestigatorAssign from "@/shared/widgets/manager/investigatorAssign";

function CreateNewCase() {
  const t = useTranslations();

  const tabs = [t("enter-incident-info"), t("assign-investigator")];
  const [activeTab, setActiveTab] = useState(0);

  const [createdCaseId, setCreatedCaseId] = useState(null);

  const router = useRouter();
  const createCase = useCreateCase();

  const onSubmit = async (data) => {
    try {
      const response = await createCase.mutateAsync({
        caseName: data.caseName,
        caseOutline: data.caseOutline,
        contentType: data.contentType,
        infringementType: data.infringementType,
        relatedCountries: data.relatedCountries,
        priority: Number(data.priority),
        investigationDate: toIsoString(data.investigationDate),
        etc: data.etc,
        ...(createdCaseId !== null ? { caseId: createdCaseId } : {}),
      });

      setCreatedCaseId(response.caseId);

      toast.success(t("case-detail.create-success"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setActiveTab(1);
    } catch (error) {
      toast.error(t("case-detail.create-error"), {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error("Failed to create case:", error);
    }
  };

  const onGoBack = () => {
    router.push("/manager/cases");
  };

  return (
    <div>
      <PageTitle title={t("create-new-incident")} />
      <div className="flex flex-col items-center">
        <div className="mt-2 mb-8">
          <ChevronTabs
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        <div className="flex justify-center">
          {activeTab === 0 && (
            <CaseForm
              caseId={null}
              onSubmit={onSubmit}
              onClickCancel={onGoBack}
              isPending={createCase.isPending}
            />
          )}

          {activeTab === 1 && (
            <InvestigatorAssign
              setActiveTab={setActiveTab}
              createdCaseId={createdCaseId}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateNewCase;
