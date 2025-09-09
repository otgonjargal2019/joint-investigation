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
import UserDetailWithRoleChange from "@/shared/widgets/admin/accountManagement/userDetailWithRoleChange";
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
    setValue,
    formState: { errors },
  } = useForm();

  const [modalOpen, setModalOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState(null);

  const userStatusMutation = useUpdateUserStatus();

  useEffect(() => {
    if (setValue && user && user.status === USERSTATUS.APPROVED) {
      setValue("role", user.role);
    }
  }, [user, setValue]);

  const openModal = (status) => {
    setNextStatus(status);
    setValue("reason", "");
    setModalOpen(true);
  };

  const onConfirmStatusChange = () => {
    if (!user || !nextStatus) return;

    const reason = getValues("reason");

    console.log(nextStatus, reason);

    userStatusMutation.mutate(
      { userId: user.userId, status: nextStatus, reason },
      {
        onSuccess: (res) => {
          toast.success(res.data.message, {
            autoClose: 3000,
            position: "top-center",
          });
          setModalOpen(false);
          router.push("/admin/account-management");
        },
        onError: (err) => {
          toast.error(err.response.data.message, {
            position: "top-center",
            autoClose: 2000,
          });
        },
      }
    );
  };

  const onChangeRole = () => {
    const role = getValues("role");
    console.log("role:", role);
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
                  onClick={() => openModal(USERSTATUS.REJECTED)}
                >
                  <CancelCircle />
                  {t("refuse")}
                </Button>
                <Button
                  variant="yellow"
                  size="mediumWithShadow"
                  className="gap-3"
                  onClick={() => openModal(USERSTATUS.APPROVED)}
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
          <UserDetailWithRoleChange
            userInfo={user}
            register={register}
            onSubmit={onChangeRole}
          />
        )}

        {user?.status === USERSTATUS.WAITING_TO_CHANGE && (
          <UserInfoChangeCompare userInfo={user} newUserInfo={user} />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="w568">
        <div className="space-y-8">
          <h3 className="text-color-8 text-[24px] font-medium text-center">
            {nextStatus === USERSTATUS.REJECTED
              ? "회원가입 거절"
              : "회원가입 승인"}
          </h3>

          <div className="bg-color-77 rounded-20 text-color-24 text-[20px] font-normal text-center p-4 py-5">
            거절 사유를 작성해주세요
          </div>
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
            <Button
              size="form"
              className="w-[148px]"
              onClick={onConfirmStatusChange}
            >
              {t("check")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserDetailPage;
