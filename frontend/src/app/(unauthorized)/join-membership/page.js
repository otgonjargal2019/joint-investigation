"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import PageTitle from "@/shared/components/pageTitle/page";
import Input from "@/shared/components/form/input";
import SelectBox from "@/shared/components/form/select";
import Label from "@/shared/components/form/label";
import Button from "@/shared/components/button";
import SuccessNotice from "@/shared/components/successNotice";
import {
  registerFormSchema
} from "@/entities/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp, useCheckLoginId, useCheckEmail } from "@/entities/auth/auth.mutation";


const options = [
  { label: "Korea", value: "KOR" },
  { label: "Mongolia", value: "MGL" },
  { label: "Japan", value: "JPN" },
];

function JoinMembershipPage() {
  const { register, formState: { errors }, trigger, handleSubmit, watch, setError } = useForm({resolver: zodResolver(registerFormSchema)});
  const [submitted, setSubmitted] = useState(false);
  //const [error, setError] = useState(true);
  const t = useTranslations();
  const router = useRouter();
  const signupMutation = useSignUp();
  const checkLoginIdMutation = useCheckLoginId();

  const onSubmit = async (values) => {
    
    const fullEmail = `${values.email}@${values.email2}`;
    const fullDepartment = `${values.department1} - ${values.department2}`;
    const fullPhone = `${values.phone1}-${values.phone2}`;

    const payload = {
      ...values,
      email: fullEmail,
      phone: fullPhone,
      department: fullDepartment
    };

    delete payload.email2;
    delete payload.department1;
    delete payload.department2;
    delete payload.phone1;
    delete payload.phone2;
    
    signupMutation.mutate(payload, {
      onSuccess: (res) => {
        
        const {message, success} = res.data;
        if (success){
          toast.success(`${message}`, {
            autoClose: 3000,
            position: "top-center",
          });
          setSubmitted(true);
        }
      },
      onError: (err) => {
        toast.warning(`${message}`, {
          autoClose: 3000,
          position: "top-center",
        });
      },
    });
  };

  const handleCheckLoginId = async () => {
    const isValid = await trigger(["loginId"]);

    if (!isValid) {
      return;
    }
    const reqData = {
      loginId: watch("loginId")
    };

    checkLoginIdMutation.mutate(reqData, {
      onSuccess: (res) => {
        toast.success(`${res.data.message} Now set the password please.`, {
          autoClose: 3000,
          position: "top-center",
        });
      },
      onError: (err) => {
        setError("loginId", {
          type: "manual",
          message: err.response.data.message,
        });
      },
    });
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
                  name="loginId"
                  //showError={false}
                  variant="form"
                  placeholder={t("placeholder.id")}
                  error={errors.loginId}
                />
                <Button
                  size="small2"
                  variant="gray3"
                  type="button"
                  className="min-w-[135px]"
                  onClick={handleCheckLoginId}
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
                  //showError={false}
                  variant="form"
                  placeholder={t("placeholder.password")}
                  error={errors.password}
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
                error={errors.passwordConfirm}
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
                name="nameKr"
                showError={false}
                variant="form"
                placeholder={t("placeholder.kor-name")}
                error={errors.nameKr}
              />
              <Label color="gray" className="text-right mt-2">
                {t("form.eng-name")}
              </Label>
              <Input
                register={register}
                name="nameEn"
                showError={false}
                variant="form"
                placeholder={t("placeholder.eng-name")}
              />
              <Label color="gray" className="text-right mt-2">
                {t("form.nation")}
              </Label>
              <SelectBox
                register={register}
                name="country"
                options={options}
                //showError={false}
                variant="form"
                placeholder={t("placeholder.select-country")}
                error={errors.country}
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
                  name="phone1"
                  showError={false}
                  variant="form"
                  placeholder={t("placeholder.country-code")}
                />
                <Input
                  register={register}
                  name="phone2"
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
                  name="department1"
                  showError={false}
                  variant="form"
                  placeholder={t("placeholder.headquarter")}
                />
                <Input
                  register={register}
                  name="department2"
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
                  //showError={false}
                  variant="form"
                  error={errors.email}
                />
                @
                <Input
                  register={register}
                  name="email2"
                  //showError={false}
                  variant="form"
                  error={errors.email}
                />
                <Button size="small2" variant="gray3" className="min-w-[135px]">
                  {t("check-redundancy")}
                </Button>
              </div>
              <div />
              <p className="text-color-86 text-[16px] font-normal">
                {Object.keys(errors).length > 0 && t("error-msg.enter-all-membership-info")}
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
