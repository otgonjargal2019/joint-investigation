import PropTypes from "prop-types";
import { ChevronDown } from "lucide-react";

const SelectBox = ({
  name,
  register,
  error,
  disabled = false,
  readOnly = false,
  defaultValue = "",
  className = "",
  showError = true,
  placeholder = "Select an option",
  options = [],
  variant = "default",
}) => {
  const variants = {
    default: "text-color-24 border rounded-10 px-3 py-2",
    auth: "text-color-24 bg-color-82 border-0 rounded-12 text-[22.4px] px-[20px] py-[15.22px] placeholder-color-32",
    rectangle: "text-color-24 border rounded-0",
    form: "text-color-24 border border-color-36 rounded-10 bg-white text-[20px] placeholder-color-32 px-[20px] py-[6.5px]",
    formBig:
      "text-color-24 h-[60px] border border-color-36 rounded-13 bg-color-0 text-[24.4px] font-normal placeholder-color-32 px-[20px] py-[6.5px]",
    adminForm:
      "text-black h-[45px] border border-color-36 rounded-5 bg-color-0 text-[20px] font-normal placeholder-color-32 px-[20px] py-[5px]",
  };

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full">
        <select
          id={name}
          {...register(name)}
          disabled={disabled}
          readOnly={readOnly}
          defaultValue={defaultValue}
          className={`w-full focus:ring-2 focus:ring-blue-500 outline-none appearance-none
            ${variants[variant]}
            ${error ? "border-color-86" : ""}
            ${disabled ? "bg-color-71 cursor-not-allowed" : ""}
            ${className}`}
          placeholder={placeholder}
        >
          {/* {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )} */}
          {options.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
          size={18}
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

SelectBox.propTypes = {
  name: PropTypes.string.isRequired,
  register: PropTypes.func.isRequired,
  error: PropTypes.object,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  defaultValue: PropTypes.string,
  className: PropTypes.string,
  showError: PropTypes.bool,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
};

export default SelectBox;
