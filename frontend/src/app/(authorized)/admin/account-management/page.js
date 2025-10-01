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
import { USERSTATUS } from "@/shared/dictionary";

const tabs = [
  { label: "전체", value: "ALL" },
  { label: "가입 대기중", value: USERSTATUS.PENDING },
  { label: "정보 변경 대기중", value: USERSTATUS.WAITING_TO_CHANGE },
  { label: "승인 완료", value: USERSTATUS.APPROVED },
];
const tableColumns = [
  { key: "no", title: "NO.", textAlign: "text-center", width: "7%" },
  { key: "loginId", title: "ID", textAlign: "text-left", width: "14%" },
  { key: "name", title: "이름", textAlign: "text-left", width: "14%" },
  {
    key: "countryName",
    title: "국가",
    textAlign: "text-center",
    width: "14%",
  },
  { key: "affiliation", title: "소속", textAlign: "text-center" },
  {
    key: "createdAtFormatted",
    title: "가입일",
    textAlign: "text-center",
    width: "10%",
  },
  { key: "status2", title: "상태", textAlign: "text-center", width: "10%" },
];

function AcountManagementPage() {
  const t = useTranslations();
  const router = useRouter();

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

  const onClickRow = (row) => {
    const { userId } = row;

    if (userId) {
      router.push(`/admin/account-management/${userId}`);
    }
  };

  const getFancyStatusName = (status) => {
    switch (status) {
      case USERSTATUS.APPROVED:
        return (
          <span className={`text-color-24`}>{t("user-status.approved")}</span>
        );
      case USERSTATUS.PENDING:
        return (
          <span className={`text-color-103`}>{t("user-status.pending")}</span>
        );
      case USERSTATUS.WAITING_TO_CHANGE:
        return (
          <span className={`text-color-102`}>
            {t("user-status.waiting-to-change")}
          </span>
        );
      case USERSTATUS.REJECTED:
        return (
          <span className={`text-color-104`}>{t("user-status.rejected")}</span>
        );
      default:
        return <span></span>;
    }
  };

  const users = (data?.data || []).map((user, index) => ({
    ...user,
    status2: getFancyStatusName(user.status),
    no: (page - 1) * pageSize + index + 1,
    affiliation: `${user.headquarterName} -> ${user.departmentName}`,
    name: user.nameKr || user.nameEn,
  }));
  const totalPages = data?.meta?.totalPages;

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
