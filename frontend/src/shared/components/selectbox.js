"use client";

import React from "react";

function SelectBox({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  className = "",
}) {
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`px-3 py-2 border rounded-md text-sm shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          border-gray-300 text-gray-700`}
        placeholder={placeholder}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectBox;
