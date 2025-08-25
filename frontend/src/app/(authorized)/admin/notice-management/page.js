"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import * as Popover from "@radix-ui/react-popover";

import Button from "@/shared/components/button";
import Pagination from "@/shared/components/pagination";
import PageTitle from "@/shared/components/pageTitle/page";
import SimpleDataTable from "@/shared/widgets/simpleDataTable";
import TrashBin from "@/shared/components/icons/trashBin";

const tableColumns = [
  { key: "no", title: "NO." },
  { key: "title", title: "제목" },
  { key: "date", title: "날짜", textAlign: "text-center" },
  { key: "viewers", title: "조회수", textAlign: "text-center" },
  { key: "attachedFile", title: "첨부파일", textAlign: "text-center" },
  {
    key: "action",
    title: (
      <div className="flex justify-center">
        <TrashBin />
      </div>
    ),
    textAlign: "flex justify-center",
  },
];
const list = [
  {
    no: "130",
    title: "해외 스트리밍 사이트 통한 저작권 침해 사례 공유",
    date: "2025.05.19",
    viewers: "64",
    attachedFile: "64",
  },
  {
    no: "129",
    title: "○○ 플랫폼 내 불법 영상 업로드 계정 추적 정보",
    date: "2025.05.11",
    viewers: "125",
    attachedFile: "125",
  },
  {
    no: "128",
    title: "최근 적발된 웹툰 불법 유통 경로 분석",
    date: "2025.05.09",
    viewers: "194",
    attachedFile: "194",
  },
];
function AnnouncementManagementPage() {
  const t = useTranslations();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const router = useRouter();

  const onClickRemoveRow = (item, idx) => {
    console.log(item, idx);
  };

  const onCreate = () => {
    router.push("/admin/announcement-management/create");
  };

  const onClickRow = (row) => {
    router.push("/admin/announcement-management/detail");
  };

  useEffect(() => {
    setData([
      ...list.map((item, index) => ({
        ...item,
        id: index,
        action: (
          <Popover.Root>
            <Popover.Trigger asChild>
              <button title="Delete a row" aria-label="Delete a row">
                <TrashBin />
              </button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                side="bottom"
                align="end"
                sideOffset={8}
                alignOffset={-8}
                className="rounded-10 bg-white border border-color-36 shadow p-4 py-6 w-[360px] space-y-3 z-50"
              >
                <div className="text-color-24 text-[20px] font-normal text-center whitespace-nowrap">
                  해당 게시글을 삭제하시겠습나까?
                  <br />
                  삭제한 게시글은 복구할 수 없습니다.
                </div>
                <div className="flex gap-2 justify-center mt-4">
                  <Popover.Close asChild>
                    <Button variant="gray2">{t("cancel")}</Button>
                  </Popover.Close>
                  <Button onClick={() => onClickRemoveRow(item, index)}>
                    {t("remove")}
                  </Button>
                </div>

                <Popover.Arrow className="fill-color-36" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        ),
      })),
    ]);
  }, [list]);

  return (
    <div>
      <PageTitle title={t("header.notice-mgnt")} />
      <div className="flex justify-end mb-4">
        <Button onClick={onCreate}>{t("create")}</Button>
      </div>
      <SimpleDataTable
        columns={tableColumns}
        data={data}
        onClickRow={onClickRow}
      />
      <Pagination currentPage={page} totalPages={2} onPageChange={setPage} />
    </div>
  );
}

export default AnnouncementManagementPage;
