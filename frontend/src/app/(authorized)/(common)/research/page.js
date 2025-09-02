"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import Button from "@/shared/components/button";
import Pagination from "@/shared/components/pagination";
import PageTitle from "@/shared/components/pageTitle/page";
import SimpleDataTable from "@/shared/widgets/simpleDataTable";
import { postQuery, BOARD_TYPE } from "@/entities/post";

export const tableColumns = [
  { key: "no", title: "No.", textAlign: "text-center" },
  { key: "title", title: "제목", textAlign: "text-left" },
  { key: "createdAtStr", title: "날짜", textAlign: "text-center" },
  { key: "viewCount", title: "조회수", textAlign: "text-center" },
  { key: "attachedFile", title: "첨부파일", textAlign: "text-center" },
];

function ResearchList() {
  const t = useTranslations();
  const router = useRouter();

  const [page, setPage] = useState(1);

  const { data, isPending } = useQuery(
    postQuery.getPosts({
      boardType: BOARD_TYPE.RESEARCH,
      size: 10,
      page: !isNaN(page) && page > 0 ? page - 1 : 0,
    })
  );

  const onClickRow = (row) => {
    if (row && row?.postId) {
      router.push(`/research/${row.postId}`);
    }
  };

  const onCreate = () => {
    router.push("/research/create");
  };

  return (
    <div>
      <PageTitle title={t("header.research")} />
      <div className="flex justify-end mb-4">
        <Button onClick={onCreate}>{t("create")}</Button>
      </div>
      <div className="space-y-12">
        <SimpleDataTable
          columns={tableColumns}
          data={data}
          onClickRow={onClickRow}
        />
        <Pagination currentPage={page} totalPages={2} onPageChange={setPage} />
      </div>
    </div>
  );
}

export default ResearchList;
