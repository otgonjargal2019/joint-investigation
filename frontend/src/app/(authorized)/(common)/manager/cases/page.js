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
import TagCaseStatus from "@/shared/components/tagCaseStatus";
import TagProgressStatus from "@/shared/components/tagProgressStatus";

import { useCase } from "@/entities/case";
import { CASE_STATUS } from "@/entities/case";

const tabs = [
  { label: "전체", value: 0 },
  { label: "진행중인 사건", value: 1 },
  { label: "종료 사건", value: 2 },
];

const ROWS_PER_PAGE = parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE) || 10;

// Helper function to safely get nested object values
const getNestedValue = (obj, path) => {
  return path.split(".").reduce((current, key) => {
    return current ? current[key] : undefined;
  }, obj);
};

function CaseListPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0); // React Query uses 0-based pagination
  const t = useTranslations();

  const caseStatus =
    activeTab === 1
      ? CASE_STATUS.OPEN
      : activeTab === 2
      ? CASE_STATUS.CLOSED
      : undefined;

  const { data: recordsData, isLoading } = useCase({
    page,
    size: ROWS_PER_PAGE,
    status: caseStatus,
  });

  // Transform the data to handle nested properties
  const transformedData = useMemo(() => {
    if (!recordsData?.rows) return [];
    return recordsData.rows.map((row) => ({
      ...row,
      // Pre-compute nested values for table rendering
      "creator.nameKr": getNestedValue(row, "creator.nameKr"),
      "creator.country": getNestedValue(row, "creator.country"),
      "latestRecord.progressStatus": getNestedValue(
        row,
        "latestRecord.progressStatus"
      ),
    }));
  }, [recordsData?.rows]);

  const router = useRouter();

  const onClickRow = (row) => {
    router.push(`/manager/cases/${row.caseId}`);
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
          <div className="mr-[6px]"><Plus /></div>
          {t("create-new-incident")}
        </Button>
      </div>
      <SimpleDataTable
        columns={[
          {
            key: "number",
            title: t("incident.case-number"),
          },
          {
            key: "caseName",
            title: t("incident.title"),
          },
          {
            key: "creator.nameKr",
            title: t("incident.manager"),
          },
          {
            key: "relatedCountries",
            title: t("incident.country-of-occurrence"),
          },
          {
            key: "investigationDate",
            title: t("incident.investigation-start-date"),
            render: (value) => {
              if (!value) return '';
              const date = new Date(value);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            }
          },
          {
            key: "infringementType",
            title: t("incident.infringement-type"),
          },
          {
            key: "status",
            title: t("incident.status"),
            render: (value) => (
              <TagCaseStatus status={value} />
            )
          },
          {
            key: "latestRecord.progressStatus",
            title: t("incident.progress-detail"),
            render: (value) => (
              <TagProgressStatus status={value} />
            )
          },
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
