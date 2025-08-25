"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, children, size = "md" }) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-[575px]",
    xxl: "max-w-[780px]",
    full: "max-w-full",
    w568: "max-w-[568px]",
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-xs">
      <div
        className={`bg-white border border-color-36 rounded-10 p-6 shadow-lg w-full relative z-60 ${
          sizeClasses[size] || "max-w-md"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
        >
          <X className="" />
        </button>
        {children}
      </div>
    </div>
  );
}
