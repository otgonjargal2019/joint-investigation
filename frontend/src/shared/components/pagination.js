import React from "react";

import RightArrow from "./icons/rightArrow";
import LeftArrow from "./icons/leftArrow";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        className="cursor-pointer disabled:cursor-default"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <LeftArrow color={currentPage === 1 ? "#dddddd" : "#979797"} />
      </button>

      {getPageNumbers().map((page, index) =>
        page === "..." ? (
          <span key={index} className="px-2">
            ...
          </span>
        ) : (
          <button
            key={index}
            className={`px-[12px] py-[2px] text-[22px] font-normal cursor-pointer
              ${
                currentPage === page
                  ? "bg-color-4 text-white rounded-10"
                  : "text-color-14"
              }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}

      <button
        className="cursor-pointer disabled:cursor-default"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <RightArrow
          color={currentPage === totalPages ? "#dddddd" : "#979797"}
        />
      </button>
    </div>
  );
};

export default Pagination;
