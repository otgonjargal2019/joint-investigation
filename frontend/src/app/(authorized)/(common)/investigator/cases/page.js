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
import { COLOR_MAP } from "@/entities/case/model/constants";

const tabs = [
  { label: "전체", value: 0 },
  { label: "진행중인 사건", value: 1 },
  { label: "종료 사건", value: 2 },
];

const ROWS_PER_PAGE = parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE) || 10;

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

  const getStatusFilter = (tabValue) => {
    switch (tabValue) {
      case 1:
        return "OPEN"; // 진행중인 사건
      case 2:
        return "CLOSED"; // 종료 사건
      default:
        return undefined; // 전체 (no filter)
    }
  };

  const {
    data: casesResponse,
    isLoading,
    error,
  } = useMyAssignedCase({
    page: page - 1,
    size: ROWS_PER_PAGE,
    status: getStatusFilter(activeTab),
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const transformedData = useMemo(() => {
    if (!casesResponse?.rows) return [];
    return casesResponse.rows.map((row) => ({
      ...row,
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
        {casesResponse?.recentCases?.length > 0 &&
          t("subtitle.recent-investigation")}
      </h3>
      <div className="w-full flex gap-6">
        {casesResponse?.recentCases?.map((item) => (
          <div key={item.caseId} className="basis-1/3 overflow-hidden">
            <CaseCard
              key={item.caseId}
              size={"big"}
              label={
                item?.infringementType
                  ? t(
                      `case_details.case_infringement_type.${item?.infringementType}`
                    )
                  : ""
              }
              code={`#${item.number}. ${item.caseId}`}
              desc={item.caseName}
              color={`${COLOR_MAP[item?.infringementType || "DEFAULT"]}`}
              country={item.relatedCountries}
              isLoading={isLoading}
              onClick={() => onClickRow(item)}
            />
          </div>
        ))}
      </div>

      <div className="mt-10 mb-3">
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <SimpleDataTable
        columns={[
          {
            key: "number",
            title: t("incident.case-number"),
            textAlign: "text-center",
            width: "7%",
          },
          {
            key: "caseName",
            title: t("incident.title"),
            textAlign: "text-left",
          },
          {
            key: "creator.nameKr",
            title: t("incident.manager"),
            textAlign: "text-center",
            width: "12%",
          },
          {
            key: "relatedCountries",
            title: t("incident.country-of-occurrence"),
            textAlign: "text-center",
            width: "12%",
          },
          {
            key: "investigationDate",
            title: t("incident.investigation-start-date"),
            textAlign: "text-center",
            width: "8%",
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
            key: "infringementType",
            title: t("incident.infringement-type"),
            textAlign: "text-center",
            width: "12%",
            render: (value) => {
              if (!value) return "";
              return t(`case_details.case_infringement_type.${value}`);
            },
          },
          {
            key: "status",
            title: t("incident.status"),
            textAlign: "text-center",
            width: "10%",
            render: (value) => <TagCaseStatus status={value} />,
          },
          {
            key: "latestRecord.progressStatus",
            title: t("incident.progress-detail"),
            textAlign: "text-center",
            width: "10%",
            render: (value) => <TagProgressStatus status={value} />,
          },
        ]}
        data={transformedData}
        onClickRow={onClickRow}
        isLoading={isLoading}
      />
      <Pagination
        currentPage={page}
        totalPages={casesResponse?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

export default IncidentPage;
