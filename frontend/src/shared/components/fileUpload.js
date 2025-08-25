import React, { useRef } from "react";
import { FilePlus2 } from "lucide-react";

const FileUpload = ({ onFilesSelected }) => {
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    const fileList = Array.from(files);
    onFilesSelected?.(fileList);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div
      className="border-2 border-dashed border-gray-300 bg-gray-100 text-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition hover:bg-gray-200"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        hidden
        ref={inputRef}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex flex-col items-center gap-2">
        <FilePlus2 size={36} className="text-gray-500" />
        <p className="text-base text-gray-700">
          파일을 드래그해서 업로드하거나
          <br />
          클릭하여 추가해주세요
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
