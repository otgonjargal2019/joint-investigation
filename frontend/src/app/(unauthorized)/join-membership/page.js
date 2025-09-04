"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
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
import { signupQuery } from "@/entities/auth/auth.query";


function JoinMembershipPage() {

  const { register, formState: { errors }, trigger, handleSubmit, watch, setError, setValue } = useForm({resolver: zodResolver(registerFormSchema)});
  const [submitted, setSubmitted] = useState(false);
  const t = useTranslations();
  const router = useRouter();
  const signupMutation = useSignUp();
  const checkLoginIdMutation = useCheckLoginId();
  const checkEmailMutation = useCheckEmail();
  const {data} = useQuery(signupQuery.getSignup());
  
  // Watch selected country
  const selectedCountryCode = watch("countryId");
  const selectedQuarterCode = watch("headquarterId");
  
  // Filter headquarters by selected country using state/effect
  const [headquarterOptions, setHeadquarterOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  // Convert API country data to SelectBox options
  const countryOptions = data?.listCountry?.map(country => ({
    label: country.name,
    value: country.id
  })) || [];
  
  //Filter headquarters by selected country using state/effect
  useEffect(() => {
    if (!data?.listHeadquarter) {
      setHeadquarterOptions([]);
      return;
    }
    const filtered = data.listHeadquarter
      .filter(hq => hq.country?.id == selectedCountryCode)
      .map(hq => ({
        label: hq.name,
        value: hq.id
      }));
    setHeadquarterOptions(filtered);
    
    if(filtered.length) {
      setValue("headquarterId", String(filtered[0].value));
    }
  }, [selectedCountryCode]);

  // Filter departments by selected headquarter using state/effect
  useEffect(() => {
    if (!data?.listDepartments) {
      setDepartmentOptions([]);
      return;
    }

    const filteredDept = data.listDepartments
      .filter(dp => dp.headquarter?.id == selectedQuarterCode)
      .map(dp => ({
        label: dp.name,
        value: dp.id
      }));
    setDepartmentOptions(filteredDept);
    if(filteredDept.length) {
      setValue("departmentId", String(filteredDept[0].value));
    }
  }, [selectedQuarterCode]);

  useEffect(() => {
    if (countryOptions.length  && !watch("countryId")) {
      setValue("countryId", String(countryOptions[0].value));
    }
  }, [data]);

  const onSubmit = async (values) => {
    const fullEmail = `${values.email}@${values.email2}`;
    const fullPhone = `${values.phone1}-${values.phone2}`;

    const payload = {
      ...values,
      email: fullEmail,
      phone: fullPhone,
      country: ''
    };

    delete payload.email2;
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
        else {
          toast.warning(`${message}`, {
          autoClose: 3000,
          position: "top-center",
        });
        }
      },
      onError: (err) => {
        const {message} = err.response.data;
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

  const handleCheckEmail = async () => {
    const isValid = await trigger(["email"]);

    if (!isValid) {
      return;
    }
    const reqData = {
      email: watch("email")
    };
    
    checkEmailMutation.mutate(reqData, {
      onSuccess: (res) => {
        toast.success(`${res.data.message}`, {
          autoClose: 3000,
          position: "top-center",
        });
      },
      onError: (err) => {
        setError("email", {
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
                  showError={false}
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
                  showError={false}
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
                name="countryId"
                options={countryOptions}
                showError={false}
                variant="form"
                placeholder={t("placeholder.select-country")}
                error={errors.countryId}
              />
              <Label color="gray" className="text-right mt-2">
                {t("form.affiliation")}
              </Label>
              <div className="flex gap-2">
                <SelectBox
                  register={register}
                  name="headquarterId"
                  options={headquarterOptions}
                  showError={false}
                  variant="form"
                  placeholder={t("placeholder.headquarter")}
                  error={errors.headquarterId}
                />
                <SelectBox
                  register={register}
                  name="departmentId"
                  options={departmentOptions}
                  showError={false}
                  variant="form"
                  placeholder={t("placeholder.department")}
                  error={errors.departmentId}
                />
              </div>
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
                {t("form.email")}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  register={register}
                  name="email"
                  showError={false}
                  variant="form"
                  error={errors.email}
                />
                <span className="text-gray-700">@</span>
                <Input
                  register={register}
                  name="email2"
                  showError={false}
                  variant="form"
                  error={errors.email}
                />
                <Button size="small2" variant="gray3" className="min-w-[135px]" onClick={handleCheckEmail}>
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
