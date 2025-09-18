"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

import PageTitle from "@/shared/components/pageTitle/page";
import Detail from "@/shared/widgets/post/detail";
import { postQuery, BOARD_TYPE } from "@/entities/post";

function ResearchDetailPage({ params }) {
  const { id } = use(params);
  const t = useTranslations();
  const router = useRouter();

  const { data: response, isPending } = useQuery(
    postQuery.getPostWithNeighbors({
      postId: id,
      boardType: BOARD_TYPE.RESEARCH,
    })
  );

  const data = response?.data;

  const onClickList = () => router.push("/admin/research-management");

  const onClickNavigate = (type) => {
    if (type === "next") {
      router.push(`/admin/research-management/${data?.next?.postId}`);
    } else if (type === "prev") {
      router.push(`/admin/research-management/${data?.prev?.postId}`);
    }
  };

  return (
    <div>
      <PageTitle title={t("header.research")} />

      <div className="flex justify-center mt-4">
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

export default ResearchDetailPage;
