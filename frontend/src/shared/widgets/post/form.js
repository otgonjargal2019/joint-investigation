"use client";

import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef, useEffect, useMemo } from "react";

import { postSchema } from "@/entities/post";
import Button from "@/shared/components/button";
import Label from "@/shared/components/form/label";
import Input from "@/shared/components/form/input";
import FormField from "@/shared/components/form/formField";
import CancelCircle from "@/shared/components/icons/cancelCircle";

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

  const [existingFiles, setExistingFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState([]);
  const [content, setContent] = useState();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(postSchema),
  });

  useEffect(() => {
    if (mode === "edit" && defaultValues) {
      setValue("title", defaultValues?.title);
      setContent(defaultValues?.content);
      setExistingFiles(defaultValues.attachments || []);
    }
  }, [mode, defaultValues, setValue]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const handleRemoveExistingFile = (id) => {
    setExistingFiles((prev) => prev.filter((f) => f.attachmentId !== id));
    setRemovedAttachmentIds((prev) => [...prev, id]);
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileDownload = (file) => {
    if (file.fileUrl) {
      window.open(file.fileUrl, "_blank");
    } else if (file instanceof File) {
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

  const title = watch("title");

  const isDisabled = useMemo(() => {
    const titleEmpty = !title?.trim();
    const contentEmpty = !content?.trim() || content === "<p></p>";

    if (mode === "create") {
      // For create mode, require both title and content
      return titleEmpty || contentEmpty;
    }

    if (mode === "edit") {
      const titleUnchanged = title === defaultValues?.title;
      const contentUnchanged = content === defaultValues?.content;
      const filesUnchanged =
        newFiles.length === 0 &&
        existingFiles.length === (defaultValues.attachments?.length || 0);

      // For edit mode, disable if nothing changed OR if title/content is empty
      return (
        (titleUnchanged && contentUnchanged && filesUnchanged) ||
        titleEmpty ||
        contentEmpty
      );
    }

    return false;
  }, [mode, title, content, newFiles, existingFiles, defaultValues]);

  return (
    <div className="border-t-[2px] border-t-color-93 py-4">
      <form
        onSubmit={handleSubmit((formData) =>
          onSubmit({
            ...formData,
            content,
            files: newFiles,
            removedAttachmentIds,
          })
        )}
      >
        <FormField>
          <Label variant="thinner" className="pl-4">
            {t("title")}
          </Label>
          <Input
            name="title"
            register={register}
            variant="rectangle"
            error={errors.title}
          />
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
            onChange={handleFileChange}
          />
          <Button
            variant="grayWithWhite"
            onClick={() => fileInputRef.current?.click()}
            type="button"
            className="px-5"
          >
            {t("select-file")}
          </Button>
          {existingFiles.length + newFiles.length > 0 ? (
            <div className="text-color-20 text-[20px] font-normal mt-2">
              {existingFiles.map((file) => (
                <div
                  key={file.attachmentId}
                  className="flex items-center justify-between py-1"
                >
                  <span
                    className="hover:underline"
                    onClick={() => handleFileDownload(file)}
                  >
                    {file.fileName}
                  </span>
                  <button
                    type="button"
                    className="ml-4 text-red-500 hover:underline"
                    onClick={() => handleRemoveExistingFile(file.attachmentId)}
                  >
                    <CancelCircle />
                  </button>
                </div>
              ))}
              {newFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-1"
                >
                  <span
                    className="hover:underline"
                    onClick={() => handleFileDownload(file)}
                  >
                    {file.name}
                  </span>
                  <button
                    type="button"
                    className="ml-4 text-red-500 hover:underline"
                    onClick={() => handleRemoveNewFile(index)}
                  >
                    <CancelCircle />
                  </button>
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

        <TiptapEditor onChange={setContent} content={content} />

        <div className="flex justify-center gap-4 mt-4">
          <Button variant="grayWithDark" type="button" onClick={onClickCancel}>
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={isDisabled}>
            {t("register")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Form;
