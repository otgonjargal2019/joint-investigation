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
import {
  userQuery,
  useUpdateUserStatus,
  useUpdateRole,
  useGetLastWaitingToChangeByUserId,
} from "@/entities/user";

const UserDetailPage = ({ params }) => {
  const { id } = use(params);
  const t = useTranslations();
  const router = useRouter();

  const { data: response, refetch } = useQuery(
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
    watch,
  } = useForm();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [roleSuccessModalOpen, setRoleSuccessModalOpen] = useState(false);
  const [waitingUserInfo, setWaitingUserInfo] = useState({});
  const userStatusMutation = useUpdateUserStatus();
  const userRoleMutation = useUpdateRole();
  const lastWaitingToChangeMutation = useGetLastWaitingToChangeByUserId();

  useEffect(() => {
    if (setValue && user && user.status === USERSTATUS.APPROVED) {
      setValue("role", user.role);
    }
  }, [user, setValue]);

  useEffect(() => {
    if (user && user.status === USERSTATUS.WAITING_TO_CHANGE) {
      lastWaitingToChangeMutation.mutate(
        { userId: user.userId },
        {
          onSuccess: (res) => {
            if (res?.data) {
              setWaitingUserInfo(res.data);
            } else {
              setWaitingUserInfo({});
            }
          },
          onError: (err) => {
            setWaitingUserInfo({});
          },
        }
      );
    }
  }, [user]);

  const handleApprove = () => {
    if (!user) return;

    let userStatus = USERSTATUS.APPROVED;
    let historyStatus = USERSTATUS.APPROVED;

    userStatusMutation.mutate(
      { userId: user.userId, userStatus, historyStatus, reason: null },
      {
        onSuccess: (res) => {
          toast.success(res.data.message, {
            autoClose: 3000,
            position: "top-center",
          });
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

  const openRejectModal = () => {
    setValue("reason", "");
    setRejectModalOpen(true);
  };

  const onConfirmReject = () => {
    if (!user) return;

    const reason = getValues("reason");

    let userStatus;
    let historyStatus;

    if (user.status === USERSTATUS.PENDING) {
      userStatus = USERSTATUS.REJECTED;
      historyStatus = USERSTATUS.REJECTED;
    } else if (user.status === USERSTATUS.WAITING_TO_CHANGE) {
      userStatus = USERSTATUS.APPROVED;
      historyStatus = USERSTATUS.REJECTED;
    }

    userStatusMutation.mutate(
      { userId: user.userId, userStatus, historyStatus, reason },
      {
        onSuccess: (res) => {
          toast.success(res.data.message, {
            autoClose: 3000,
            position: "top-center",
          });
          setRejectModalOpen(false);
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
    if (role) {
      userRoleMutation.mutate(
        { userId: user.userId, role },
        {
          onSuccess: (res) => {
            setRoleSuccessModalOpen(true);
            refetch();
          },
          onError: (err) => {
            toast.error(err.response.data.message, {
              position: "top-center",
              autoClose: 2000,
            });
          },
        }
      );
    }
  };

  const selectedRole = watch("role");
  const isButtonDisabled = !user || selectedRole === user.role || !selectedRole;

  const rejectTitle =
    user?.status === USERSTATUS.PENDING
      ? t("prompt.rejection-of-membership")
      : t("prompt.refuse-to-change-membership-information");

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
                  onClick={openRejectModal}
                >
                  <CancelCircle />
                  {t("refuse")}
                </Button>
                <Button
                  variant="yellow"
                  size="mediumWithShadow"
                  className="gap-3"
                  onClick={handleApprove}
                >
                  <CheckCircle />
                  {t("approve")}
                </Button>
              </>
            )}
          </div>
        </div>
        {(user?.status === USERSTATUS.PENDING ||
          user?.status === USERSTATUS.REJECTED) && (
          <UserDetailTable userInfo={user} />
        )}

        {user?.status === USERSTATUS.APPROVED && (
          <UserDetailWithRoleChange
            userInfo={user}
            register={register}
            onSubmit={onChangeRole}
            isButtonDisabled={isButtonDisabled}
          />
        )}

        {user?.status === USERSTATUS.WAITING_TO_CHANGE && (
          <UserInfoChangeCompare
            userInfo={user}
            newUserInfo={waitingUserInfo}
          />
        )}
      </div>

      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        size="w568"
      >
        <div className="space-y-8">
          <h3 className="text-color-8 text-[24px] font-medium text-center">
            {rejectTitle}
          </h3>

          <div className="bg-color-77 rounded-20 text-color-24 text-[20px] font-normal text-center p-4 py-5">
            {t("prompt.write-the-reason-for-rejection")}
          </div>
          <Textarea
            name="reason"
            register={register}
            error={errors.reason}
            placeholder={t("placeholder.message")}
            variant="formBig"
            className="h-[200px]"
            showError={false}
          />

          <div className="flex justify-center gap-4">
            <Button
              variant="gray2"
              size="form"
              className="w-[148px]"
              onClick={() => setRejectModalOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button size="form" className="w-[148px]" onClick={onConfirmReject}>
              {t("check")}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={roleSuccessModalOpen}
        onClose={() => setRoleSuccessModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="text-color-24 text-[20px] font-normal text-center p-4">
            {t("info-msg.role-changed")}
          </div>

          <div className="flex justify-center gap-4">
            <Button
              size="form"
              className="w-[150px]"
              onClick={() => setRoleSuccessModalOpen(false)}
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
