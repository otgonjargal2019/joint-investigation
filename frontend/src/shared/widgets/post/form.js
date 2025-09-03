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

const Form = ({
  mode = "create",
  defaultValues = {},
  onSubmit,
  onClickCancel,
}) => {
  const t = useTranslations();
  const fileInputRef = useRef(null);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [content, setContent] = useState();

  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    if (mode === "edit" && defaultValues) {
      setValue("title", defaultValues?.title);
      setContent(defaultValues?.content);
      setSelectedFiles(defaultValues?.attachments);
    }
  }, [mode, defaultValues, setValue]);

  const handleFileDownload = (file) => {
    if (mode === "edit" && file.fileUrl) {
      // For existing files that have URLs
      window.open(file.fileUrl, "_blank");
    } else if (file instanceof File) {
      // For newly selected files
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="border-t-[2px] border-t-color-93 py-4">
      <form
        onSubmit={handleSubmit((formData) =>
          onSubmit({ ...formData, content, files: selectedFiles })
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
            multiple
            onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
          />
          <Button
            variant="grayWithWhite"
            onClick={() => fileInputRef.current?.click()}
            type="button"
            className="px-5"
          >
            {t("select-file")}
          </Button>
          {selectedFiles && selectedFiles.length > 0 ? (
            <div className="text-color-20 text-[20px] font-normal">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="cursor-pointer hover:underline"
                  onClick={() => handleFileDownload(file)}
                >
                  {file.name || file.fileName}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-color-40 text-[20px] font-normal">
              {t("no-files-selected")}
            </span>
          )}
        </FormField>

        <div className="w-full h-[1px] bg-color-97 my-6" />

        <TiptapEditor
          onChange={(newContent) => setContent(newContent)}
          content={content}
        />

        <div className="flex justify-center gap-4 mt-4">
          <Button variant="grayWithDark" type="button" onClick={onClickCancel}>
            {t("cancel")}
          </Button>
          <Button type="submit">{t("register")}</Button>
        </div>
      </form>
    </div>
  );
};

export default Form;
