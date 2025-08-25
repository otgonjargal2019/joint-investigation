import Link from "next/link";
import { getTranslations } from "next-intl/server";

import LogoBig from "@/shared/components/icons/logoBig";
import Button from "@/shared/components/button";

export default async function NotFound() {
  const t = await getTranslations();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-[640px]">
        <div className="inline-flex items-center justify-center w-[86px] h-[86px] rounded-20 bg-color-9 mb-6">
          <LogoBig />
        </div>

        <div className="text-[56px] leading-[1.1] font-bold text-color-1">
          404
        </div>
        <h1 className="mt-3 text-[28px] sm:text-[32px] font-semibold text-color-1">
          {t("not-found.title")}
        </h1>
        <p className="mt-3 text-[18px] text-color-42">
          {t("not-found.description")}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button variant="neon" size="medium">
              {t("go-to-main-page")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
