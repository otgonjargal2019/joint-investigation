"use client";

import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { BOARD_TYPE } from "@/entities/post";
import { useCreatePost } from "@/entities/post";
import PageTitle from "@/shared/components/pageTitle/page";
import Form from "@/shared/widgets/post/form";

function ResearchCreatePage() {
  const t = useTranslations();
  const router = useRouter();
  const createMutation = useCreatePost();

  const onSubmit = (formValues) => {
    const reqData = { ...formValues, boardType: BOARD_TYPE.RESEARCH };

    createMutation.mutate(reqData, {
      onSuccess: (res) => {
        toast.success(res.data.message, {
          autoClose: 3000,
          position: "top-center",
        });
        router.push("/research");
      },
      onError: (err) => {
        toast.error(err.response.data.message, {
          position: "top-center",
          autoClose: 2000,
        });
      },
    });
  };

  const onClickCancel = () => {
    router.push(`/research`);
  };

  return (
    <div>
      <PageTitle title={t("investigation-info-create")} />
      <div className="mt-16 flex justify-center">
        <div className="max-w-[1200px] w-full">
          <Form onSubmit={onSubmit} onClickCancel={onClickCancel} />
        </div>
      </div>
    </div>
  );
}

export default ResearchCreatePage;
