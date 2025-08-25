import React, { useRef } from "react";
import { useTranslations } from "next-intl";
import User2 from "./icons/user2";

export default function ProfileImageUploader({ imageUrl, onUpload }) {
  const fileInputRef = useRef();
  const t = useTranslations();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="relative w-25 h-25 rounded-lg overflow-hidden">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Prifile image"
          className="w-full h-full object-contain bg-gray-200"
        />
      ) : (
        <User2 />
      )}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleImageChange}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current.click()}
        className="absolute bottom-0 left-0 right-0 px-2 py-0.5 text-[16px] font-normal text-white cursor-pointer"
        style={{ backgroundColor: "rgba(6, 6, 6, 0.5)" }}
      >
        {t("upload-image")}
      </button>
    </div>
  );
}
