"use client";

import React, { useState, useMemo } from "react";
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

import { useCaseById } from "@/entities/case";
import { useInvestigationRecords } from "@/entities/investigation";

const ROWS_PER_PAGE = 10;

// Helper function to safely get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current ? current[key] : undefined;
  }, obj);
};

function IncidentDetailPage() {
	const [page, setPage] = useState(1);
	const t = useTranslations();
	const router = useRouter();
	const pathname = usePathname();

	const id = pathname.split("/")[3];

	const { data: caseData, isLoading: caseDataLoading } = useCaseById({
		id,
	});

	const { data: investigationRecordData, invRecordLoading } = useInvestigationRecords({
		caseId: id,
		page: page - 1,
	});

	const transformedData = useMemo(() => {
		if (!investigationRecordData?.rows) return [];
		return investigationRecordData.rows.map(row => ({
			...row,
			// Pre-compute nested values for table rendering
			"creator.nameKr": getNestedValue(row, "creator.nameKr"),
			"creator.country": getNestedValue(row, "creator.country"),
			// "latestRecord.progressStatus": getNestedValue(row, "latestRecord.progressStatus")
		}));
	}, [investigationRecordData]);

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
				<h3 className="text-[24px] text-color-8 font-medium mb-2 border-l-[9px] border-black pl-[10px]">
					{t("subtitle.incident-information")}
				</h3>
				<CaseDetailGrid item={caseData} />
			</div>
			<h3 className="text-[24px] text-color-8 font-medium mb-2 border-l-[9px] border-black pl-[10px]">
				{t("subtitle.investigation-records")}
			</h3>
			<SimpleDataTable
				columns={[
					{ key: "no", title: "No." },
					{ key: "recordName", title: "수사기록" },
					{ key: "creator.nameKr", title: "작성자" },
					{
						key: "createdAt",
						title: "작성일",
						render: (value) => new Date(value).toLocaleDateString()
					},
					{ key: "evidence", title: "디지털 증거물" },
					{ key: "investigationReport", title: "수사보고서" },
					{ key: "progressStatus", title: "진행상태", render: (value) => t(`incident.progress-status.${value.toLowerCase()}`) },
				]}
				data={transformedData}
				onClickRow={onClickRow}
			/>
			<Pagination
				currentPage={page}
				totalPages={Math.ceil((investigationRecordData?.total || 0) / ROWS_PER_PAGE)}
				onPageChange={setPage}
			/>
		</div>
	);
}

export default IncidentDetailPage;
