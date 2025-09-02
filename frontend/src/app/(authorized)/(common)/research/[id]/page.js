"use client";

import { toast } from "react-toastify";
import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

import Modal from "@/shared/components/modal";
import Button from "@/shared/components/button";
import Detail from "@/shared/widgets/post/detail";
import PageTitle from "@/shared/components/pageTitle/page";

import { postQuery, BOARD_TYPE, useDeletePost } from "@/entities/post";

function DetailPage({ params }) {
  const { id } = use(params);
  const t = useTranslations();
  const router = useRouter();

  const [promptModalOpen, setPromptModalOpen] = useState(false);

  const { data, isPending } = useQuery(
    postQuery.getPostWithNeighbors({
      postId: id,
      boardType: BOARD_TYPE.RESEARCH,
    })
  );

  const deleteMutation = useDeletePost();

  const onClickList = () => router.push("/research");

  const onClickNavigate = (type) => {
    if (type === "next") {
      router.push(`/research/${data?.next?.postId}`);
    } else if (type === "prev") {
      router.push(`/research/${data?.prev?.postId}`);
    }
  };

  const onClickEdit = () => {
    router.push(`/research/${id}/edit`);
  };

  const onClickDelBtn = () => {
    setPromptModalOpen(true);
  };

  const onDelete = () => {
    console.log(data);
    deleteMutation.mutate(
      { id },
      {
        onSuccess: (res) => {
          setPromptModalOpen(false);
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
      }
    );
  };

  return (
    <div>
      <PageTitle title={t("header.research")} />

      <div className="flex justify-center mt-4">
        <div className="max-w-[1200px] w-full">
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="white" onClick={onClickEdit}>
              {t("edit")}
            </Button>
            <Button variant="white" onClick={onClickDelBtn}>
              {t("delete")}
            </Button>
          </div>
          <Detail
            current={data?.current}
            next={data?.next}
            prev={data?.prev}
            onClickList={onClickList}
            onClickNavigate={onClickNavigate}
          />
        </div>
      </div>
      <Modal isOpen={promptModalOpen} onClose={() => setPromptModalOpen(false)}>
        <div className="text-color-24 text-[20px] font-normal text-center whitespace-nowrap">
          {t("prompt.are-you-sure-to-delete")}
          <br />
          {t("prompt.deleted-post-cannot-be-recovered")}
        </div>
        <div className="flex gap-2 justify-center mt-4">
          <Button variant="gray2">{t("cancel")}</Button>
          <Button onClick={onDelete}>{t("remove")}</Button>
        </div>
      </Modal>
    </div>
  );
}

export default DetailPage;
