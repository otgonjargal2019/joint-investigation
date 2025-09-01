"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

import Tag from "@/shared/components/tag";
import Button from "@/shared/components/button";
import CaseDetailGrid from "@/shared/widgets/caseDetailGrid";
import Pagination from "@/shared/components/pagination";
import PageTitle from "@/shared/components/pageTitle/page";
import Users from "@/shared/components/icons/users";
import EditFile from "@/shared/components/icons/editFile";
import SimpleDataTable from "@/shared/widgets/simpleDataTable";
import {
  tableColumns,
  tableData,
} from "@/shared/widgets/incident/detail/mockData";

import { useCaseById } from "@/entities/case";

function IncidentDetailPage() {
  const [page, setPage] = useState(1);
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const id = pathname.split("/")[3];

  const { data: recordData, isLoading } = useCaseById({
      id,
  });

  // const onClickNew = () => {
  //   router.push("/incident/create");
  // };

  const onClickRow = (row) => {
    console.log(row);
    const id = pathname.split("/")[3];
    console.log("id:", id);
    router.push(`/manager/incident/${id}/inquiry/${row.no}`);
  };

  return (
    <div>
      <div className="flex items-center">
        <div className="flex-1" />

        <div className="flex flex-col items-center">
          <PageTitle title={t("header.incident-detail")} />
          <div className="flex gap-4 justify-center mt-2">
            <Tag status="ONGOING" />
            <Tag status="COLLECTINGDIGITAL" />
          </div>
        </div>

        <div className="flex gap-2 items-center flex-1 justify-end">
          <Button variant="white" size="mediumWithShadow" className="gap-3">
            <Users />
            {t("case-detail.set-investigator")}
          </Button>
          <Button variant="white" size="mediumWithShadow" className="gap-3">
            <EditFile />
            {t("case-detail.edit-incident-info")}
          </Button>
        </div>
      </div>

      <div className="mb-8 mt-2">
        <h3 className="text-[24px] text-color-8 font-medium mb-2">
          {t("subtitle.incident-information")}
        </h3>
        <CaseDetailGrid item={recordData} />
      </div>
      <h3 className="text-[24px] text-color-8 font-medium mb-2">
        {t("subtitle.investigation-records")}
      </h3>
      <SimpleDataTable
        columns={tableColumns}
        data={tableData}
        onClickRow={onClickRow}
      />
      <Pagination currentPage={page} totalPages={2} onPageChange={setPage} />
    </div>
  );
}

export default IncidentDetailPage;
