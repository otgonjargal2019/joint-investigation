import React from "react";
import { useTranslations } from "next-intl";
import { PROGRESS_STATUS } from "@/entities/investigation/model/constants";

const TagProgressStatus = ({ status }) => {
	const t = useTranslations();

	let text = "";
	let statusClasses = "";
	let baseClasses = "";

	if (Object.values(PROGRESS_STATUS).includes(status)) {
		text = t(`incident.PROGRESS_STATUS.${status}`);
		baseClasses = "flex gap-2 items-center justify-center h-[40px] text-center text-[20px] font-normal rounded-30 bg-white px-4 whitespace-nowrap";
		statusClasses = "border border-color-42 text-color-20";
	}

	return (
		<span className={`${baseClasses} ${statusClasses}`}>
			{text}
		</span>
	);
};

export default TagProgressStatus;
