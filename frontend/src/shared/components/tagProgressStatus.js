import React from "react";
import { useTranslations } from "next-intl";

const TagProgressStatus = ({ status }) => {
	const t = useTranslations();

	let text = "";
	let statusClasses = "";
	let baseClasses = "";

	if (["PRE_INVESTIGATION", "INVESTIGATION", "REVIEW", "DISPOSE", "CLOSED"].includes(status)) {
		text = t(`incident.PROGRESS_STATUS.${status}`);
		baseClasses = "flex gap-2 items-center justify-center h-[40px] text-center text-[20px] font-normal rounded-30 bg-white px-4";
		statusClasses = "border border-color-42 text-color-20";
	}

	return (
		<span className={`${baseClasses} ${statusClasses}`}>
			{text}
		</span>
	);
};

export default TagProgressStatus;
