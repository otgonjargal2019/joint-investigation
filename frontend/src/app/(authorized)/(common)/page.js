"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { ROLES } from "@/shared/dictionary";
import ProfileCard from "@/shared/widgets/profileCard";
import DonutChart from "@/shared/components/pieChart";
import CaseCard from "@/shared/components/caseCard";
import Notice from "@/shared/components/notice";
import { caseData } from "@/shared/widgets/mockData/homepage";
import { userQuery } from "@/entities/user/user.query";
import { useAuth } from "@/providers/authProviders";
import { useRealTime } from "@/providers/realtimeProvider";
import { useUserInfo } from "@/providers/userInfoProviders";

export default function Home() {
  const { user } = useAuth();
  if (!user) return null;

  const t = useTranslations();
  const router = useRouter();

  const [isLoading, setLoading] = useState(true);
  const { data } = useQuery(userQuery.getUserDashboard());
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

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

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
        <div className="w-full space-y-2.5">
          <div className="flex justify-between">
            <h2 className="text-color-8 text-[24px] font-[700]">
              {t("home.status-of-my-case")}
            </h2>
            <button
              className="text-color-27 text-[18px] font-medium cursor-pointer"
              onClick={() => router.push("/")}
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
                    value: 3,
                    type: "#85D685",
                  },
                  {
                    name: t("donut-chart.unresolved"),
                    value: 10,
                    type: "#3EB491",
                  },
                  {
                    name: t("donut-chart.termination"),
                    value: 24,
                    type: "#206B7B",
                  },
                ]}
              />
            </div>
            <div className="block lg:hidden h-[1px] w-full bg-color-44 my-6"></div>
            <div className="hidden lg:block w-[2px] bg-color-44 mx-8"></div>
            <div className="w-full flex flex-col gap-4.5 min-w-0">
              {caseData.map((item, idx) => (
                <CaseCard
                  key={idx}
                  label={item.label}
                  code={item.code}
                  desc={item.desc}
                  color={item.color}
                  country={item.country}
                  isLoading={isLoading}
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
