"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import PageTitle from "@/shared/components/pageTitle/page";
import Tabs from "@/shared/components/tab";
import Pagination from "@/shared/components/pagination";
import SimpleDataTable from "@/shared/widgets/simpleDataTable";

const tabs = ["전체", "가입 대기중", "정보 변경 대기중", "승인 완료"];
const tableColumns = [
  { key: "no", title: "NO." },
  { key: "id", title: "ID" },
  { key: "name", title: "이름" },
  { key: "nation", title: "국가" },
  { key: "affiliation", title: "소속" },
  { key: "dateOfSubscription", title: "가입일" },
  { key: "state", title: "상태" },
];

function AcountManagementPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();
  const [data, setData] = useState([
    {
      no: "1",
      id: "nncye0585",
      name: "김서진",
      nation: "대한민국",
      affiliation: "저작권범죄수사대",
      dateOfSubscription: "2025-05-03",
      state: "가입 대기",
    },
    {
      no: "2",
      id: "qkscl6943",
      name: "이윤호",
      nation: "대한민국",
      affiliation: "문화재지식재산보호팀",
      dateOfSubscription: "2025-05-03",
      state: "정보 변경 대기",
    },
  ]);
  const [page, setPage] = useState(1);

  const onClickRow = () => {
    router.push("/admin/account-management/detail");
  };
  return (
    <div className="space-y-10">
      <PageTitle title={t("header.account-mgnt")} />
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div>
        <SimpleDataTable
          columns={tableColumns}
          data={data}
          onClickRow={onClickRow}
        />
        <Pagination currentPage={page} totalPages={2} onPageChange={setPage} />
      </div>
    </div>
  );
}

export default AcountManagementPage;
