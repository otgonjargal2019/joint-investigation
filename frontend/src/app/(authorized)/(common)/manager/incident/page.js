"use client";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import Tag from "@/shared/components/tag";
import Tabs from "@/shared/components/tab";
import Button from "@/shared/components/button";
import Plus from "@/shared/components/icons/plus";
import Pagination from "@/shared/components/pagination";
import PageTitle from "@/shared/components/pageTitle/page";
import SimpleDataTable from "@/shared/widgets/simpleDataTable";

import { tableColumns, tableData } from "@/shared/widgets/incident/mockData";

const tabs = ["전체", "진행중인 사건", "종료 사건"];

function IncidentPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const t = useTranslations();

  useEffect(() => {
    if (tableData) {
      const updatedData = tableData.map((row, idx) => ({
        ...row,
        state: <Tag status={idx % 2 === 0 ? "수사종료" : "진행중"} />,
      }));
      setData(updatedData);
    }
  }, [tableData]);

  const router = useRouter();

  const onClickRow = (row) => {
    router.push(`/manager/incident/${row.id}`);
  };

  const onClickAdd = () => {
    router.push(`/manager/incident/create`);
  };

  return (
    <div>
      <PageTitle title={t("header.current-state-entire-incident")} />

      <div className="mt-10 mb-4 flex justify-between items-end">
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        <Button size="mediumWithShadow" onClick={onClickAdd}>
          <Plus />
          {t("create-new-incident")}
        </Button>
      </div>
      <SimpleDataTable
        columns={tableColumns}
        data={data}
        onClickRow={onClickRow}
      />
      <Pagination currentPage={page} totalPages={2} onPageChange={setPage} />
    </div>
  );
}

export default IncidentPage;
