"use client";

import { useTranslations } from "next-intl";

import Input from "@/shared/components/form/input";
import RadioBox from "@/shared/components/form/radio";
import Textarea from "@/shared/components/form/textarea";
import AttachedFile from "../components/icons/attachedFile";
import QuestionMarkCircle from "../components/icons/questionMarkCircle";
import { PROGRESS_STATUS } from "@/entities/investigation/model/constants";

const options = [
  { label: "1", value: "option1" },
  { label: "2", value: "option2" },
  { label: "3", value: "option3" },
  { label: "4", value: "option4" },
  { label: "5", value: "option5" },
  { label: "6", value: "option6" },
];

const TitleDiv = ({ children, className }) => (
  <div
    className={`bg-color-72 text-black text-[18px] font-medium border-b border-x border-color-32 flex justify-center items-center ${className}`}
  >
    {children}
  </div>
);

const TextDiv = ({ children, className }) => (
  <div
    className={`text-black text-[18px] font-normal border-b border-color-32 py-2 px-4 ${className}`}
  >
    {children}
  </div>
);

const TextDivBolder = ({ children, className }) => (
  <div
    className={`text-black text-[18px] font-medium border-b border-color-32 flex justify-center items-center ${className}`}
  >
    {children}
  </div>
);

const TitleDiv2 = ({ children, className }) => (
  <div
    className={`bg-color-79 text-black text-[18px] leading-[26px] font-medium border-b border-color-36 flex items-center px-4 py-3 ${className}`}
  >
    {children}
  </div>
);

const TextDiv2 = ({ children, className }) => (
  <div
    className={`text-[18px] font-normal border-b border-color-36 flex items-center p-2 px-4 ${className}`}
  >
    {children}
  </div>
);

const InvestigationRecordForm = ({
  headerInfo,
  data,
  digitalEvidence,
  report,
  register,
  watch,
  errors,
  readonly = false,
}) => {
  const t = useTranslations();
  const textWriter = t("case-form.writer");
  const textReviewer = t("case-form.reviewer");

  const options2 =
    Object.values(PROGRESS_STATUS).map((status) => ({
      value: status,
      label: t(`incident.PROGRESS_STATUS.${status}`),
    })) || [];

  let requestedAt = "";
  if (headerInfo.requestedAt) {
    const date = new Date(headerInfo.requestedAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    requestedAt = `${year}-${month}-${day}`;
  }

  return (
    <div>
      <div className="flex justify-between">
        <div className="grid grid-cols-[150px_231px] grid-rows-[40px_40px_40px_40px] gap-0 ">
          <TitleDiv className="border-t">
            {t("case-form.creation-date")}
          </TitleDiv>
          <TextDiv className="border-t border-r">{headerInfo.item1}</TextDiv>
          <TitleDiv>{t("case-form.case-number")}</TitleDiv>
          <TextDiv className="border-r">{headerInfo.item2}</TextDiv>
          <TitleDiv>{t("case-form.case-name")}</TitleDiv>
          <TextDiv className="border-r">{headerInfo.item3}</TextDiv>
          <TitleDiv>{textWriter}</TitleDiv>
          <TextDiv className="border-r">{headerInfo.item4}</TextDiv>
        </div>

        <div className="grid grid-cols-[43px_118px_43px_118px] grid-rows-[128px_32px] grid-rows-2 gap-0">
          <TitleDiv className="row-span-2 flex-col border-t">
            {textWriter.split("").map((char, index) => (
              <div key={index}>{char}</div>
            ))}
          </TitleDiv>
          <TextDivBolder className="border-t font-medium">
            {headerInfo.item5}
          </TextDivBolder>
          <TitleDiv className="row-span-2 flex-col border-t">
            {textReviewer.split("").map((char, index) => (
              <div key={index}>{char}</div>
            ))}
          </TitleDiv>
          <TextDivBolder className="border-t border-r">
            {headerInfo.item6}
          </TextDivBolder>
          <TextDivBolder className="">{requestedAt}</TextDivBolder>
          <TextDivBolder className="border-r ">
            {headerInfo.item8}
          </TextDivBolder>
        </div>
      </div>

      <div className="grid grid-cols-[150px_1fr] grid-rows-[86px_46px_97px_250px] mt-8">
        <TitleDiv className="border-t">
          {t("case-form.investigation-record-name")}
        </TitleDiv>
        <TextDiv className="border-t border-r">
          {readonly ? (
            <div className="text-[18px] font-normal py-2">
              {data.item1 ||
                watch("recordName") ||
                t("case-form.validation-enter-record-name")}
            </div>
          ) : (
            <Input
              name="recordName"
              register={(name) =>
                register(name, {
                  required: t("case-form.validation-enter-record-name"),
                })
              }
              error={errors.recordName}
              placeholder={t("case-form.validation-enter-record-name")}
            />
          )}
        </TextDiv>
        <TitleDiv className="gap-2">
          {t("case-form.security-level")} <QuestionMarkCircle />
        </TitleDiv>
        <TextDiv className="border-r">
          <RadioBox
            classname={"flex gap-4"}
            name="securityLevel"
            options={options}
            register={register}
            watch={watch}
            readonly={readonly}
          />
        </TextDiv>
        <TitleDiv>{t("case-form.detailed-progress-status")}</TitleDiv>
        <TextDiv className="border-r">
          <RadioBox
            classname="flex flex-wrap gap-x-10 gap-y-2"
            name="progressStatus"
            options={options2}
            register={register}
            watch={watch}
            readonly={readonly}
          />
        </TextDiv>
        <TitleDiv>{t("case-form.investigation-content")}</TitleDiv>
        <TextDiv className="border-r">
          {readonly ? (
            <div className="text-[18px] font-normal py-2 whitespace-pre-wrap min-h-[200px]">
              {watch("overview") || t("case-form.no-content")}
            </div>
          ) : (
            <Textarea
              name="overview"
              register={(name) =>
                register(name, {
                  required: t("case-form.validation-enter-overview"),
                })
              }
              error={errors.overview}
              placeholder="Enter your message here..."
              rows={8}
              showError={false}
            />
          )}
        </TextDiv>
      </div>

      <div className="grid grid-cols-[150px_1fr] mt-8">
        <TitleDiv2 className="col-span-2 gap-2">
          <AttachedFile />
          {t("attached-file")}
        </TitleDiv2>
        <TitleDiv2 className="justify-center border-r">
          {t("case-form.investigative-report")}
        </TitleDiv2>
        <TextDiv2>
          <ul className="space-y-1">
            {report?.map((file, idx) => (
              <li key={idx} className="flex gap-1 items-center">
                <span className="text-color-20">
                  {file.url ? (
                    <a href={file.url} target="_blank">
                      {file.name}
                    </a>
                  ) : (
                    <span>{file.name}</span>
                  )}
                </span>
                <span className="text-color-96">({file.size})</span>
                {file.onRemove && (
                  <button
                    type="button"
                    onClick={file.onRemove}
                    className="ml-2 text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                )}
                {file.isNew && (
                  <span className="ml-2 text-blue-500 text-sm">(New)</span>
                )}
              </li>
            ))}
          </ul>
        </TextDiv2>
        <TitleDiv2 className="justify-center border-r">
          {t("case-form.digital-evidence")}
        </TitleDiv2>
        <TextDiv2>
          <ul className="space-y-1">
            {digitalEvidence?.map((file, idx) => (
              <li key={idx} className="flex gap-1 items-center">
                <span className="text-color-20">
                  {file.url ? (
                    <a href={file.url} target="_blank">
                      {file.name}
                    </a>
                  ) : (
                    <span>{file.name}</span>
                  )}
                </span>
                <span className="text-color-96">({file.size})</span>
                {file.onRemove && (
                  <button
                    type="button"
                    onClick={file.onRemove}
                    className="ml-2 text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                )}
                {file.isNew && (
                  <span className="ml-2 text-blue-500 text-sm">(New)</span>
                )}
              </li>
            ))}
          </ul>
        </TextDiv2>
      </div>
    </div>
  );
};

export default InvestigationRecordForm;
