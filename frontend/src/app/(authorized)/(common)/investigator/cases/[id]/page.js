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
import TagProgressStatus from "@/shared/components/tagProgressStatus";
import { REVIEW_STATUS } from "@/entities/investigation/model/constants";
import { CASE_STATUS } from "@/entities/case/model/constants";

const ROWS_PER_PAGE = parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE) || 10;

const getNestedValue = (obj, path) => {
  return path.split(".").reduce((current, key) => {
    return current ? current[key] : undefined;
  }, obj);
};

function IncidentDetailPage() {
  const [investigationRecordsPage, setInvestigationRecordsPage] = useState(1);
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();

  const { data: caseData, isLoading, error } = useCaseById({ id: params.id });

  const {
    data: investigationRecordsData,
    isLoading: isLoadingRecords,
    error: recordsError,
  } = useInvestigationRecords({
    caseId: params.id,
    page: investigationRecordsPage - 1,
    size: ROWS_PER_PAGE,
  });

  const onClickNew = () => {
    router.push(`/investigator/cases/${params.id}/investigationRecord/create`);
  };

  const onClickRow = (row) => {
    router.push(
      `/investigator/cases/${params.id}/investigationRecord/${row.recordId}`
    );
  };

  const investigationRecordsColumns = [
    { key: "number", title: "No." },
    { key: "recordName", title: "수사기록" },
    { key: "creator.nameKr", title: "작성자" },
    {
      key: "createdAt",
      title: "작성일",
      render: (value) => {
        if (!value) return "";
        const date = new Date(value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      },
    },
    {
      key: "attachedFiles",
      title: "디지털 증거물",
      render: (attachedFiles) => {
        if (!attachedFiles) return "X";
        return attachedFiles?.find((file) => file.digitalEvidence) ? "O" : "X";
      },
    },
    {
      key: "attachedFiles",
      title: "수사보고서",
      render: (attachedFiles) => {
        if (!attachedFiles) return "X";
        return attachedFiles?.find((file) => file.investigationReport)
          ? "O"
          : "X";
      },
    },
    {
      key: "reviewStatus",
      title: "진행상태",
      render: (value) => {
        switch (value) {
          case REVIEW_STATUS.WRITING:
            return (
              <span className="text-[#6B62D3]">
                {t(`incident.REVIEW_STATUS.${value}`)}
              </span>
            );
          case REVIEW_STATUS.PENDING:
            return (
              <span className="text-[#9B9B9B]">
                {t(`incident.REVIEW_STATUS.${value}`)}
              </span>
            );
          case REVIEW_STATUS.APPROVED:
            return (
              <span className="text-[#656161]">
                {t(`incident.REVIEW_STATUS.${value}`)}
              </span>
            );
          case REVIEW_STATUS.REJECTED:
            return (
              <span className="text-[#FF5759]">
                {t(`incident.REVIEW_STATUS.${value}`)}
              </span>
            );
          default:
            break;
        }
        return "";
      },
    },
  ];

  const transformedData = useMemo(() => {
    if (!investigationRecordsData?.rows) return [];
    return investigationRecordsData.rows.map((row) => ({
      ...row,
      "creator.nameKr": getNestedValue(row, "creator.nameKr"),
      "creator.country": getNestedValue(row, "creator.country"),
    }));
  }, [investigationRecordsData]);

  if (isLoading) {
    return (
      <div>
        <PageTitle title={t("header.incident-detail")} />
        <div className="text-center py-8">{t("loading")}</div>
      </div>
    );
  }

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
        <TagCaseStatus status={caseData.status} border/>
        <TagProgressStatus status={caseData?.latestRecord?.progressStatus} />
      </div>

      <div className="mb-8">
        <h3 className="text-[24px] text-color-8 font-medium mb-2 border-l-[9px] border-black pl-[10px]">
          {t("subtitle.incident-information")}
        </h3>
        <CaseDetailGrid item={caseData} />
      </div>
      <h3 className="text-[24px] text-color-8 font-medium mb-2 border-l-[9px] border-black pl-[10px]">
        {t("subtitle.investigation-records")}
      </h3>
      <div className="mb-4">
        {caseData.status !== CASE_STATUS.CLOSED && (
          <Button
            variant="white"
            size="mediumWithShadow"
            className="gap-3 w-[228.5px]"
            onClick={onClickNew}
          >
            <div className="ml-[6px] w-[30px]">
              <CreateDoc width={20} height={22} />
            </div>
            {t("create-new-investigation-record")}
          </Button>
        )}
      </div>
      <SimpleDataTable
        columns={investigationRecordsColumns}
        data={transformedData}
        loading={isLoadingRecords}
        onClickRow={onClickRow}
      />
      <Pagination
        currentPage={investigationRecordsPage}
        totalPages={Math.ceil(
          (investigationRecordsData?.total || 0) / ROWS_PER_PAGE
        )}
        onPageChange={setInvestigationRecordsPage}
      />
    </div>
  );
}

export default IncidentDetailPage;
