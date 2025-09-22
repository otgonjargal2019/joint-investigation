"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import FormField from "@/shared/components/form/formField";
import Label from "@/shared/components/form/label";
import Input from "@/shared/components/form/input";
import Checkbox from "@/shared/components/form/checkbox";
import Button from "@/shared/components/button";
import Modal from "@/shared/components/modal";
import LogoBig from "@/shared/components/icons/logoBig";
import { useSignIn } from "@/entities/auth/auth.mutation";
import { loginFormSchema } from "@/entities/auth";

function LoginPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const {
    register,
    formState: { errors },
    watch,
    setValue,
    handleSubmit,
    setError,
  } = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { stayLoggedIn: true },
  });
  //const [error, setError] = useState(true);

  const t = useTranslations();
  const router = useRouter();
  const loginMutation = useSignIn();

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      loginId: values.loginId?.trim(),
    };
    loginMutation.mutate(payload, {
      onSuccess: (res) => {
        const { success } = res.data;
        if (success) {
          toast.success(t("info-msg.login-successful"), {
            autoClose: 9000,
            position: "top-center",
          });

          window.location.href = "/";
        }
      },
      onError: (err) => {
        if (err.response?.data?.message == "ADMIN_CONFIRMATION_NEEDED") {
          setModalOpen(true);
        } else {
          setError("root", {
            type: "manual",
            message: err.response.data.message,
          });
        }
      },
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-[596px] h-[637px] bg-color-4 border-color-16 rounded-16 pb-[80px] pt-[72.8px] px-[64px] shadow-lg">
        <div className="flex justify-center items-center gap-2 mb-10">
          <LogoBig />
          <h2 className="text-white text-[30.345px] font-medium">
            {t("header.title")}
          </h2>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <FormField>
            <Label color="white" variant="big" minWidth="15">
              ID
            </Label>
            <Input
              register={register}
              name="loginId"
              variant="auth"
              placeholder={t("placeholder.id")}
              //showError={false}
              error={errors.loginId}
            />
          </FormField>
          <FormField>
            <Label color="white" variant="big" minWidth="15">
              P/W
            </Label>
            <Input
              register={register}
              type="password"
              name="password"
              variant="auth"
              placeholder={t("placeholder.password")}
              //showError={false}
              error={errors.password}
            />
          </FormField>
          <FormField>
            <Label minWidth="15" />
            <Checkbox
              name="stayLoggedIn"
              label={t("stay-logged-in")}
              register={register}
              watch={watch}
              setValue={setValue}
              color="white"
              variant="big"
              showError={false}
            />
          </FormField>

          <p className="h-[28px] ml-[66px] text-color-100 text-[19.2px] font-normal leading-[19.2px] mb-4">
            {errors.root && t("error-msg.id-pass-not-match")}
          </p>

          <div className="flex flex-col justify-center gap-4 mt-4">
            <Button type="submit" size="big">
              {t("login")}
            </Button>
            <Button
              size="big"
              variant="gray2"
              onClick={() => router.push("/join-membership")}
            >
              {t("join-membership")}
            </Button>
          </div>
        </form>
      </div>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        showClose={false}
      >
        <h2 className="text-center text-[20px] text-color-24 mb-6">
          {t("auth.admin-approve-msg")}
        </h2>
        <div className="flex justify-center ">
          <Button
            size="small"
            className="min-w-[150px]"
            onClick={() => setModalOpen(false)}
          >
            {t("check")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default LoginPage;
