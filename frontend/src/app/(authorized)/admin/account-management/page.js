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
  { key: "no", title: "NO." },
  { key: "loginId", title: "ID" },
  { key: "nameKr", title: "이름" },
  { key: "country", title: "국가" },
  { key: "affiliation", title: "소속" },
  { key: "createdAt", title: "가입일" },
  { key: "status2", title: "상태" },
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
    const { status2, ...rowWithoutStatus2 } = row;

    if (
      rowWithoutStatus2.status === USERSTATUS.PENDING ||
      rowWithoutStatus2.status === USERSTATUS.APPROVED ||
      rowWithoutStatus2.status === USERSTATUS.WAITING_TO_CHANGE
    ) {
      const query = new URLSearchParams(rowWithoutStatus2).toString();
      router.push(`/admin/account-management/detail?${query}`);
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
