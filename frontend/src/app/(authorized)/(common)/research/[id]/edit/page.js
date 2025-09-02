"use client";

import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

import { postQuery, useUpdatePost } from "@/entities/post";
import PageTitle from "@/shared/components/pageTitle/page";
import Form from "@/shared/widgets/post/form";

function EditPage() {
  const { id } = useParams();

  const t = useTranslations();
  const router = useRouter();
  const updateMutation = useUpdatePost();

  const { data: post, isPending } = useQuery(
    postQuery.getPost({
      postId: id,
    })
  );

  const onSubmit = (formValues) => {
    const reqData = { id, ...formValues };

    updateMutation.mutate(reqData, {
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
    router.push(`/research/${id}`);
  };

  return (
    <div>
      <PageTitle title={t("investigation-info-create")} />
      <div className="mt-16 flex justify-center">
        <div className="max-w-[1200px] w-full">
          <Form
            mode="edit"
            defaultValues={post}
            onSubmit={onSubmit}
            onClickCancel={onClickCancel}
          />
        </div>
      </div>
    </div>
  );
}

export default EditPage;
