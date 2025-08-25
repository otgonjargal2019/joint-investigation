"use client";

import { useTranslations } from "next-intl";

import PageTitle from "@/shared/components/pageTitle/page";
import InvestigationInfoForm from "@/shared/widgets/investigationInfoForm";

const EditAnnoncementPage = () => {
  const t = useTranslations();

  const onSubmit = (formValues) => {
    console.log("formValues:", formValues);
  };

  return (
    <div>
      <PageTitle title={t("create-announcement")} />
      <div className="mt-16 flex justify-center">
        <div className="max-w-[1200px] w-full">
          <InvestigationInfoForm onSubmit={onSubmit} />
        </div>
      </div>
    </div>
  );
};

export default EditAnnoncementPage;
