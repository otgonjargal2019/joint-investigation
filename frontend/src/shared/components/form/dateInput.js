"use client";

import { useRef } from "react";

const DateInput = ({
  name,
  register,
  placeholder = "YYYY-MM-DD HH:mm:ss",
  className = "",
  disabled = false,
  error,
  showError = true,
  ...props
}) => {
  const inputRef = useRef(null);

  const formatDatetime = (input) => {
    // Remove all non-numeric characters
    const numbers = input.replace(/\D/g, "");

    // Apply formatting based on length
    let formatted = "";

    if (numbers.length >= 1) {
      formatted = numbers.substring(0, 4); // YYYY
    }
    if (numbers.length >= 5) {
      formatted += "-" + numbers.substring(4, 6); // -MM
    }
    if (numbers.length >= 7) {
      formatted += "-" + numbers.substring(6, 8); // -DD
    }
    if (numbers.length >= 9) {
      formatted += " " + numbers.substring(8, 10); // HH
    }
    if (numbers.length >= 11) {
      formatted += ":" + numbers.substring(10, 12); // :mm
    }
    if (numbers.length >= 13) {
      formatted += ":" + numbers.substring(12, 14); // :ss
    }

    return formatted;
  };

  const handleKeyDown = (e) => {
    // Allow backspace, delete, arrow keys, tab, etc.
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "Tab" ||
      e.key === "Enter" ||
      e.key === "Escape" ||
      (e.ctrlKey &&
        (e.key === "a" || e.key === "c" || e.key === "v" || e.key === "x"))
    ) {
      return;
    }

    // Only allow numbers
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }

    // Limit to 14 digits (YYYYMMDDHHmmss)
    const currentValue = e.target.value || "";
    const numbers = currentValue.replace(/\D/g, "");
    if (numbers.length >= 14) {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const formatted = formatDatetime(pastedText);

    // Update the input value directly
    e.target.value = formatted;

    // Create and dispatch input event for react-hook-form
    const inputEvent = new Event("input", { bubbles: true });
    e.target.dispatchEvent(inputEvent);
  };

  const baseClasses = `
    w-full h-[60px] border  rounded-13 text-color-4 text-[24.4px]
    font-normal placeholder-color-32 px-[20px] py-[6.5px] outline-none
    ${disabled ? "bg-color-71 cursor-not-allowed" : "bg-color-0"}
    ${error ? "border-red-300 bg-red-50" : "border-color-36"}
  `
    .trim()
    .replace(/\s+/g, " ");

  // Get register props if register is provided
  const registerProps = register && name ? register(name) : {};

  // Create a custom onChange that handles formatting
  const customOnChange = (e) => {
    // Store original values
    const originalValue = e.target.value;
    const cursorPosition = e.target.selectionStart;

    // Format the input
    const formatted = formatDatetime(originalValue);

    // Calculate new cursor position
    let newCursorPosition = cursorPosition;
    if (formatted.length > originalValue.length) {
      newCursorPosition =
        cursorPosition + (formatted.length - originalValue.length);
    }

    // Update the input value
    e.target.value = formatted;

    // Call react-hook-form's onChange with the formatted value
    if (registerProps.onChange) {
      registerProps.onChange(e);
    }

    // Set cursor position after the event loop
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(
          newCursorPosition,
          newCursorPosition
        );
      }
    }, 0);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id={name}
          name={name}
          onInput={customOnChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={disabled}
          className={`${baseClasses} ${className}`}
          maxLength={19} // YYYY-MM-DD HH:mm:ss
          {...registerProps}
          {...props}
        />
      </div>
      {showError && (
        <p className="text-sm text-color-86 mt-1 min-h-[20px]">
          {error ? error.message : ""}
        </p>
      )}
    </div>
  );
};

export default DateInput;
