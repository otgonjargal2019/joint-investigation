"use client";

import { toast } from "react-toastify";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import * as Popover from "@radix-ui/react-popover";

import Button from "@/shared/components/button";
import PageTitle from "@/shared/components/pageTitle/page";
import Pagination from "@/shared/components/pagination";
import SimpleDataTable from "@/shared/widgets/simpleDataTable";
import TrashBin from "@/shared/components/icons/trashBin";
import { postQuery, BOARD_TYPE, useDeletePost } from "@/entities/post";

const tableColumns = [
  { key: "no", title: "NO." },
  { key: "title", title: "제목" },
  { key: "createdAt", title: "날짜", textAlign: "text-center" },
  { key: "viewCount", title: "조회수", textAlign: "text-center" },
  { key: "attachmentCount", title: "첨부파일", textAlign: "text-center" },
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

function ResearchManagementPage() {
  const t = useTranslations();

  const [openPopover, setOpenPopover] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const deleteMutation = useDeletePost();

  const { data, isPending, refetch } = useQuery(
    postQuery.getPosts({
      boardType: BOARD_TYPE.RESEARCH,
      size: pageSize,
      page: !isNaN(page) && page > 0 ? page - 1 : 0,
    })
  );

  const onDelete = (item) => {
    deleteMutation.mutate(
      { id: item.postId },
      {
        onSuccess: (res) => {
          setOpenPopover(null);
          toast.success(res.data.message, {
            autoClose: 3000,
            position: "top-center",
          });
          refetch();
        },
        onError: (err) => {
          toast.error(err.response.data.message, {
            position: "top-center",
            autoClose: 2000,
          });
        },
      }
    );
  };

  const totalPages = data?.meta?.totalPages || 1;
  const updatedData = (data?.data || []).map((item, index) => ({
    postId: item.postId,
    title: item.title,
    content: item.content,
    updatedAt: item.updatedAtStr,
    createdAt: item.createdAtStr,
    viewCount: item.viewCount,
    attachmentCount: item.attachmentCount,
    id: index,
    no: (page - 1) * pageSize + index + 1,
    action: (
      <div>
        <Popover.Root
          open={openPopover === item.postId}
          onOpenChange={(open) => setOpenPopover(open ? item.postId : null)}
        >
          <Popover.Trigger asChild>
            <button
              title="Delete a row"
              aria-label="Delete a row"
              className="cursor-pointer"
            >
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
                {t("prompt.are-you-sure-to-delete")}
                <br />
                {t("prompt.deleted-post-cannot-be-recovered")}
              </div>
              <div className="flex gap-2 justify-center mt-4">
                <Popover.Close asChild>
                  <Button variant="gray2">{t("cancel")}</Button>
                </Popover.Close>
                <Button onClick={() => onDelete(item)}>{t("remove")}</Button>
              </div>

              <Popover.Arrow className="fill-color-36" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    ),
  }));

  return (
    <div>
      <PageTitle title={t("header.research-mgnt")} />
      <div className="mt-10">
        <SimpleDataTable
          columns={tableColumns}
          data={updatedData}
          // onClickRow={onClickRow}
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

export default ResearchManagementPage;
