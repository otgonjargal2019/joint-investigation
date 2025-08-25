"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import PageTitle from "@/shared/components/pageTitle/page";
import Button from "@/shared/components/button";
import ChevronLeft from "@/shared/components/icons/chevronLeft";
import CancelCircle from "@/shared/components/icons/cancelCircle";
import CheckCircle from "@/shared/components/icons/checkCircle";
import Modal from "@/shared/components/modal";
import UserDetailTable from "@/shared/widgets/admin/accountManagement/userDetailTable";
import UserDetailTableWithPermissionChange from "@/shared/widgets/admin/accountManagement/userDetailTableWithPersimission";
import UserInfoChangeCompare from "@/shared/widgets/admin/accountManagement/userInfoChangeCompare";

const stateOptions = ["WAITINGTOJOIN", "NORMAL", "WAITINGTOCHANGE", "REFUSED"];
const userObj = {
  id: "crazy1000",
  name: "김서진 / Seo jin Kim",
  nation: "대한민국",
  unit: "저작권 범죄 수사대",
  team: "디지털 저작권 침해 수사팀",
  contactInfo: "+82 1012345678",
  email: "nncye0585@police.go.kr",
  accountPermissions: "수사관",
};

const userObjNew = {
  id: "crazy1000",
  name: "김서진",
  nation: "대한민국",
  unit: "저작권 범죄 수사대",
  team: "온라인 플랫폼 모니터링반",
  contactInfo: "+82 1012345678",
  email: "Alicya@police.go.kr",
  accountPermissions: "수사관",
};

const UserDetailPage = () => {
  const t = useTranslations();
  const [state, setState] = useState(stateOptions[2]);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [denyModalOpen, setDenyModalOpen] = useState(false);

  const router = useRouter();
  const { register, setValue } = useForm();

  useEffect(() => {
    if (state === stateOptions[1]) {
      setValue("accountPermissions", userObj.accountPermissions);
    }
  }, [state, setValue, userObj]);

  return (
    <div className="flex justify-center">
      <div className="space-y-5">
        <PageTitle title={t("header.member-information")} />
        <div className="flex justify-between">
          <Button
            variant="white"
            size="mediumWithShadow"
            className="gap-3"
            onClick={() => router.push("/admin/account-management")}
          >
            <ChevronLeft />
            {t("go-back")}
          </Button>
          <div className="flex gap-2">
            {(state === stateOptions[0] || state === stateOptions[2]) && (
              <>
                <Button
                  variant="pink"
                  size="mediumWithShadow"
                  className="gap-3"
                  onClick={() => setDenyModalOpen(true)}
                >
                  <CancelCircle />
                  {t("refuse")}
                </Button>
                <Button
                  variant="yellow"
                  size="mediumWithShadow"
                  className="gap-3"
                  onClick={() => setApproveModalOpen(true)}
                >
                  <CheckCircle />
                  {t("approve")}
                </Button>
              </>
            )}
          </div>
        </div>
        {state === stateOptions[0] && <UserDetailTable userInfo={userObj} />}
        {state === stateOptions[1] && (
          <UserDetailTableWithPermissionChange
            userInfo={userObj}
            register={register}
          />
        )}
        {state === stateOptions[2] && (
          <UserInfoChangeCompare userInfo={userObj} newUserInfo={userObjNew} />
        )}
      </div>
      <Modal
        isOpen={denyModalOpen}
        onClose={() => setDenyModalOpen(false)}
        size="w568"
      >
        <div className="space-y-8">
          <h3 className="text-color-8 text-[24px] font-medium text-center">
            회원가입 거절
          </h3>
          <div className="bg-color-77 rounded-20 text-color-24 text-[20px] font-normal text-center p-4 py-5">
            거절 사유를 작성해주세요
          </div>
          <textarea
            className="w-full h-[200px] border border-color-32 rounded-10 placeholder-color-50 text-[20px] font-medium px-[20px] py-[10px]"
            placeholder="회원가입 거절 사유 작성"
          />
          <div className="flex justify-center gap-4">
            <Button
              variant="gray2"
              size="form"
              className="w-[148px]"
              onClick={() => setDenyModalOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button size="form" className="w-[148px]">
              {t("check")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserDetailPage;
