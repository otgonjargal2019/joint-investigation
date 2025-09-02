"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import Button from "@/shared/components/button";
import Label from "@/shared/components/form/label";
import { useCreateCase } from "@/entities/case";
import Input from "@/shared/components/form/input";
import SelectBox from "@/shared/components/form/select";
import Textarea from "@/shared/components/form/textarea";
import ChevronTabs from "@/shared/components/chevronTab";
import DatePickerInput from "@/shared/components/form/datepicker";
import InvestigatorAssign from "@/shared/widgets/manager/investigatorAssign";
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

function CreateNewCase() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const t = useTranslations();

  const tabs = [t("enter-incident-info"), t("assign-investigator")];
  const [activeTab, setActiveTab] = useState(0);

  const router = useRouter();
  const createCase = useCreateCase();

  const onSubmit = async (data) => {
    try {
      await createCase.mutateAsync({
        caseName: data.caseName,
        caseOutline: data.caseOutline,
        contentType: data.contentType,
        infringementType: data.infringementType,
        relatedCountries: data.relatedCountries,
        priority: Number(data.priority),
        investigationDate: data.investigationDate,
        etc: data.etc
      });

      toast.success(t('case-detail.create-success'), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      setActiveTab(1);
    } catch (error) {
      toast.error(t('case-detail.create-error'), {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      console.error('Failed to create case:', error);
    }
  };

  const onGoBack = () => {
    router.push("/manager/incident");
  };

  return (
    <div>
      <PageTitle title={t("create-new-incident")} />
      <div className="flex flex-col items-center">
        <div className="mt-2 mb-8">
          <ChevronTabs
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        <div className="flex justify-center">
          {activeTab === 0 && (
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
                    defaultValue="부여 예정"
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
                  <Input
                    variant="formBig"
                    register={register}
                    name="relatedCountries"
                    error={errors.relatedCountries}
                    showError={false}
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
                  disabled={createCase.isPending}
                >
                  {createCase.isPending ? t("submitting") : t("next")}
                </Button>
              </div>
            </form>
          )}

          {activeTab === 1 && (
            <InvestigatorAssign setActiveTab={setActiveTab} />
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateNewCase;
