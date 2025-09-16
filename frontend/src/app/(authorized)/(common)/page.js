"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ProfileCard from "@/shared/widgets/profileCard";
import DonutChart from "@/shared/components/pieChart";
import CaseCard from "@/shared/components/caseCard";
import Notice from "@/shared/components/notice";
import { caseData } from "@/shared/widgets/mockData/homepage";
import { useAuth } from "@/providers/authProviders";
import { userQuery } from "@/entities/user/user.query";

export default function Home() {
  const { user } = useAuth();
  if (!user) return null;

  const t = useTranslations();
  const router = useRouter();

  const [isLoading, setLoading] = useState(true);
  const { data } = useQuery(userQuery.getUserDashboard());
  const researchLink = "/research";

  const { noticeLink, investigationInfoLink, incidentLink } = useMemo(() => {
    if (user?.role === "admin") {
      return {
        noticeLink: "/admin/notice-management",
        investigationInfoLink: "/admin/investigation-info-management",
        incidentLink: "/manager/incident",
      };
    } else if (user?.role === "manager") {
      return {
        noticeLink: "/notice",
        investigationInfoLink: "/investigation-information",
        incidentLink: "/manager/incident",
      };
    } else if (user?.role === "investigator") {
      return {
        noticeLink: "/notice",
        investigationInfoLink: "/investigation-information",
        incidentLink: "/investigator/incident",
      };
    }
    return {
      noticeLink: "/",
      investigationInfoLink: "/",
    };
  }, [user?.role]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  const onClickNoticeRow = (row) => {
    if (row && row?.postId) {
      router.push(`/notice/${row.postId}`);
    }
  };

  const onClickResearchRow = (row) => {
    if (row && row?.postId) {
      router.push(`/research/${row.postId}`);
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
              name={"고광천"}
              unreadMessages={12}
              unreadNotifications={5}
              department={"온라인 보호부"}
              headquarters={"침해 대응 본부"}
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
              onClick={() => router.push(incidentLink)}
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
            <button
              className="text-color-27 text-[18px] font-medium cursor-pointer"
              onClick={() => router.push(noticeLink)}
            >
              {t("see-more")}+
            </button>
          </div>
          <div className="bg-white p-6 rounded-20 space-y-4 shadow-md mt-3">
            {data?.lastPosts?.map((item, idx) => (
              <Notice
                key={idx}
                text={item.title}
                date={item.createdAtStr}
                onClick={() => onClickNoticeRow(item)}
              />
            ))}
          </div>
        </div>
        <div className="w-full">
          <div className="flex justify-between">
            <h2 className="text-color-8 text-[24px] font-[700]">
              {t("home.survey-info")}
            </h2>
            <button
              className="text-color-27 text-[18px] font-medium cursor-pointer"
              onClick={() => router.push(researchLink)}
            >
              {t("see-more")}+
            </button>
          </div>
          <div className="bg-white p-6 rounded-20 space-y-4 shadow-md mt-3">
            {data?.lastResearchs?.map((item, idx) => (
              <Notice
                key={idx}
                text={item.title}
                date={item.createdAtStr}
                onClick={() => onClickResearchRow(item)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer> */
