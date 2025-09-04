"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import React, { use, useEffect } from "react";

import PageTitle from "@/shared/components/pageTitle/page";
import Detail from "@/shared/widgets/post/detail";
import { postQuery, BOARD_TYPE, useAddViewPost } from "@/entities/post";

function NoticeDetailPage({ params }) {
  const { id } = use(params);
  const t = useTranslations();
  const router = useRouter();

  const addViewMutation = useAddViewPost();

  const { data: response, isPending } = useQuery(
    postQuery.getPostWithNeighbors({
      postId: id,
      boardType: BOARD_TYPE.NOTICE,
    })
  );

  const data = response?.data;

  useEffect(() => {
    if (id !== undefined) {
      addViewMutation.mutate({ id });
    }
  }, [id]);

  const onClickList = () => router.push("/notice");

  const onClickNavigate = (type) => {
    if (type === "next") {
      router.push(`/notice/${data?.next?.postId}`);
    } else if (type === "prev") {
      router.push(`/notice/${data?.prev?.postId}`);
    }
  };

  return (
    <div>
      <PageTitle title={t("header.notice")} />
      <div className="flex justify-center mt-16">
        <div className="max-w-[1200px] w-full">
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
