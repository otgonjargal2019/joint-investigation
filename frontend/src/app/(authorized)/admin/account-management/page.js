"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

import PageTitle from "@/shared/components/pageTitle/page";
import Tabs from "@/shared/components/tab";
import Pagination from "@/shared/components/pagination";
import SimpleDataTable from "@/shared/widgets/simpleDataTable";
import { userQuery } from "@/entities/user";

const userStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  WAITING_TO_CHANGE: "WAITING_TO_CHANGE",
};

const tabs = [
  { label: "전체", value: "ALL" },
  { label: "가입 대기중", value: userStatus.PENDING },
  { label: "정보 변경 대기중", value: userStatus.WAITING_TO_CHANGE },
  { label: "승인 완료", value: userStatus.APPROVED },
];
const tableColumns = [
  { key: "no", title: "NO." },
  { key: "loginId", title: "ID" },
  { key: "nameKr", title: "이름" },
  { key: "country", title: "국가" },
  { key: "affiliation", title: "소속" },
  { key: "createdAt", title: "가입일" },
  { key: "status", title: "상태" },
];

function AcountManagementPage() {
  const t = useTranslations();
  const router = useRouter();

  // const [activeTab, setActiveTab] = useState(0);
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isPending } = useQuery(
    userQuery.getUsersByStatus({
      status: status === "ALL" ? null : status,
      size: pageSize,
      page: !isNaN(page) && page > 0 ? page - 1 : 0,
    })
  );

  console.log("response=====>", data);

  const onClickRow = () => {
    router.push("/admin/account-management/detail");
  };

  const users = (data?.data || []).map((user, index) => ({
    ...user,
    no: (page - 1) * pageSize + index + 1,
  }));
  const totalPages = data?.meta?.totalPages || 1;

  return (
    <div className="space-y-10">
      <PageTitle title={t("header.account-mgnt")} />
      <Tabs tabs={tabs} activeTab={status} setActiveTab={setStatus} />
      <div>
        <SimpleDataTable
          columns={tableColumns}
          data={users}
          onClickRow={onClickRow}
        />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

export default AcountManagementPage;
