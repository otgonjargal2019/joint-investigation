"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import FormField from "@/shared/components/form/formField";
import Input from "@/shared/components/form/input";
import SelectBox from "@/shared/components/form/select";
import Label from "@/shared/components/form/label";
import Button from "@/shared/components/button";
import ProfileImageUploader from "@/shared/components/profileImageUploader";
import Modal from "@/shared/components/modal";
import PageTitle from "@/shared/components/pageTitle/page";
import SuccessNotice from "@/shared/components/successNotice";

const options = [
  { label: "test", value: "test" },
  { label: "test2", value: "test2" },
  { label: "test3", value: "test3" },
  { label: "test4", value: "test4" },
];

function Membership() {
  const { register, handleSubmit, reset } = useForm();

  const [error, setError] = useState(true);
  const [profileImg, setProfileImg] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const t = useTranslations();
  const router = useRouter();

  const onSubmit = (data) => {
    console.log(data);
    setSubmitted(true);
  };

  const obj = {
    id: "crazy1000",
    name: "test 1",
    nation: "test 2",
  };

  useEffect(() => {
    reset({
      affiliation1: options[0].value,
      affiliation2: options[1].value,
      group1: options[2].value,
      group2: options[3].value,
    });
  }, []);

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
                  {obj?.id}
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
                      const imageUrl = URL.createObjectURL(file);
                      setProfileImg(imageUrl);
                    }}
                  />
                  <Button
                    variant="white2"
                    size="extraSmall"
                    onClick={() => setProfileImg(null)}
                  >
                    {t("remove")}
                  </Button>
                </div>
                <Label color="gray" className="text-right">
                  {t("form.name")}
                </Label>
                <div className="text-left text-color-24 text-[20px] font-normal">
                  {obj?.name}
                </div>
                <Label color="gray" className="text-right">
                  {t("form.nation")}
                </Label>
                <div className="text-left text-color-24 text-[20px] font-normal">
                  {obj?.nation}
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
                  {error && t("error-msg.enter-all-membership-info")}
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
