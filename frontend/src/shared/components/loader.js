import React from "react";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-gray-800 min-w-[300px] min-h-[200px] px-8 py-6 rounded-xl shadow-lg flex items-center gap-4 border border-gray-700">
        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-white text-base ">{text}</span>
      </div>
    </div>
  );
};

export default Loader;
