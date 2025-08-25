import PropTypes from "prop-types";
import clsx from "clsx";

const Input = ({
  name,
  type = "text",
  register,
  error,
  placeholder,
  disabled,
  readOnly,
  defaultValue,
  className = "",
  showError = true,
  variant = "default",
}) => {
  const variants = {
    default: "text-color-4 border rounded-10 px-3 py-2",
    auth: "text-color-4 bg-color-82 border-0 rounded-12 text-[22.4px] px-[20px] py-[15.22px] placeholder-color-32",
    rectangle:
      "h-[50px] border border-color-97 text-color-4 text-[20px] placeholder-color-32 rounded-0 px-3 py-2",
    form: "border border-color-36 rounded-10 bg-white text-color-4 text-[20px] placeholder-color-32 px-[20px] py-[6.5px]",
    formBig:
      "h-[60px] border border-color-36 rounded-13 bg-color-0 text-color-4 text-[24.4px] font-normal placeholder-color-32 px-[20px] py-[6.5px]",
  };
  return (
    <div className="flex flex-col w-full">
      <input
        id={name}
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className={clsx(
          "w-full focus:ring-2 focus:ring-blue-500 outline-none",
          variants[variant],
          error && "border-color-86",
          disabled && "bg-color-71 cursor-not-allowed",
          className
        )}
        disabled={disabled}
        readOnly={readOnly}
        defaultValue={defaultValue}
      />
      {showError && (
        <p className="text-sm text-color-86 mt-1 min-h-[20px]">
          {error ? error.message : ""}
        </p>
      )}
    </div>
  );
};

Input.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  register: PropTypes.func.isRequired,
  error: PropTypes.object,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  className: PropTypes.string,
  defaultValue: PropTypes.string,
  showError: PropTypes.bool,
};

export default Input;
