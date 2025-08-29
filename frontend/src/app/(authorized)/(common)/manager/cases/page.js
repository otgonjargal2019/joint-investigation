"use client";
import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import Tabs from "@/shared/components/tab";
import Button from "@/shared/components/button";
import Plus from "@/shared/components/icons/plus";
import Pagination from "@/shared/components/pagination";
import PageTitle from "@/shared/components/pageTitle/page";
import SimpleDataTable from "@/shared/widgets/simpleDataTable";

import { useCase } from "@/entities/case";
import { CASE_STATUS } from "@/entities/case";

const tabs = ["전체", "진행중인 사건", "종료 사건"];

const ROWS_PER_PAGE = 10;

// Helper function to safely get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current ? current[key] : undefined;
  }, obj);
};

function CaseListPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0); // React Query uses 0-based pagination
  const t = useTranslations();

  const caseStatus = activeTab === 1 ? CASE_STATUS.OPEN :
                        activeTab === 2 ? CASE_STATUS.CLOSED :
                        undefined;

  const { data: recordsData, isLoading } = useCase({
    page,
    size: ROWS_PER_PAGE,
    status: caseStatus
  });

  // Transform the data to handle nested properties
  const transformedData = useMemo(() => {
    if (!recordsData?.rows) return [];
    return recordsData.rows.map(row => ({
      ...row,
      // Pre-compute nested values for table rendering
      "creator.nameKr": getNestedValue(row, "creator.nameKr"),
      "creator.country": getNestedValue(row, "creator.country"),
      "latestRecord.progressStatus": getNestedValue(row, "latestRecord.progressStatus")
    }));
  }, [recordsData?.rows]);

  const router = useRouter();

  const onClickRow = (row) => {
    router.push(`/manager/cases/${row.recordId}`);
  };

  const onClickAdd = () => {
    router.push(`/manager/cases/create`);
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
        columns={[
          {
            key: "caseId",
            title: t('incident.case-number')
          },
          {
            key: "caseName",
            title: t('incident.title')
          },
          {
            key: "creator.nameKr",
            title: t('incident.manager')
          },
          {
            key: "creator.country",
            title: t('incident.country-of-occurrence')
          },
          {
            key: "investigationDate",
            title: t('incident.investigation-start-date'),
            render: (value) => new Date(value).toLocaleDateString()
          },
          {
            key: "infringementType",
            title: t('incident.infringement-type')
          },
          {
            key: "status",
            title: t('incident.status'),
            // render: (value) => (
            //   <Tag status={value === CASE_STATUS.CLOSED ? "수사종료" : "진행중"} />
            // )
          },
          {
            key: "latestRecord.progressStatus",
            title: t('incident.progress-detail'),
            render: (value) => t(`incident.review-status.${value.toLowerCase()}`)
          }
        ]}
        data={transformedData}
        onClickRow={onClickRow}
        isLoading={isLoading}
      />
      <Pagination
        currentPage={page + 1}
        totalPages={Math.ceil((recordsData?.total || 0) / ROWS_PER_PAGE)}
        onPageChange={(newPage) => setPage(newPage - 1)}
      />
    </div>
  );
}

export default CaseListPage;
