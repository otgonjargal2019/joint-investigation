"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import PageTitle from "@/shared/components/pageTitle/page";
import Input from "@/shared/components/form/input";
import SelectBox from "@/shared/components/form/select";
import Label from "@/shared/components/form/label";
import Button from "@/shared/components/button";
import SuccessNotice from "@/shared/components/successNotice";

const options = [
  { label: "test", value: "test" },
  { label: "test2", value: "test2" },
  { label: "test3", value: "test3" },
];

function JoinMembershipPage() {
  const { register, handleSubmit, watch } = useForm();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(true);
  const t = useTranslations();
  const router = useRouter();

  const onSubmit = (data) => {
    console.log(data);
    setSubmitted(true);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="text-center">
        <PageTitle title={t("join-membership")} />
        {submitted ? (
          <SuccessNotice
            className={"mt-12"}
            message={
              <>
                {t("info-msg.membership-registered")}
                <br />
                {t("info-msg.login-after-admin-approves")}
              </>
            }
            buttonText={t("go-to-main-page")}
            onBtnClick={() => router.push("/")}
          />
        ) : (
          <form className="space-y-4 mt-12" onSubmit={handleSubmit(onSubmit)}>
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "1fr 600px" }}
            >
              <Label color="gray" className="text-right mt-2">
                {t("form.id")}
              </Label>
              <div className="flex gap-2">
                <Input
                  register={register}
                  name="id"
                  showError={false}
                  variant="form"
                  placeholder={t("placeholder.id")}
                />
                <Button
                  size="small2"
                  variant="gray3"
                  type="submit"
                  className="min-w-[135px]"
                >
                  {t("check-redundancy")}
                </Button>
              </div>
              <Label color="gray" className="text-right mt-2">
                {t("form.password")}
              </Label>
              <div className="w-full">
                <Input
                  register={register}
                  name="password"
                  type="password"
                  showError={false}
                  variant="form"
                  placeholder={t("placeholder.password")}
                />
                <p className="text-color-15 text-[16px] font-normal text-left mt-1">
                  {t("info-msg.password")}
                </p>
              </div>
              <Label color="gray" className="text-right mt-2">
                {t("form.password-confirm")}
              </Label>
              <Input
                register={register}
                name="passwordConfirm"
                type="password"
                showError={false}
                variant="form"
                placeholder={t("placeholder.password-confirm")}
              />
            </div>

            <div className="w-full h-px bg-color-24 mb-4" />

            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "120px 600px" }}
            >
              <Label color="gray" className="text-right mt-2">
                {t("form.kor-name")}
              </Label>
              <Input
                register={register}
                name="korName"
                showError={false}
                variant="form"
                placeholder={t("placeholder.kor-name")}
              />
              <Label color="gray" className="text-right mt-2">
                {t("form.eng-name")}
              </Label>
              <Input
                register={register}
                name="engName"
                showError={false}
                variant="form"
                placeholder={t("placeholder.eng-name")}
              />
              <Label color="gray" className="text-right mt-2">
                {t("form.nation")}
              </Label>
              <SelectBox
                register={register}
                name="nation"
                options={options}
                showError={false}
                variant="form"
                placeholder={t("placeholder.select-country")}
              />
              <Label color="gray" className="text-right mt-2">
                {t("form.contact-info")}
              </Label>
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: "120px 1fr" }}
              >
                <Input
                  register={register}
                  name="countryCode"
                  showError={false}
                  variant="form"
                  placeholder={t("placeholder.country-code")}
                />
                <Input
                  register={register}
                  name="contactInfo"
                  showError={false}
                  variant="form"
                  placeholder={t("placeholder.contact-info")}
                />
              </div>
              <Label color="gray" className="text-right mt-2">
                {t("form.affiliation")}
              </Label>
              <div className="flex gap-2">
                <Input
                  register={register}
                  name="headquarter"
                  showError={false}
                  variant="form"
                  placeholder={t("placeholder.headquarter")}
                />
                <Input
                  register={register}
                  name="department"
                  showError={false}
                  variant="form"
                  placeholder={t("placeholder.department")}
                />
              </div>
              <Label color="gray" className="text-right mt-2">
                {t("form.email")}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  register={register}
                  name="email"
                  showError={false}
                  variant="form"
                />
                @
                <Input
                  register={register}
                  name="email2"
                  showError={false}
                  variant="form"
                />
                <Button size="small2" variant="gray3" className="min-w-[135px]">
                  {t("check-redundancy")}
                </Button>
              </div>
              <div />
              <p className="text-color-86 text-[16px] font-normal">
                {error && t("error-msg.enter-all-membership-info")}
              </p>
              <div />
              <Button
                type="submit"
                size="small3"
                variant="gray2"
                className="min-w-[600px]"
              >
                {t("join-membership")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default JoinMembershipPage;
