"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import Pagination from "@/shared/components/pagination";
import PageTitle from "@/shared/components/pageTitle/page";
import SimpleDataTable from "@/shared/widgets/simpleDataTable";

import { tableColumns, tableData } from "@/shared/widgets/mockData/notice";

function NoticeListPage() {
  const [data, setData] = useState(tableData);
  const [page, setPage] = useState(1);

  const t = useTranslations();
  const router = useRouter();

  const onClickRow = (row) => {
    router.push("/notice/detail");
  };

  return (
    <div>
      <PageTitle title={t("header.notice")} />
      <div className="mt-16 space-y-12">
        <SimpleDataTable
          columns={tableColumns}
          data={data}
          onClickRow={onClickRow}
        />
        <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />
      </div>
    </div>
  );
}

export default NoticeListPage;
