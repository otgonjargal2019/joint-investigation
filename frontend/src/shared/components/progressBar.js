import React from "react";

const formatMB = (bytes) =>
  isNaN(bytes) || bytes <= 0
    ? "0 MB"
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const ProgressBar = ({
  currentSize = 0,
  totalSize = 0,
  color = "bg-[#D8F177]",
}) => {
  const progress =
    totalSize > 0 ? Math.min((currentSize / totalSize) * 100, 100) : 0;

  return (
    <div className="w-full space-y-1">
      <div className="w-full h-2 bg-gray-200 rounded-sm overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {formatMB(currentSize)} of {formatMB(totalSize)}
        </span>
        <span>업로드 중</span>
      </div>
    </div>
  );
};

export default ProgressBar;
