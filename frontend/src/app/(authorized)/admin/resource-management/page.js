"use client";
import { useTranslations } from "next-intl";

import PageTitle from "@/shared/components/pageTitle/page";

function ResourceManagementPage() {
  const t = useTranslations();
  const data = [
    { name: "CPU 사용량", size: 156688946 },
    { name: "DB 접속상태", size: 156688946 },
    { name: "블록체인 블록 개수", size: 156688946 },
    { name: "블록체인 노드 개수", size: 156688946 },
    { name: "블록체인 노드 활성 상태", size: 156688946 },
    { name: "트래픽 현황", size: 156688946 },
  ];
  return (
    <div>
      <PageTitle title={t("header.resource-mgnt")} />
      <div className="mt-16 flex justify-center">
        <div className="w-[500px]">
          {data.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-10 border border-color-36 flex justify-between py-6 px-10 mb-5"
            >
              <span className="text-color-8 text-[20px] font-medium">
                {item.name}
              </span>
              <span className="text-color-24 text-[20px] font-normal">
                {item.size}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ResourceManagementPage;
