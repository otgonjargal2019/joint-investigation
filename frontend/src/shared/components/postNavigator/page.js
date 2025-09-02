import { useTranslations } from "next-intl";

import UpArrow from "../icons/upArrow";
import DownArrow from "../icons/downArrow";

const PostNavigator = ({ prev, next, onClick }) => {
  const t = useTranslations();

  return (
    <div className="border-t-[2px] border-color-97">
      {prev && (
        <div
          className={`flex items-center gap-4 px-10 py-2.5 border-b-[2px] border-color-97`}
        >
          <button
            onClick={() => onClick("prev")}
            className="flex items-center gap-2 text-black text-[20px] font-normal hover:opacity-70 cursor-pointer"
          >
            <UpArrow />
            <span>{t("prev-content")}</span>
          </button>
          <span className="text-color-24 text-[20px] font-normal">
            {prev?.title}
          </span>
        </div>
      )}

      {next && (
        <div
          className={`flex items-center gap-4 px-10 py-2.5 border-b-[2px] border-color-97`}
        >
          <button
            onClick={() => onClick("next")}
            className="flex items-center gap-2 text-black text-[20px] font-normal hover:opacity-70 cursor-pointer"
          >
            <DownArrow />
            <span>{t("next-content")}</span>
          </button>
          <span className="text-color-24 text-[20px] font-normal">
            {next?.title}
          </span>
        </div>
      )}
    </div>
  );
};

export default PostNavigator;
