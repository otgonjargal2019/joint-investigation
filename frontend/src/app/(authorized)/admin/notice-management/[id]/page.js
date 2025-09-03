"use client";

import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import React, { use, useEffect, useState } from "react";

import Button from "@/shared/components/button";
import PageTitle from "@/shared/components/pageTitle/page";
import Detail from "@/shared/widgets/post/detail";
import { postQuery, BOARD_TYPE, useDeletePost } from "@/entities/post";

function NoticeDetailPage({ params }) {
  const { id } = use(params);
  const t = useTranslations();
  const router = useRouter();

  const { data: response, isPending } = useQuery(
    postQuery.getPostWithNeighbors({
      postId: id,
      boardType: BOARD_TYPE.NOTICE,
    })
  );

  const data = response?.data;

  const onClickList = () => router.push("/admin/notice-management");

  const onClickNavigate = (type) => {
    if (type === "next") {
      router.push(`/admin/notice-management/${data?.next?.postId}`);
    } else if (type === "prev") {
      router.push(`/admin/notice-management/${data?.prev?.postId}`);
    }
  };

  const onClickEdit = () => {
    router.push(`/admin/notice-management/${id}/edit`);
  };

  return (
    <div>
      <PageTitle title={t("header.notice")} />

      <div className="flex justify-center mt-4">
        <div className="max-w-[1200px] w-full">
          <div className="flex justify-end mb-4">
            <Button variant="white" onClick={onClickEdit}>
              {t("edit")}
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
    </div>
  );
}

export default NoticeDetailPage;
