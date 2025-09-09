"use client";

import { toast } from "react-toastify";
import { useEffect, useState, use } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import PageTitle from "@/shared/components/pageTitle/page";
import Button from "@/shared/components/button";
import ChevronLeft from "@/shared/components/icons/chevronLeft";
import CancelCircle from "@/shared/components/icons/cancelCircle";
import CheckCircle from "@/shared/components/icons/checkCircle";
import Modal from "@/shared/components/modal";
import Textarea from "@/shared/components/form/textarea";
import UserDetailTable from "@/shared/widgets/admin/accountManagement/userDetailTable";
import UserDetailTableWithPermissionChange from "@/shared/widgets/admin/accountManagement/userDetailTableWithPersimission";
import UserInfoChangeCompare from "@/shared/widgets/admin/accountManagement/userInfoChangeCompare";
import { USERSTATUS } from "@/shared/dictionary";
import { userQuery, useUpdateUserStatus } from "@/entities/user";

const UserDetailPage = ({ params }) => {
  const { id } = use(params);

  const t = useTranslations();
  const router = useRouter();

  const { data: response } = useQuery(
    userQuery.getUserById({
      userId: id,
    })
  );

  const user = response?.data;

  const {
    register,
    getValues,
    formState: { errors },
  } = useForm();
  const [modalOpen, setModalOpen] = useState(false);

  const userStatusMutation = useUpdateUserStatus();

  const onApprove = () => {
    if (user?.status === USERSTATUS.PENDING) {
      const reason = getValues("reason");

      userStatusMutation.mutate(
        {
          userId: user.userId,
          status: USERSTATUS.APPROVED,
          reason,
        },
        {
          onSuccess: (res) => {
            console.log("res:", res);
            toast.success(res.data.message, {
              autoClose: 3000,
              position: "top-center",
            });
            setModalOpen(false);
          },

          onError: (err) => {
            console.log("err:", err);
            toast.error(err.response.data.message, {
              position: "top-center",
              autoClose: 2000,
            });
          },
        }
      );
    } else if (user?.status === USERSTATUS.WAITING_TO_CHANGE) {
    }
    // setModalOpen(false);
  };

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
            {(user?.status === USERSTATUS.PENDING ||
              user?.status === USERSTATUS.WAITING_TO_CHANGE) && (
              <>
                <Button
                  variant="pink"
                  size="mediumWithShadow"
                  className="gap-3"
                  onClick={() => setModalOpen(true)}
                >
                  <CancelCircle />
                  {t("refuse")}
                </Button>
                <Button
                  variant="yellow"
                  size="mediumWithShadow"
                  className="gap-3"
                  onClick={() => setModalOpen(true)}
                >
                  <CheckCircle />
                  {t("approve")}
                </Button>
              </>
            )}
          </div>
        </div>
        {user?.status === USERSTATUS.PENDING && (
          <UserDetailTable userInfo={user} />
        )}

        {user?.status === USERSTATUS.APPROVED && (
          <UserDetailTableWithPermissionChange
            userInfo={user}
            register={register}
          />
        )}

        {user?.status === USERSTATUS.WAITING_TO_CHANGE && (
          <UserInfoChangeCompare userInfo={user} newUserInfo={user} />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="w568">
        <div className="space-y-8">
          <h3 className="text-color-8 text-[24px] font-medium text-center">
            회원가입 거절
          </h3>
          <div className="bg-color-77 rounded-20 text-color-24 text-[20px] font-normal text-center p-4 py-5">
            거절 사유를 작성해주세요
          </div>
          {/* <textarea
            className="w-full h-[200px] border border-color-32 rounded-10 placeholder-color-50 text-[20px] font-medium px-[20px] py-[10px]"
            placeholder="회원가입 거절 사유 작성"
          /> */}
          <Textarea
            name="reason"
            register={register}
            error={errors.reason}
            placeholder="Enter your message here..."
            variant="formBig"
            className="h-[200px]"
            showError={false}
          />

          <div className="flex justify-center gap-4">
            <Button
              variant="gray2"
              size="form"
              className="w-[148px]"
              onClick={() => setModalOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button size="form" className="w-[148px]" onClick={onApprove}>
              {t("check")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserDetailPage;
