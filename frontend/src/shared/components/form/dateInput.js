"use client";

import { useRef } from "react";

const DateInput = ({
  name,
  register,
  placeholder = "YYYY-MM-DD HH:mm:ss",
  className = "",
  disabled = false,
  error,
  showError = false,
  ...props
}) => {
  const inputRef = useRef(null);

  const formatDatetime = (input) => {
    // Remove all non-numeric characters
    const numbers = input.replace(/\D/g, "");

    // Apply formatting based on length with validation
    let formatted = "";

    if (numbers.length >= 1) {
      formatted = numbers.substring(0, 4); // YYYY
    }
    if (numbers.length >= 5) {
      let month = numbers.substring(4, 6);
      // Validate month (01-12)
      if (parseInt(month) > 12) {
        month = "12";
      }
      if (month.length === 1 && parseInt(month) > 1) {
        month = "0" + month;
      }
      formatted += "-" + month; // -MM
    }
    if (numbers.length >= 7) {
      let day = numbers.substring(6, 8);
      // Validate day (01-31)
      if (parseInt(day) > 31) {
        day = "31";
      }
      if (day.length === 1 && parseInt(day) > 3) {
        day = "0" + day;
      }
      formatted += "-" + day; // -DD
    }
    if (numbers.length >= 9) {
      let hour = numbers.substring(8, 10);
      // Validate hour (00-23)
      if (parseInt(hour) > 23) {
        hour = "23";
      }
      if (hour.length === 1 && parseInt(hour) > 2) {
        hour = "0" + hour;
      }
      formatted += " " + hour; // HH
    }
    if (numbers.length >= 11) {
      let minute = numbers.substring(10, 12);
      // Validate minute (00-59)
      if (parseInt(minute) > 59) {
        minute = "59";
      }
      if (minute.length === 1 && parseInt(minute) > 5) {
        minute = "0" + minute;
      }
      formatted += ":" + minute; // :mm
    }
    if (numbers.length >= 13) {
      let second = numbers.substring(12, 14);
      // Validate second (00-59)
      if (parseInt(second) > 59) {
        second = "59";
      }
      if (second.length === 1 && parseInt(second) > 5) {
        second = "0" + second;
      }
      formatted += ":" + second; // :ss
    }

    return formatted;
  };

  const handleKeyDown = (e) => {
    const currentValue = e.target.value || "";
    const cursorPosition = e.target.selectionStart;

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
      return;
    }

    // When typing a number, clear everything after cursor position
    const beforeCursor = currentValue.substring(0, cursorPosition);
    const numbersBeforeCursor = beforeCursor.replace(/\D/g, "");

    // Create new value with only the part before cursor + new digit
    const newNumbers = numbersBeforeCursor + e.key;
    const newFormatted = formatDatetime(newNumbers);

    // Prevent the default input and set our custom value
    e.preventDefault();

    // Update the input value
    e.target.value = newFormatted;

    // Trigger the onChange event
    const syntheticEvent = {
      target: e.target,
      type: "input",
    };

    // Call react-hook-form's onChange
    if (registerProps.onChange) {
      registerProps.onChange(syntheticEvent);
    }

    // Set cursor position after the new digit
    setTimeout(() => {
      if (inputRef.current) {
        let newCursorPosition = 0;
        let numberCount = 0;

        for (
          let i = 0;
          i < newFormatted.length && numberCount < newNumbers.length;
          i++
        ) {
          if (/\d/.test(newFormatted[i])) {
            numberCount++;
          }
          newCursorPosition = i + 1;
        }

        inputRef.current.setSelectionRange(
          newCursorPosition,
          newCursorPosition
        );
      }
    }, 0);
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
    ${error ? "border-color-86" : "border-color-36"}
  `
    .trim()
    .replace(/\s+/g, " ");

  // Get register props if register is provided
  const registerProps = register && name ? register(name) : {};

  // Create a custom onChange that handles formatting (mainly for paste and other events)
  const customOnChange = (e) => {
    // This will mainly handle paste events and other non-keydown events
    // since keydown now handles most of the typing logic
    const originalValue = e.target.value;
    const formatted = formatDatetime(originalValue);

    // Update the input value
    e.target.value = formatted;

    // Call react-hook-form's onChange with the formatted value
    if (registerProps.onChange) {
      registerProps.onChange(e);
    }
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
