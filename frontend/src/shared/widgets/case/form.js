"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "@/shared/components/button";
import Label from "@/shared/components/form/label";
import Input from "@/shared/components/form/input";
import SelectBox from "@/shared/components/form/select";
import Textarea from "@/shared/components/form/textarea";
import DateInput from "@/shared/components/form/dateInput";
import { fromIsoString } from "@/shared/helper/dateHelper";
import { useCaseById, caseSchema } from "@/entities/case";
import { useCountries } from "@/entities/organizationalData";

const priorityOptions = [
  { label: "1 - Highest", value: 1 },
  { label: "2 - High", value: 2 },
  { label: "3 - Medium", value: 3 },
  { label: "4 - Low", value: 4 },
  { label: "5 - Lowest", value: 5 },
];

const contentTypeOptions = [
  { label: "Video", value: "Video" },
  { label: "Audio", value: "Audio" },
  { label: "Image", value: "Image" },
  { label: "Text", value: "Text" },
  { label: "Software", value: "Software" },
  { label: "Game", value: "Game" },
  { label: "Mixed Media", value: "Mixed Media" },
  { label: "Other", value: "Other" },
];

function CaseForm({
  mode = "create",
  caseId,
  onSubmit,
  onClickCancel,
  isPending = false,
}) {
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(caseSchema) });

  const {
    data: countries = [],
    isLoading: isLoadingCountries,
    isSuccess: isCountriesSuccess,
  } = useCountries();

  const {
    data: caseData,
    isLoading: isLoadingCase,
    error: caseError,
  } = useCaseById({
    id: caseId,
    enabled: !!caseId && isCountriesSuccess,
  });

  useEffect(() => {
    if (caseData) {
      reset({
        caseNumber: `#${caseData.number}`,
        caseName: caseData.caseName || "",
        caseOutline: caseData.caseOutline || "",
        contentType: caseData.contentType || "",
        infringementType: caseData.infringementType || "",
        relatedCountries: caseData.relatedCountries || "",
        priority: caseData.priority || "",
        investigationDate: fromIsoString(caseData.investigationDate),
        etc: caseData.etc || "",
      });
    }
  }, [caseData, reset]);

  const infringementTypeOptions = [
    {
      value: "PLATFORMS_SITES",
      label: t("case_details.case_infringement_type.PLATFORMS_SITES"),
    },
    {
      value: "LINK_SITES",
      label: t("case_details.case_infringement_type.LINK_SITES"),
    },
    {
      value: "WEBHARD_P2P",
      label: t("case_details.case_infringement_type.WEBHARD_P2P"),
    },
    {
      value: "TORRENTS",
      label: t("case_details.case_infringement_type.TORRENTS"),
    },
    { value: "SNS", label: t("case_details.case_infringement_type.SNS") },
    {
      value: "COMMUNITIES",
      label: t("case_details.case_infringement_type.COMMUNITIES"),
    },
    { value: "OTHER", label: t("case_details.case_infringement_type.OTHER") },
  ];

  const countryOptions = countries.map((country) => ({
    label: `${country.name} (${country.code})`,
    value: `${country.name} (${country.code})`,
  }));

  if (isLoadingCountries || isLoadingCase) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">
          {isLoadingCountries ? t("loading-countries") : t("loading")}...
        </div>
      </div>
    );
  }

  if (mode === "edit" && caseError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-red-500 text-lg mb-4">
          {t("case-detail.load-error")}
        </div>
        <Button onClick={onClickCancel} variant="primary">
          {t("go-back")}
        </Button>
      </div>
    );
  }

  if (mode === "edit" && !caseData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-lg mb-4">{t("case-detail.not-found")}</div>
        <Button onClick={onClickCancel} variant="primary">
          {t("go-back")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((formData) => onSubmit(formData))}>
      <div className="flex gap-0">
        <div className="grid grid-cols-[120px_400px] gap-x-7.5 gap-y-6 items-baseline">
          <Label color="gray" variant="formBig" className="text-right">
            {t("case-detail.case-number")}
          </Label>
          <Input
            variant="formBig"
            register={register}
            name="caseNumber"
            error={errors.no}
            showError={false}
            disabled
            defaultValue={"부여 예정"}
          />
          <Label color="gray" variant="formBig" className="text-right">
            {t("case-detail.investigation-commencement-date")}
          </Label>

          <DateInput
            name="investigationDate"
            register={register}
            error={errors.investigationDate}
            showError={false}
          />
          <Label color="gray" variant="formBig" className="text-right">
            {t("case-detail.country-concerned")}
          </Label>
          <SelectBox
            variant="formBig"
            register={register}
            name="relatedCountries"
            options={countryOptions}
            error={errors.relatedCountries}
            showError={false}
            disabled={isLoadingCountries}
            placeholder={
              isLoadingCountries ? "Loading countries..." : "Select a country"
            }
          />
        </div>
        <div className="grid grid-cols-[278px_300px] gap-5 items-baseline">
          <Label color="gray" variant="formBig" className="text-right">
            {t("case-detail.ranking-of-investigate-responses")}
          </Label>
          <SelectBox
            variant="formBig"
            register={register}
            name="priority"
            options={priorityOptions}
            error={errors.priority}
            showError={false}
          />
          <Label color="gray" variant="formBig" className="text-right">
            {t("case-detail.content-type")}
          </Label>
          <SelectBox
            variant="formBig"
            register={register}
            name="contentType"
            options={contentTypeOptions}
            error={errors.contentType}
            showError={false}
          />
          <Label color="gray" variant="formBig" className="text-right">
            {t("case-detail.types-of-copyright-infringement")}
          </Label>
          <SelectBox
            variant="formBig"
            register={register}
            name="infringementType"
            options={infringementTypeOptions}
            error={errors.infringementType}
            showError={false}
          />
        </div>
      </div>
      <div className="grid grid-cols-[120px_1000px] gap-x-7 gap-y-6 items-baseline mt-12">
        <Label color="gray" variant="formBig" className="text-right">
          {t("case-detail.incident-name")}
        </Label>
        <Input
          variant="formBig"
          register={register}
          name="caseName"
          error={errors.caseName}
          showError={false}
        />
        <Label color="gray" variant="formBig" className="text-right">
          {t("case-detail.case-overview")}
        </Label>
        <Textarea
          name="caseOutline"
          register={register}
          error={errors.caseOutline}
          placeholder="Enter your message here..."
          variant="formBig"
          className="h-[350px]"
          showError={false}
        />
        <Label color="gray" variant="formBig" className="text-right">
          {t("case-detail.other-matters")}
        </Label>
        <Textarea
          name="etc"
          register={register}
          error={errors.etc}
          placeholder="Enter your message here..."
          variant="formBig"
          className="h-[250px]"
          showError={false}
        />
      </div>

      <div className="flex justify-center gap-5 mt-14">
        <Button
          size="bigForm"
          variant="gray2"
          onClick={onClickCancel}
          className="w-[148px]"
        >
          {t("cancel")}
        </Button>
        <Button
          size="bigForm"
          type="submit"
          className="w-[148px]"
          disabled={isPending}
        >
          {isPending
            ? mode === "edit"
              ? t("updating")
              : t("submitting")
            : mode === "edit"
            ? t("update")
            : t("next")}
        </Button>
      </div>
    </form>
  );
}

export default CaseForm;
