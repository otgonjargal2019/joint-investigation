import { useTranslations } from "next-intl";

import UpArrow from "../icons/upArrow";
import DownArrow from "../icons/downArrow";

const PostNavigator = ({ prevTitle, nextTitle, onClick }) => {
  const t = useTranslations();

  return (
    <div className="border-b-[2px] border-t-[2px] border-color-97">
      <div className="flex items-center gap-4 border-b-[2px] border-color-97 px-10 py-2.5">
        <button
          onClick={() => onClick("prev-content")}
          className="flex items-center gap-2 text-black text-[20px] font-normal hover:opacity-70"
        >
          <UpArrow />
          <span>{t("prev-content")}</span>
        </button>
        <span className="text-color-24 text-[20px] font-normal">
          {prevTitle}
        </span>
      </div>
      <div className="flex items-center gap-4 px-10 py-2.5">
        <button
          onClick={() => onClick("next-content")}
          className="flex items-center gap-2 text-black text-[20px] font-normal hover:opacity-70"
        >
          <DownArrow />
          <span>{t("next-content")}</span>
        </button>
        <span className="text-color-24 text-[20px] font-normal">
          {nextTitle}
        </span>
      </div>
    </div>
  );
};

export default PostNavigator;
