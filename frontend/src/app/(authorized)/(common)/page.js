"use client";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { ROLES } from "@/shared/dictionary";
import ProfileCard from "@/shared/widgets/profileCard";
import DonutChart from "@/shared/components/pieChart";
import CaseCard from "@/shared/components/caseCard";
import Notice from "@/shared/components/notice";
import { useAuth } from "@/providers/authProviders";
import { useRealTime } from "@/providers/realtimeProvider";
import { useUserInfo } from "@/providers/userInfoProviders";
import { useDashboardMain } from "@/entities/dashboard/api/dashboard.query";
import { COLOR_MAP } from "@/entities/case/model/constants";

export default function Home() {
  const { user } = useAuth();
  if (!user) return null;

  const t = useTranslations();
  const router = useRouter();

  const { data: dataRes, isLoading } = useDashboardMain();
  const data = dataRes?.data || {};
  const { userInfo } = useUserInfo();
  const { unreadUsersCount, unreadNotifCount } = useRealTime();

  const { noticeLink, researchLink } = useMemo(() => {
    if (user?.role === ROLES.PLATFORM_ADMIN) {
      return {
        noticeLink: "/admin/notice-management",
        researchLink: "/admin/research-management",
      };
    }

    return {
      noticeLink: "/notice",
      researchLink: "/research",
    };
  }, [user?.role]);

  const onClickNoticeRow = (row) => {
    if (row && row?.postId) {
      router.push(`${noticeLink}/${row.postId}`);
    }
  };

  const onClickResearchRow = (row) => {
    if (row && row?.postId) {
      router.push(`${researchLink}/${row.postId}`);
    }
  };

  const onClickRecentCase = (row) => {
    switch (userInfo?.role) {
      case ROLES.INVESTIGATOR:
      case ROLES.RESEARCHER:
        router.push(`/investigator/cases/${row.caseId}`);
        break;
      case ROLES.INV_ADMIN:
        router.push(`/manager/cases/${row.caseId}`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="px-0">
      <div className="flex flex-col xl:flex-row gap-8 mt-14">
        <div className="space-y-2.5">
          <h2 className="text-color-8 text-[24px] font-[700]">
            {t("home.profile")}
          </h2>
          <div className="">
            <ProfileCard
              name={userInfo?.nameKr || userInfo?.nameEn}
              unreadMessages={unreadUsersCount}
              unreadNotifications={unreadNotifCount}
              department={userInfo?.departmentName}
              headquarters={userInfo?.headquarterName}
              avatar={userInfo?.profileImageUrl}
            />
          </div>
        </div>
        <div className="w-full space-y-2.5 overflow-hidden">
          <div className="flex justify-between">
            <h2 className="text-color-8 text-[24px] font-[700]">
              {t("home.status-of-my-case")}
            </h2>
            <button
              className="text-color-27 text-[18px] font-medium cursor-pointer"
              onClick={() => {
                switch (userInfo?.role) {
                  case ROLES.INVESTIGATOR:
                  case ROLES.RESEARCHER:
                    router.push("/investigator/cases");
                    break;
                  case ROLES.INV_ADMIN:
                    router.push("/manager/cases");
                    break;
                  default:
                    break;
                }
              }}
            >
              {t("see-more")}+
            </button>
          </div>
          <div className="bg-color-92 flex flex-col lg:flex-row p-6 lg:p-9 shadow-md rounded-20">
            <div className="flex-shrink-0">
              <DonutChart
                isLoading={isLoading}
                data={[
                  {
                    name: t("donut-chart.ongoing"),
                    value: data?.caseSummary?.OPEN || 0,
                    type: "#85D685",
                  },
                  {
                    name: t("donut-chart.unresolved"),
                    value: data?.caseSummary?.ON_HOLD || 0,
                    type: "#3EB491",
                  },
                  {
                    name: t("donut-chart.termination"),
                    value: data?.caseSummary?.CLOSED || 0,
                    type: "#206B7B",
                  },
                ]}
              />
            </div>
            <div className="block lg:hidden h-[1px] w-full bg-color-44 my-6"></div>
            <div className="hidden lg:block w-[2px] bg-color-44 mx-8"></div>
            <div className="w-full flex flex-col gap-4.5 min-w-0">
              {data?.recentCases?.map((item) => (
                <CaseCard
                  key={item.caseId}
                  label={
                    item?.infringementType
                      ? t(
                          `case_details.case_infringement_type.${item?.infringementType}`
                        )
                      : ""
                  }
                  code={`#${item.number}. ${item.caseId}`}
                  desc={item.caseName}
                  color={`${COLOR_MAP[item?.infringementType || "DEFAULT"]}`}
                  country={item.relatedCountries}
                  isLoading={isLoading}
                  onClick={() => onClickRecentCase(item)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col xl:flex-row gap-8 mt-5.5">
        <div className="w-full">
          <div className="flex justify-between">
            <h2 className="text-color-8 text-[24px] font-[700]">
              {t("home.notice")}
            </h2>
            {data?.lastPosts && data.lastPosts.length > 0 ? (
              <button
                className="text-color-27 text-[18px] font-medium cursor-pointer"
                onClick={() => router.push(noticeLink)}
              >
                {t("see-more")}+
              </button>
            ) : null}
          </div>
          <div className="bg-white p-6 rounded-20 space-y-4 shadow-md mt-3">
            {data?.lastPosts && data.lastPosts.length > 0 ? (
              data.lastPosts.map((item, idx) => (
                <Notice
                  key={idx}
                  text={item.title}
                  date={item.createdAtStr}
                  onClick={() => onClickNoticeRow(item)}
                />
              ))
            ) : (
              <p className="text-center text-gray-500">{t("no-data")}</p>
            )}
          </div>
        </div>
        <div className="w-full">
          <div className="flex justify-between">
            <h2 className="text-color-8 text-[24px] font-[700]">
              {t("home.survey-info")}
            </h2>
            {data?.lastResearchs && data.lastResearchs.length > 0 ? (
              <button
                className="text-color-27 text-[18px] font-medium cursor-pointer"
                onClick={() => router.push(researchLink)}
              >
                {t("see-more")}+
              </button>
            ) : null}
          </div>
          <div className="bg-white p-6 rounded-20 space-y-4 shadow-md mt-3">
            {data?.lastResearchs && data.lastResearchs.length > 0 ? (
              data.lastResearchs.map((item, idx) => (
                <Notice
                  key={idx}
                  text={item.title}
                  date={item.createdAtStr}
                  onClick={() => onClickResearchRow(item)}
                />
              ))
            ) : (
              <p className="text-center text-gray-500">{t("no-data")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
