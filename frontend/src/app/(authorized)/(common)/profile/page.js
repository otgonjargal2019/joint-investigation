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
import { profileQuery, useProfile, useDeleteProfileImg } from "@/entities/profile";
import { toast } from "react-toastify";
import { useCheckEmail } from "@/entities/auth/auth.mutation";
import {
  profileFormSchema
} from "@/entities/auth";
import { zodResolver } from "@hookform/resolvers/zod";



function Membership() {
  const t = useTranslations();
  const router = useRouter();
  const { register, formState: { errors }, handleSubmit, watch, reset, setValue } = useForm({resolver: zodResolver(profileFormSchema)});
  const [error, setError] = useState(true);
  const [profileImg, setProfileImg] = useState(null);
  const [uploadImg, setUploadImg] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const headquarterSet = useRef(false);
  const departmentSet = useRef(false);
  const { data } = useQuery(profileQuery.getProfile());
  const profileMutation = useProfile();
  const checkEmailMutation = useCheckEmail();
  const deleteProfileImgMutation = useDeleteProfileImg();
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

  useEffect(() => {
    if(countryOptions.length)
      setValue("countryId", String(data?.userData.countryId));

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
  }, [selectedQuarterCode]);

  const onSubmit = async (values) => {
    const payload = {
      countryId: values.countryId,
      headquarterId: values.headquarterId,
      departmentId: values.departmentId,
      phone: values.phone1 && values.phone2 ? `${values.phone1}-${values.phone2}` : null,
      email: values.email && values.email2 ? `${values.email}@${values.email2}` : null,
      profileImg: uploadImg
    };

    profileMutation.mutate(payload, {
      onSuccess: (res) => {
        const {message, success} = res.data;
        console.log('RETURN DATA => ', res.data);
        if (success){
          toast.success(`${message}`, {
            autoClose: 3000,
            position: "top-center",
          });
          setSubmitted(true);
        }
      },
      onError: (err) => {
        console.log(err);
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

  const onChangePwd = (formData) => {
    console.log(formData);
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
            <form className="space-y-4 mt-12" onSubmit={handleSubmit(onSubmit)}>
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
                </div>
                <Label color="gray" className="text-right">
                  {t("form.nation")}
                </Label>
                <div className="text-left text-color-24 text-[20px] font-normal">
                  <SelectBox
                    register={register}
                    name="countryId"
                    options={countryOptions}
                    showError={false}
                    variant="form"
                    placeholder={t("placeholder.select-country")}
                    error={errors.countryId}
                  />
                </div>
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
                    error={errors.phone1}
                  />
                  <Input
                    register={register}
                    name="phone2"
                    showError={false}
                    variant="form"
                    placeholder={t("placeholder.contact-info")}
                    error={errors.phone2}
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
                  @
                  <Input
                    register={register}
                    name="email2"
                    showError={false}
                    variant="form"
                    error={errors.email2}
                  />
                  <Button
                    size="small2"
                    variant="gray3"
                    className="min-w-[135px]"
                  >
                    {t("check-redundancy")}
                  </Button>
                </div>
                <div />
                <p className="text-color-86 text-[16px] font-normal">
                  {Object.keys(errors).length > 0 && t("error-msg.enter-all-membership-info")}
                </p>
                <div />
                <Button type="submit" size="small3" variant="gray2">
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
        <form onSubmit={handleSubmit(onChangePwd)} className="space-y-4">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "120px 380px" }}
          >
            <Label color="gray" className="text-right mt-2">
              {t("form.current-password")}
            </Label>
            <Input
              register={register}
              name="currentPwd"
              showError={false}
              variant="form"
            />
            <Label color="gray" className="text-right mt-2">
              {t("form.new-password")}
            </Label>
            <div className="w-full">
              <Input
                register={register}
                name="newPwd"
                showError={false}
                variant="form"
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
              name="confirmPwd"
              showError={false}
              variant="form"
            />
          </div>
          <div className="flex justify-center">
            <Button size="medium" type="submit">
              {t("change")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Membership;
