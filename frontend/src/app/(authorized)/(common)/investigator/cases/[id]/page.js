"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";

import Button from "@/shared/components/button";
import CaseDetailGrid from "@/shared/widgets/caseDetailGrid";
import Pagination from "@/shared/components/pagination";
import PageTitle from "@/shared/components/pageTitle/page";
import CreateDoc from "@/shared/components/icons/createDoc";
import SimpleDataTable from "@/shared/widgets/simpleDataTable";
import { useCaseById } from "@/entities/case";
import { useInvestigationRecords } from "@/entities/investigation";
import TagCaseStatus from "@/shared/components/tagCaseStatus";

const ROWS_PER_PAGE = parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE) || 10;

// Helper function to safely get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current ? current[key] : undefined;
  }, obj);
};

function IncidentDetailPage() {
  const [page, setPage] = useState(1);
  const [investigationRecordsPage, setInvestigationRecordsPage] = useState(1);
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();

  // Fetch case data using the ID from URL params
  const {
    data: caseData,
    isLoading,
    error
  } = useCaseById({ id: params.id });

  // Fetch investigation records for this case
  const {
    data: investigationRecordsData,
    isLoading: isLoadingRecords,
    error: recordsError
  } = useInvestigationRecords({
    caseId: params.id,
    page: investigationRecordsPage - 1, // Convert to 0-based for API
    size: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE) || 10,
  });

  const onClickNew = () => {
    router.push(`/investigator/investigation-records/create?caseId=${params.id}`);
  };

  // Define investigation records table columns
  const investigationRecordsColumns = [
    { key: "no", title: "No." },
    { key: "recordName", title: "수사기록" },
    { key: "creator.nameKr", title: "작성자" },
    {
      key: "createdAt",
      title: "작성일",
      render: (value) => new Date(value).toLocaleDateString()
    },
    { key: "evidence", title: "디지털 증거물" },
    { key: "investigationReport", title: "수사보고서" },
    { key: "progressStatus", title: "진행상태", render: (value) => t(`incident.PROGRESS_STATUS.${value}`) },
  ];

  const transformedData = useMemo(() => {
      if (!investigationRecordsData?.rows) return [];
      return investigationRecordsData.rows.map(row => ({
        ...row,
        // Pre-compute nested values for table rendering
        "creator.nameKr": getNestedValue(row, "creator.nameKr"),
        "creator.country": getNestedValue(row, "creator.country"),
        // "latestRecord.progressStatus": getNestedValue(row, "latestRecord.progressStatus")
      }));
    }, [investigationRecordsData]);

  // Show loading state
  if (isLoading) {
    return (
      <div>
        <PageTitle title={t("header.incident-detail")} />
        <div className="text-center py-8">Loading case details...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div>
        <PageTitle title={t("header.incident-detail")} />
        <div className="text-red-500 text-center py-8">
          Error loading case: {error.message}
        </div>
      </div>
    );
  }

  // Show not found state
  if (!caseData) {
    return (
      <div>
        <PageTitle title={t("header.incident-detail")} />
        <div className="text-center py-8">Case not found</div>
      </div>
    );
  }

  return (
    <div>
      <PageTitle title={t("header.incident-detail")} />

      <div className="flex gap-4 justify-center mt-2">
        <TagCaseStatus status={caseData.status} />
        {caseData.riskLevel && <Tag status={caseData.riskLevel} />}
      </div>

      <div className="mb-8">
        <h3 className="text-[24px] text-color-8 font-medium mb-2">
          {t("subtitle.incident-information")}
        </h3>
        <CaseDetailGrid item={caseData}/>
      </div>
      <h3 className="text-[24px] text-color-8 font-medium mb-2">
        {t("subtitle.investigation-records")}
      </h3>
      <div className="mb-4">
        <Button
          variant="white"
          size="mediumWithShadow"
          className="gap-3 w-[228.5px]"
          onClick={onClickNew}
        >
          <CreateDoc />
          {t("create-new-investigation-record")}
        </Button>
      </div>
      <SimpleDataTable
        columns={investigationRecordsColumns}
        data={transformedData}
        loading={isLoadingRecords}
      />
      <Pagination
        currentPage={investigationRecordsPage}
        totalPages={Math.ceil((investigationRecordsData?.total || 0) / ROWS_PER_PAGE)}
        onPageChange={setInvestigationRecordsPage}
      />
    </div>
  );
}

export default IncidentDetailPage;
