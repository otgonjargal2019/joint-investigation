"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import Tag from "@/shared/components/tag";
import Tabs from "@/shared/components/tab";
import Button from "@/shared/components/button";
import Plus from "@/shared/components/icons/plus";
import Pagination from "@/shared/components/pagination";
import PageTitle from "@/shared/components/pageTitle/page";
import SimpleDataTable from "@/shared/widgets/simpleDataTable";

import { useInvestigationRecords } from "@/entities/investigation";
import { PROGRESS_STATUS } from "@/entities/investigation";

const tabs = ["전체", "진행중인 사건", "종료 사건"];

const ROWS_PER_PAGE = 10;

function IncidentPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0); // React Query uses 0-based pagination
  const t = useTranslations();

  const progressStatus = activeTab === 1 ? PROGRESS_STATUS.IN_PROGRESS :
                        activeTab === 2 ? PROGRESS_STATUS.COMPLETED :
                        undefined;

  const { data: recordsData, isLoading } = useInvestigationRecords({
    page,
    size: ROWS_PER_PAGE,
    progressStatus
  });

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
        columns={[
          {
            key: "caseInstance.caseId",
            title: t('incident.case-number')
          },
          {
            key: "recordName",
            title: t('incident.title')
          },
          {
            key: "creator.userId",
            title: t('incident.manager')
          },
          {
            key: "creator.country",
            title: t('incident.country-of-occurrence')
          },
          {
            key: "startDate",
            title: t('incident.investigation-start-date'),
            render: (value) => new Date(value).toLocaleDateString()
          },
          {
            key: "caseInstance.infringementType",
            title: t('incident.infringement-type')
          },
          {
            key: "caseInstance.status",
            title: t('incident.status'),
            render: (value) => (
              <Tag status={value === PROGRESS_STATUS.COMPLETED ? "수사종료" : "진행중"} />
            )
          },
          {
            key: "reviewStatus",
            title: t('incident.progress-detail'),
            render: (value) => t(`incident.review-status.${value.toLowerCase()}`)
          }
        ]}
        data={recordsData?.rows || []}
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

export default IncidentPage;
