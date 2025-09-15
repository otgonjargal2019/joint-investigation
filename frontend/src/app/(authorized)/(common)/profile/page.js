"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Input from "@/shared/components/form/input";
import SelectBox from "@/shared/components/form/select";
import Label from "@/shared/components/form/label";
import Button from "@/shared/components/button";
import ProfileImageUploader from "@/shared/components/profileImageUploader";
import Modal from "@/shared/components/modal";
import PageTitle from "@/shared/components/pageTitle/page";
import SuccessNotice from "@/shared/components/successNotice";
import { USERSTATUS } from "@/shared/dictionary";
import { profileQuery, useProfile, useDeleteProfileImg, useChangePassword } from "@/entities/profile";
import { toast } from "react-toastify";
import { useCheckEmail } from "@/entities/auth/auth.mutation";
import {
  profileFormSchema, changePassFormSchema
} from "@/entities/auth";
import { zodResolver } from "@hookform/resolvers/zod";

function Membership() {
  const t = useTranslations();
  const router = useRouter();
  const { register: registerProfile, formState: { errors: profileErrors }, trigger, handleSubmit: handleSubmitProfile, watch, setValue } = useForm({resolver: zodResolver(profileFormSchema)});
  const { register: registerChangepass, formState: { errors: changepassErrors }, handleSubmit: handleSubmitChangepass } = useForm({resolver: zodResolver(changePassFormSchema)});

  const [error, setError] = useState(true);
  const [profileImg, setProfileImg] = useState(null);
  const [uploadImg, setUploadImg] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countryName, setCountryName] = useState(null);
  const headquarterSet = useRef(false);
  const departmentSet = useRef(false);
  const { data } = useQuery(profileQuery.getProfile());
  const profileMutation = useProfile();
  const checkEmailMutation = useCheckEmail();
  const deleteProfileImgMutation = useDeleteProfileImg();
  const changePasswordMutation = useChangePassword();
  // Watch selected country
  //const selectedCountryCode = watch("countryId");
  const selectedQuarterCode = watch("headquarterId");

  // Filter headquarters by selected country using state/effect
  const [headquarterOptions, setHeadquarterOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  useEffect(() => {
    if(data?.userData?.status === USERSTATUS.WAITING_TO_CHANGE){
      setSubmitted(true);
      return;
    }

    if(data?.listCountry?.length) {
      const country = data.listCountry.find(c => c.id === data?.userData.countryId);
      setCountryName(country?.name || null);
    }

    if (!data?.listHeadquarter) {
      setHeadquarterOptions([]);
      return;
    }
    const filtered = data.listHeadquarter
      .filter(hq => hq.countryId == data?.userData.countryId)
      .map(hq => ({
        label: hq.name,
        value: hq.id
      }));

    setHeadquarterOptions(filtered);

    setValue("phone1", data?.userData.phone?.split("-")[0] || "");
    setValue("phone2", data?.userData.phone?.split("-").slice(1).join("-") || "");
    setValue("email", data?.userData.email?.split("@")[0] || "");
    setValue("email2", data?.userData.email?.split("@")[1] || "");
    setProfileImg(data?.userData.profileImageUrl || null);
  }, [data]);

  useEffect(() => {
    if (headquarterOptions.length > 0) {
      if(!headquarterSet.current) {
        setValue("headquarterId", String(data?.userData.headquarterId));
        headquarterSet.current = true;
      }else
        setValue("headquarterId", String(headquarterOptions[0].value));
    }
  }, [headquarterOptions]);

  useEffect(() => {
    if(departmentOptions.length) {
      if(!departmentSet.current) {
        setValue("departmentId", String(data?.userData.departmentId));
        departmentSet.current = true;
      }else
        setValue("departmentId", String(departmentOptions[0].value));
    }
  }, [departmentOptions]);

  // Filter departments by selected headquarter using state/effect
  useEffect(() => {
    if (!data?.listDepartments) {
      setDepartmentOptions([]);
      return;
    }
    const filteredDept = data.listDepartments
      .filter(dp => dp.headquarterId == selectedQuarterCode)
      .map(dp => ({
        label: dp.name,
        value: dp.id
      }));
    setDepartmentOptions(filteredDept);
  }, [selectedQuarterCode]);

  const onSubmit = async (values) => {
    const payload = {
      countryId: data?.userData?.countryId,
      headquarterId: values.headquarterId,
      departmentId: values.departmentId,
      phone: values.phone1 && values.phone2 ? `${values.phone1}-${values.phone2}` : null,
      email: values.email && values.email2 ? `${values.email}@${values.email2}` : null,
      profileImg: uploadImg
    };

    profileMutation.mutate(payload, {
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
        toast.error(`${err.response.data.message}`, {
          autoClose: 3000,
          position: "top-center",
        });
        console.log(err);
      },
    });
  };

  const handleCheckEmail = async () => {
    const isValid = await trigger(["email", "email2"]);
    if (!isValid) {
      return;
    }
    const email = watch("email");
    const email2 = watch("email2");
    const reqData = {
      email: `${email}@${email2}`
    };

    checkEmailMutation.mutate(reqData, {
      onSuccess: (res) => {
        toast.success(`${res.data.message}`, {
          autoClose: 3000,
          position: "top-center",
        });
      },
      onError: (err) => {
        toast.warning(`${err.response.data.message}`, {
          autoClose: 3000,
          position: "top-center",
        });
      },
    });
  };

  const handleDeleteProfileImg = async () => {
    deleteProfileImgMutation.mutate(null, {
      onSuccess: (res) => {
        setProfileImg(null);
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

  const onClickChangePwd = () => {
    setModalOpen(true);
  };

  const onChangePwd = async (formData) => {
    const payload = {
      currentPassword: formData.password,
      newPassword: formData.confirmPassword
    };

    changePasswordMutation.mutate(payload, {
      onSuccess: (res) => {
        const {message, success} = res.data;
        if (success){
          toast.success(`${message}`, {
            autoClose: 3000,
            position: "top-center",
          });
          setModalOpen(false);
        }
      },
      onError: (err) => {
        toast.error(`${err.response.data.message}`, {
          autoClose: 3000,
          position: "top-center",
        });
        // console.log(err);
      },
    });
  };

  return (
    <div className="w-full flex justify-center">
      <div className="text-center">
        <PageTitle title={t("profile-card.modifying-membership-information")} />
        <div className="w-full flex justify-center mt-10">
          {submitted ? (
            <SuccessNotice
              className={"mt-12"}
              message={
                <>
                  {t("info-msg.request-modify-membership-info-completed")}
                  <br />
                  {t("info-msg.after-admin-approves-changes")}
                </>
              }
              buttonText={t("go-to-main-page")}
              onBtnClick={() => router.push("/")}
            />
          ) : (
            <form className="space-y-4 mt-12" onSubmit={handleSubmitProfile(onSubmit)}>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: "120px 600px" }}
              >
                <Label color="gray" className="text-right">
                  {t("form.id")}
                </Label>
                <div className="text-left text-color-24 text-[20px] font-normal">
                  {data?.loginId}
                </div>
                <Label color="gray" className="text-right ">
                  {t("form.password")}
                </Label>
                <Button
                  size="small2"
                  variant="gray3"
                  className="max-w-[155px]"
                  onClick={onClickChangePwd}
                >
                  {t("change-password")}
                </Button>
              </div>

              <div className="w-full h-px bg-color-24 mb-4" />

              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: "120px 600px" }}
              >
                <Label color="gray" className="text-right">
                  {t("home.profile")}
                </Label>
                <div className="flex items-end gap-4">
                  <ProfileImageUploader
                    imageUrl={profileImg}
                    onUpload={(file) => {
                      setUploadImg(file);
                      const imageUrl = URL.createObjectURL(file);
                      setProfileImg(imageUrl);
                    }}
                  />
                  <Button
                    variant="white2"
                    size="extraSmall"
                    onClick={() => handleDeleteProfileImg()}
                  >
                    {t("remove")}
                  </Button>
                </div>
                <Label color="gray" className="text-right">
                  {t("form.name")}
                </Label>
                <div className="text-left text-color-24 text-[20px] font-normal">
                  {data?.userData?.nameKr}
                  <span className="mx-4">|</span>
                  {data?.userData?.nameEn}
                </div>
                <Label color="gray" className="text-right">
                  {t("form.nation")}
                </Label>
                <div className="text-left text-color-24 text-[20px] font-normal">
                  {countryName}
                </div>
                <Label color="gray" className="text-right mt-2">
                  {t("form.affiliation")}
                </Label>
                <div className="flex gap-2">
                  <SelectBox
                    register={registerProfile}
                    name="headquarterId"
                    options={headquarterOptions}
                    showError={false}
                    variant="form"
                    placeholder={t("placeholder.headquarter")}
                    error={profileErrors.headquarterId}
                  />
                  <SelectBox
                    register={registerProfile}
                    name="departmentId"
                    options={departmentOptions}
                    showError={false}
                    variant="form"
                    placeholder={t("placeholder.department")}
                    error={profileErrors.departmentId}
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
                    register={registerProfile}
                    name="phone1"
                    showError={false}
                    variant="form"
                    placeholder={t("placeholder.country-code")}
                    error={profileErrors.phone1}
                  />
                  <Input
                    register={registerProfile}
                    name="phone2"
                    showError={false}
                    variant="form"
                    placeholder={t("placeholder.contact-info")}
                    error={profileErrors.phone2}
                  />
                </div>
                <Label color="gray" className="text-right mt-2">
                  {t("form.email")}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    register={registerProfile}
                    name="email"
                    showError={false}
                    variant="form"
                    error={profileErrors.email}
                  />
                  @
                  <Input
                    register={registerProfile}
                    name="email2"
                    showError={false}
                    variant="form"
                    error={profileErrors.email2}
                  />
                  <Button
                    size="small2"
                    variant={!profileErrors.email && !profileErrors.email2 ? "neon" : "gray3"}
                    className="min-w-[135px]"
                    onClick={handleCheckEmail}
                  >
                    {t("check-redundancy")}
                  </Button>
                </div>
                <div />
                <p className="text-color-86 text-[16px] font-normal">
                  {Object.keys(profileErrors).length > 0 && t("error-msg.enter-all-membership-info")}
                </p>
                <div />
                <Button
                  type="submit"
                  size="small3"
                  variant={Object.keys(profileErrors).length == 0 ? "neon" : "gray2"} 
                  disabled={Object.keys(profileErrors).length > 0}>
                    {t("request-modification-member-info")}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="xl">
        <div className="text-center mb-4">
          <h2 className="text-[24px] font-bold text-color-24">
            {t("change-password")}
          </h2>
        </div>
        <form onSubmit={handleSubmitChangepass(onChangePwd)} className="space-y-4">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "120px 380px" }}
          >
            <Label color="gray" className="text-right mt-2">
              {t("form.current-password")}
            </Label>
            <Input
                register={registerChangepass}
                name="password"
                type="password"
                showError={false}
                variant="form"
                placeholder={t("placeholder.password")}
                error={changepassErrors.password}
              />
            <Label color="gray" className="text-right mt-2">
              {t("form.new-password")}
            </Label>
            <div className="w-full">
              <Input
                register={registerChangepass}
                name="newPassword"
                type="password"
                showError={false}
                variant="form"
                placeholder={t("placeholder.password")}
                error={changepassErrors.newPassword}
              />
              <p className="text-color-15 text-[16px] font-normal text-left mt-1">
                {t("info-msg.password")}
              </p>
            </div>
            <Label color="gray" className="text-right mt-2">
              {t("form.password-confirm")}
            </Label>
            <Input
              register={registerChangepass}
              name="confirmPassword"
              type="password"
              showError={false}
              variant="form"
              placeholder={t("placeholder.password")}
              error={changepassErrors.confirmPassword}
            />
          </div>
          <div className="flex justify-center">
            <Button type="submit" size="medium" >
              {t("change")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Membership;
