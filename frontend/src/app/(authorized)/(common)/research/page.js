"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import Pagination from "@/shared/components/pagination";
import PageTitle from "@/shared/components/pageTitle/page";
import SimpleDataTable from "@/shared/widgets/simpleDataTable";

import {
  tableColumns,
  tableData,
} from "@/shared/widgets/mockData/investgationInfo";
import Button from "@/shared/components/button";

function ResearchList() {
  const [data, setData] = useState(tableData);
  const [page, setPage] = useState(1);

  const t = useTranslations();
  const router = useRouter();

  const onClickRow = (row) => {
    router.push("/research/detail");
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
