"use client";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import Tag from "@/shared/components/tag";
import Tabs from "@/shared/components/tab";
import Pagination from "@/shared/components/pagination";
import SimpleDataTable from "@/shared/widgets/simpleDataTable";
import PageTitle from "@/shared/components/pageTitle/page";
import CaseCard from "@/shared/components/caseCard";

import { tableColumns, tableData } from "@/shared/widgets/incident/mockData";
import { caseData } from "@/shared/widgets/mockData/homepage";

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
    router.push(`/investigator/incident/${row.id}`);
  };

  return (
    <div>
      <PageTitle title={t("header.current-state-entire-incident")} />
      <h3 className="text-[24px] text-color-8 font-medium mb-2">
        {t("subtitle.recent-investigation")}
      </h3>
      <div className="w-full flex gap-6 justify-between">
        {caseData.map((item, idx) => (
          <CaseCard
            key={idx}
            size={"big"}
            label={item.label}
            code={item.code}
            desc={item.desc}
            color={item.color}
            country={item.country}
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className="mt-10 mb-3">
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
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
