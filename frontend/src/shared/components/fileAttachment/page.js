import { useTranslations } from "next-intl";

import AttachedFile from "../icons/attachedFile";

const FileAttachment = ({ files }) => {
  const t = useTranslations();

  return (
    <div className="bg-color-73 border-b-[2px] border-b-color-97 py-4 px-10">
      <ul role="list" className="space-y-2">
        {files.map((file, index) => (
          <li key={index} className="flex items-center gap-2">
            <div>
              <AttachedFile />
            </div>
            <span className="text-black text-[20px] font-normal whitespace-nowrap">
              {t("attached-file")}
            </span>
            <a
              href={file.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-color-20 text-[20px] font-normal hover:opacity-80"
              title={file.fileName}
            >
              {file.fileName}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileAttachment;
