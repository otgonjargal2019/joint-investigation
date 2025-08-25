import React from "react";
import MagnifyingGlass from "../components/icons/magnifyingGlass";

const Search = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border-b border-color-24 text-[20px] placeholder-color-32 font-medium focus:outline-none pr-10 pl-2 py-2"
      />
      <div className="absolute right-0 top-1/2 -translate-y-1/2">
        <MagnifyingGlass color="#656161" />
      </div>
    </div>
  );
};

export default Search;
