"use client";

import { useTranslations } from "next-intl";

import PageTitle from "@/shared/components/pageTitle/page";
import InvestigationInfoForm from "@/shared/widgets/investigationInfoForm";

function InvestigationInfoCreatePage() {
  const t = useTranslations();

  const onSubmit = (formValues) => {
    console.log("formValues:", formValues);
  };

  return (
    <div>
      <PageTitle title={t("investigation-info-create")} />
      <div className="mt-16 flex justify-center">
        <div className="max-w-[1200px] w-full">
          <InvestigationInfoForm onSubmit={onSubmit} />
        </div>
      </div>
    </div>
  );
}

export default InvestigationInfoCreatePage;
