"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import Button from "@/shared/components/button";
import Label from "@/shared/components/form/label";
import Input from "@/shared/components/form/input";
import SelectBox from "@/shared/components/form/select";
import Textarea from "@/shared/components/form/textarea";
import ChevronTabs from "@/shared/components/chevronTab";
import DatePickerInput from "@/shared/components/form/datepicker";
import InvestigatorAssign from "@/shared/widgets/manager/investigatorAssign";
import PageTitle from "@/shared/components/pageTitle/page";

const options = [
  { label: "test 1", value: 1 },
  { label: "test 2", value: 2 },
  { label: "test 3", value: 3 },
];

function CreateNewIncident() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const t = useTranslations();

  const tabs = [t("enter-incident-info"), t("assign-investigator")];
  const [activeTab, setActiveTab] = useState(0);

  const onSubmit = (data) => {
    console.log(data);

    // hadgalah process yavagdana

    setTimeout(() => {
      setActiveTab(1);
    }, 1500);
  };

  const router = useRouter();

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
                  />
                  <Label color="gray" variant="formBig" className="text-right">
                    {t("case-detail.investigation-commencement-date")}
                  </Label>
                  <DatePickerInput
                    variant="formBig"
                    name="dateOfOccurence"
                    control={control}
                    error={errors.dateOfOccurence}
                    placeholder="날짜를 선택하세요"
                    showError={false}
                  />
                  <Label color="gray" variant="formBig" className="text-right">
                    {t("case-detail.country-concerned")}
                  </Label>
                  <Input
                    variant="formBig"
                    register={register}
                    name="countryOfOrigin"
                    error={errors.countryOfOrigin}
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
                    name="rankingOfResponses"
                    options={options}
                    error={errors.rankingOfResponses}
                    showError={false}
                  />
                  <Label color="gray" variant="formBig" className="text-right">
                    {t("case-detail.content-type")}
                  </Label>
                  <SelectBox
                    variant="formBig"
                    register={register}
                    name="contentType"
                    options={options}
                    error={errors.contentType}
                    showError={false}
                  />
                  <Label color="gray" variant="formBig" className="text-right">
                    {t("case-detail.types-of-copyright-infringement")}
                  </Label>
                  <SelectBox
                    variant="formBig"
                    register={register}
                    name="typesOfInfringement"
                    options={options}
                    error={errors.typesOfInfringement}
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
                  name="nameOfIncident"
                  error={errors.nameOfIncident}
                  showError={false}
                />
                <Label color="gray" variant="formBig" className="text-right">
                  {t("case-detail.case-overview")}
                </Label>
                <Textarea
                  name="overview"
                  register={register}
                  error={errors.overview}
                  placeholder="Enter your message here..."
                  variant="formBig"
                  className="h-[350px]"
                  showError={false}
                />
                <Label color="gray" variant="formBig" className="text-right">
                  {t("case-detail.other-matters")}
                </Label>
                <Textarea
                  name="other"
                  register={register}
                  error={errors.other}
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
                <Button size="bigForm" type="submit" className="w-[148px]">
                  {t("next")}
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

export default CreateNewIncident;
