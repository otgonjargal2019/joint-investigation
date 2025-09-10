"use client";
import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import Tabs from "@/shared/components/tab";
import Pagination from "@/shared/components/pagination";
import SimpleDataTable from "@/shared/widgets/simpleDataTable";
import PageTitle from "@/shared/components/pageTitle/page";
import CaseCard from "@/shared/components/caseCard";
import { useMyAssignedCase } from "@/entities/case";
import TagCaseStatus from "@/shared/components/tagCaseStatus";
import TagProgressStatus from "@/shared/components/tagProgressStatus";

import { caseData } from "@/shared/widgets/mockData/homepage";

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

function IncidentPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);

  const t = useTranslations();

  // Get status filter based on active tab
  const getStatusFilter = (tabValue) => {
    switch (tabValue) {
      case 1: return "OPEN"; // 진행중인 사건
      case 2: return "CLOSED"; // 종료 사건
      default: return undefined; // 전체 (no filter)
    }
  };

  // Fetch cases using the real API
  const {
    data: casesResponse,
    isLoading,
    error
  } = useMyAssignedCase({
    page: page - 1, // API uses 0-based pagination
    size: ROWS_PER_PAGE,
    status: getStatusFilter(activeTab),
    sortBy: "createdAt",
    sortDirection: "desc"
  });

  const transformedData = useMemo(() => {
    if (!casesResponse?.rows) return [];
    return casesResponse.rows.map((row) => ({
      ...row,
      // Pre-compute nested values for table rendering
      "creator.nameKr": getNestedValue(row, "creator.nameKr"),
      "creator.country": getNestedValue(row, "creator.country"),
      "latestRecord.progressStatus": getNestedValue(
        row,
        "latestRecord.progressStatus"
      ),
    }));
  }, [casesResponse?.rows]);

  const router = useRouter();

  const onClickRow = (row) => {
    router.push(`/investigator/cases/${row.caseId}`);
  };

  // Show loading or error states
  if (error) {
    return (
      <div>
        <PageTitle title={t("header.current-state-entire-incident")} />
        <div className="text-red-500 text-center py-8">
          Error loading cases: {error.message}
        </div>
      </div>
    );
  }

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
        columns={[
          {
            key: "caseId",
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
            key: "creator.country",
            title: t("incident.country-of-occurrence"),
          },
          {
            key: "investigationDate",
            title: t("incident.investigation-start-date"),
            render: (value) => new Date(value).toLocaleDateString(),
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
        currentPage={page}
        totalPages={casesResponse?.totalPages || 1}
        onPageChange={setPage}
      />
    </div>
  );
}

export default IncidentPage;
