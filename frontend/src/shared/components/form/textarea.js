import PropTypes from "prop-types";
import clsx from "clsx";

const Textarea = ({
  name,
  register,
  error,
  placeholder = "",
  disabled = false,
  readOnly = false,
  defaultValue = "",
  className = "",
  showError = true,
  rows = 4,
  variant = "default",
}) => {
  const variants = {
    default: "border rounded-10 px-3 py-2",
    formBig:
      "border border-color-36 rounded-13 bg-color-0 text-[24.4px] font-normal placeholder-color-32 px-[20px] py-[6.5px]",
  };

  return (
    <div className="flex flex-col w-full">
      <textarea
        id={name}
        {...register(name)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        defaultValue={defaultValue}
        rows={rows}
        className={clsx(
          "w-full text-color-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none",
          variants[variant],
          error && "border-color-86",
          disabled && "bg-color-71 cursor-not-allowed",
          className
        )}
      />
      {showError && (
        <p className="text-sm text-color-86 mt-1 min-h-[20px]">
          {error ? error.message : ""}
        </p>
      )}
    </div>
  );
};

Textarea.propTypes = {
  name: PropTypes.string.isRequired,
  register: PropTypes.func.isRequired,
  error: PropTypes.object,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  defaultValue: PropTypes.string,
  className: PropTypes.string,
  showError: PropTypes.bool,
  rows: PropTypes.number,
};

export default Textarea;
