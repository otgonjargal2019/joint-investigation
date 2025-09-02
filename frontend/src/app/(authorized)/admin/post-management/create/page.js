"use client";

import { useTranslations } from "next-intl";

import PageTitle from "@/shared/components/pageTitle/page";
import Form from "@/shared/widgets/post/form";

function CreateAnnouncementPage() {
  const t = useTranslations();

  const onSubmit = (formValues) => {
    console.log("formValues:", formValues);
  };

  return (
    <div>
      <PageTitle title={t("create-announcement")} />
      <div className=" mt-16 flex justify-center">
        <div className="max-w-[1200px] w-full">
          <Form onSubmit={onSubmit} />
        </div>
      </div>
    </div>
  );
}

export default CreateAnnouncementPage;
