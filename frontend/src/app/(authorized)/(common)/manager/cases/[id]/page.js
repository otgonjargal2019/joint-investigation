"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";

import Button from "@/shared/components/button";
import CaseDetailGrid from "@/shared/widgets/caseDetailGrid";
import Pagination from "@/shared/components/pagination";
import PageTitle from "@/shared/components/pageTitle/page";
import Users from "@/shared/components/icons/users";
import EditFile from "@/shared/components/icons/editFile";
import SimpleDataTable from "@/shared/widgets/simpleDataTable";
import TagCaseStatus from "@/shared/components/tagCaseStatus";
import TagProgressStatus from "@/shared/components/tagProgressStatus";

import { useCaseById } from "@/entities/case";
import { useInvestigationRecords } from "@/entities/investigation";
import { REVIEW_STATUS } from "@/entities/investigation/model/constants";

const ROWS_PER_PAGE = parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE) || 10;

const getNestedValue = (obj, path) => {
  return path.split(".").reduce((current, key) => {
    return current ? current[key] : undefined;
  }, obj);
};

function IncidentDetailPage() {
  const [page, setPage] = useState(1);
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();

  const { data: caseData, isLoading: caseDataLoading } = useCaseById({
    id: params.id,
  });

  const { data: investigationRecordData, isLoading: invRecordLoading } =
    useInvestigationRecords({
      caseId: params.id,
      page: page - 1,
    });

  const transformedData = useMemo(() => {
    if (!investigationRecordData?.rows) return [];
    return investigationRecordData.rows.map((row) => ({
      ...row,
      "creator.nameKr": getNestedValue(row, "creator.nameKr"),
      "creator.country": getNestedValue(row, "creator.country"),
    }));
  }, [investigationRecordData]);

  const onClickRow = (row) => {
    router.push(`/manager/cases/${params.id}/inquiry/${row.recordId}`);
  };

  if (caseDataLoading) {
    return (
      <div>
        <PageTitle title={t("header.incident-detail")} />
        <div className="text-center py-8">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center">
        <div className="flex-1" />

        <div className="flex flex-col items-center">
          <PageTitle title={t("header.incident-detail")} />
          <div className="flex gap-4 justify-center mt-2">
            <TagCaseStatus status={caseData?.status} border/>
            <TagProgressStatus
              status={caseData?.latestRecord?.progressStatus}
            />
          </div>
        </div>

        <div className="flex gap-2 items-center flex-1 justify-end">
          <Button
            variant="white"
            size="mediumWithShadow"
            className="gap-3"
            onClick={() => {
              router.push(`/manager/cases/edit/assignment/${params.id}`);
            }}
          >
            <Users />
            {t("case-detail.set-investigator")}
          </Button>
          <Button
            variant="white"
            size="mediumWithShadow"
            className="gap-3"
            onClick={() => {
              router.push(`/manager/cases/edit/${params.id}`);
            }}
          >
            <EditFile />
            {t("case-detail.edit-incident-info")}
          </Button>
        </div>
      </div>

      <div className="mb-8 mt-2">
        <h3 className="text-[24px] text-color-8 font-medium mb-2 border-l-[9px] border-black pl-[10px]">
          {t("subtitle.incident-information")}
        </h3>
        <CaseDetailGrid item={caseData} />
      </div>
      <h3 className="text-[24px] text-color-8 font-medium mb-2 border-l-[9px] border-black pl-[10px]">
        {t("subtitle.investigation-records")}
      </h3>
      <SimpleDataTable
        columns={[
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
              return attachedFiles?.find((file) => file.digitalEvidence)
                ? "O"
                : "X";
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
                case REVIEW_STATUS.PENDING:
                  return (
                    <span className="text-[#FF5759]">
                      {t(`incident.REVIEW_STATUS.${value}`)}
                    </span>
                  );
                case REVIEW_STATUS.APPROVED:
                  return (
                    <span className="text-[#656161]">
                      {t(`incident.REVIEW_STATUS.${value}`)}
                    </span>
                  );
                default:
                  break;
              }
              return "";
            },
          },
        ]}
        data={transformedData}
        onClickRow={onClickRow}
      />
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(
          (investigationRecordData?.total || 0) / ROWS_PER_PAGE
        )}
        onPageChange={setPage}
      />
    </div>
  );
}

export default IncidentDetailPage;
