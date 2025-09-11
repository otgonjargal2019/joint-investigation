"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import PageTitle from "@/shared/components/pageTitle/page";
import InvestigatorAssignEdit from "@/shared/widgets/manager/investigatorAssignEdit";

function EditCaseAssignmentPage() {
  const t = useTranslations();
  const params = useParams();
  const caseId = params.id;

  return (
    <div>
      <PageTitle title={t("edit-case-assignment")} />
      <InvestigatorAssignEdit caseId={caseId} />
    </div>
  );
}

export default EditCaseAssignmentPage;
