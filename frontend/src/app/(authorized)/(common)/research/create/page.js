"use client";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import PageTitle from "@/shared/components/pageTitle/page";
import InvestigationInfoForm from "@/shared/widgets/investigationInfoForm";

import { BOARD_TYPE } from "@/entities/post";
import { useCreatePost } from "@/entities/post";

function ResearchCreatePage() {
  const t = useTranslations();
  const createMutation = useCreatePost();

  const onSubmit = (formValues) => {
    const reqData = { ...formValues, boardType: BOARD_TYPE.RESEARCH };

    console.log("reqData:", reqData);

    createMutation.mutate(reqData, {
      onSuccess: (res) => {
        toast.success(res.data.message, {
          autoClose: 3000,
          position: "top-center",
        });
      },
      onError: (err) => {
        toast.error(err.response.data.message, {
          position: "top-center",
          autoClose: 2000,
        });
      },
    });
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

export default ResearchCreatePage;
