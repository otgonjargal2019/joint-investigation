import { useTranslations } from "next-intl";

import AttachedFile from "../icons/attachedFile";

const FileAttachment = ({ files }) => {
  const t = useTranslations();

  return (
    <div className="bg-color-73 border-b-[2px] border-b-color-97 py-4 px-10">
      <ul role="list" className="space-y-2">
        {files.map((file, index) => (
          <li key={index} className="flex items-center gap-2">
            <AttachedFile />
            <span className="text-black text-[20px] font-normal">
              {t("attached-file")}
            </span>
            <span className="text-color-20 text-[20px] font-normal">
              {file.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileAttachment;
