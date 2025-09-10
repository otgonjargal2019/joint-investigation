"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import Tag from "@/shared/components/tag";
import Button from "@/shared/components/button";
import CaseDetailGrid from "@/shared/widgets/caseDetailGrid";
import Pagination from "@/shared/components/pagination";
import PageTitle from "@/shared/components/pageTitle/page";
import CreateDoc from "@/shared/components/icons/createDoc";
import SimpleDataTable from "@/shared/widgets/simpleDataTable";
import {
  tableColumns,
  tableData,
} from "@/shared/widgets/incident/detail/mockData";

const obj = {
  data1: "156-8156",
  data2: "2024-01-01 02:59:00",
  data3: "test 3",
  data4: "test 4",
  data5: "test 5",
  data6:
    "2. test6 test6 test6 test6 test6 test6 test6 test6 test6 test6 test6 test6 test6 test6 test6 test6 test6 test6 test6 test6",
  data7:
    "1. test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test",
  data8: "test8 test8 test8 test8 test8 test8 test8 test8",
};

function IncidentDetailPage() {
  const [page, setPage] = useState(1);
  const t = useTranslations();
  const router = useRouter();

  const onClickNew = () => {
    router.push("/investigator/incident/create");
  };

  return (
    <div>
      <PageTitle title={t("header.incident-detail")} />

      <div className="flex gap-4 justify-center mt-2">
        <Tag status="ONGOING" />
        <Tag status="COLLECTINGDIGITAL" />
      </div>

      <div className="mb-8">
        <h3 className="text-[24px] text-color-8 font-medium mb-2">
          {t("subtitle.incident-information")}
        </h3>
        <CaseDetailGrid item={obj} />
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
      <SimpleDataTable columns={tableColumns} data={tableData} />
      <Pagination currentPage={page} totalPages={2} onPageChange={setPage} />
    </div>
  );
}

export default IncidentDetailPage;
