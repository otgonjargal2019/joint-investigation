import PropTypes from "prop-types";
import { Check } from "lucide-react";

const Checkbox = ({
  name,
  label,
  error,
  register,
  setValue,
  watch,
  className,
  disabled,
  showError = true,
  variant = "default",
  color = "default",
}) => {
  const handleCheckboxChange = () => {
    if (disabled) return;
    const current = watch(name);
    setValue(name, !current);
  };

  const colors = {
    default: "",
    white: "text-color-82",
  };

  const variants = {
    default: "w-5 h-5",
    big: "w-[22.4px] h-[22.4px]",
  };

  return (
    <div className={`${className}`}>
      <div
        role="checkbox"
        aria-checked={watch(name)}
        tabIndex={0}
        onClick={handleCheckboxChange}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            handleCheckboxChange();
          }
        }}
        className={`flex justify-start items-center gap-2 focus:outline-none ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <input
          id={name}
          type="checkbox"
          {...register(name)}
          className="hidden"
          disabled={disabled}
        />
        <div
          className={`${colors[color]} ${variants[variant]}
             rounded-md flex items-center justify-center
             ${watch(name) ? "bg-white" : "bg-white"}
             `}
        >
          {watch(name) && <Check className="text-color-4" size={20} />}
        </div>
        <span className="text-[19.2px] font-normal text-color-82 leading-[20px]">
          {label}
        </span>
      </div>
      {showError && (
        <p className="text-sm text-red-500 mt-1 min-h-[20px]">
          {error ? error.message : ""}
        </p>
      )}
    </div>
  );
};

Checkbox.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  error: PropTypes.object,
  register: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  watch: PropTypes.func.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Checkbox;
