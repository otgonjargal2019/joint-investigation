"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";

import Button from "@/shared/components/button";
import Label from "@/shared/components/form/label";
import { useUpdateCase, useCaseById } from "@/entities/case";
import { useCountries } from "@/entities/organizationalData";
import Input from "@/shared/components/form/input";
import SelectBox from "@/shared/components/form/select";
import Textarea from "@/shared/components/form/textarea";
import DatePickerInput from "@/shared/components/form/datepicker";
import PageTitle from "@/shared/components/pageTitle/page";

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
  { label: "Other", value: "Other" }
];

const infringementTypeOptions = [
  { label: "Copyright Violation", value: "Copyright Violation" },
  { label: "Trademark Infringement", value: "Trademark Infringement" },
  { label: "Patent Infringement", value: "Patent Infringement" },
  { label: "Trade Secret Theft", value: "Trade Secret Theft" },
  { label: "Design Right Violation", value: "Design Right Violation" },
  { label: "Unauthorized Distribution", value: "Unauthorized Distribution" },
  { label: "Counterfeit Goods", value: "Counterfeit Goods" },
  { label: "Other IP Violation", value: "Other IP Violation" }
];

function EditCase() {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const t = useTranslations();

  const params = useParams();
  const caseId = params.id;

  const router = useRouter();
  const updateCase = useUpdateCase();

  // Fetch existing case data
  const {
    data: caseData,
    isLoading: isLoadingCase,
    error: caseError
  } = useCaseById({ id: caseId });

  // Fetch countries for the select dropdown
  const { data: countries = [], isLoading: isLoadingCountries } = useCountries();

  // Transform countries data for SelectBox options
  const countryOptions = countries.map(country => ({
    label: `${country.name} (${country.code})`,
    value: `${country.name} (${country.code})`
  }));

  // Populate form with existing case data
  useEffect(() => {
    if (caseData) {
      reset({
        caseName: caseData.caseName || '',
        caseOutline: caseData.caseOutline || '',
        contentType: caseData.contentType || '',
        infringementType: caseData.infringementType || '',
        relatedCountries: caseData.relatedCountries || '',
        priority: caseData.priority || '',
        investigationDate: new Date(caseData.investigationDate),
        etc: caseData.etc || '',
      });
    }
  }, [caseData, reset]);

  const onSubmit = async (data) => {
    try {
      const response = await updateCase.mutateAsync({
        caseId: caseId, // Include the case ID for update
        caseName: data.caseName,
        caseOutline: data.caseOutline,
        contentType: data.contentType,
        infringementType: data.infringementType,
        relatedCountries: data.relatedCountries,
        priority: Number(data.priority),
        investigationDate: data.investigationDate,
        etc: data.etc,
      });

      toast.success(t('case-detail.update-success'), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });

      router.push(`/manager/cases/${caseId}`);
    } catch (error) {
      toast.error(t('case-detail.update-error'), {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      console.error('Failed to update case:', error);
    }
  };

  const onGoBack = () => {
    router.push(`/manager/cases/${caseId}`);
  };

  // Loading state
  if (isLoadingCase) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">{t('loading')}...</div>
      </div>
    );
  }

  // Error state
  if (caseError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-red-500 text-lg mb-4">{t('case-detail.load-error')}</div>
        <Button onClick={onGoBack} variant="primary">
          {t('go-back')}
        </Button>
      </div>
    );
  }

  // Case not found
  if (!caseData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-lg mb-4">{t('case-detail.not-found')}</div>
        <Button onClick={onGoBack} variant="primary">
          {t('go-back')}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageTitle title={t("edit-incident")} />
      <div className="flex flex-col items-center">
        <div className="flex justify-center">
            <form onSubmit={handleSubmit(onSubmit)}>
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
                    defaultValue={caseData?.number ? `#${caseData.number}` : "No number assigned"}
                  />
                  <Label color="gray" variant="formBig" className="text-right">
                    {t("case-detail.investigation-commencement-date")}
                  </Label>
                  <DatePickerInput
                    variant="formBig"
                    name="investigationDate"
                    control={control}
                    error={errors.investigationDate}
                    placeholder="날짜를 선택하세요"
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
                    placeholder={isLoadingCountries ? "Loading countries..." : "Select a country"}
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
                  onClick={onGoBack}
                  className="w-[148px]"
                >
                  {t("cancel")}
                </Button>
                <Button
                  size="bigForm"
                  type="submit"
                  className="w-[148px]"
                  disabled={updateCase.isPending}
                >
                  {updateCase.isPending ? t("updating") : t("update")}
                </Button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}

export default EditCase;
