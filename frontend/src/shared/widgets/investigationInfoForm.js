"use client";

import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";

import Button from "@/shared/components/button";
import Input from "@/shared/components/form/input";
import FormField from "@/shared/components/form/formField";
import Label from "@/shared/components/form/label";

const TiptapEditor = dynamic(() => import("@/shared/components/textEditor"), {
  ssr: false,
});

const InvestigationInfoForm = ({
  defaultValues = {},
  onSubmit,
  mode = "create",
}) => {
  const t = useTranslations();
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [content, setContent] = useState(defaultValues.content || "");
  const fileInputRef = useRef(null);
  const { register, handleSubmit, setValue } = useForm({
    defaultValues,
  });

  useEffect(() => {
    setValue("title", defaultValues.title || "");
  }, [defaultValues.title, setValue]);

  return (
    <div className="border-t-[2px] border-t-color-93 py-4">
      <form
        onSubmit={handleSubmit((data) =>
          onSubmit({ ...data, content, file: selectedFiles })
        )}
      >
        <FormField>
          <Label variant="thinner" className="pl-4">
            {t("title")}
          </Label>
          <Input name="title" register={register} variant="rectangle" />
        </FormField>

        <FormField>
          <Label variant="thinner" className="pl-4">
            {t("file-attachment")}
          </Label>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => setSelectedFiles(e.target.files[0])}
          />
          <Button
            variant="grayWithWhite"
            onClick={() => fileInputRef.current?.click()}
            type="button"
            className="px-5"
          >
            {t("select-file")}
          </Button>
          {selectedFiles ? (
            <div className="text-color-20 text-[20px] font-normal">
              {selectedFiles.name}
            </div>
          ) : (
            <span className="text-color-40 text-[20px] font-normal">
              {defaultValues.fileName || t("no-files-selected")}
            </span>
          )}
        </FormField>

        <div className="w-full h-[1px] bg-color-97 my-6" />

        <TiptapEditor
          onChange={(newContent) => setContent(newContent)}
          content={content}
        />

        <div className="flex justify-center gap-4 mt-4">
          <Button variant="grayWithDark" type="button">
            {t("cancel")}
          </Button>
          <Button type="submit">{t("register")}</Button>
        </div>
      </form>
    </div>
  );
};

export default InvestigationInfoForm;
