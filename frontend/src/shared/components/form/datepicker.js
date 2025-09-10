import clsx from "clsx";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import { Controller } from "react-hook-form";

const DatePickerInput = ({
  name,
  control,
  error,
  placeholder = "Select date",
  disabled = false,
  readOnly = false,
  className = "",
  showError = true,
  dateFormat = "yyyy-MM-dd HH:mm",
  variant = "default",
}) => {
  const variants = {
    default: "border rounded-10 px-3 py-2",
    formBig:
      "h-[60px] border border-color-36 rounded-13 bg-color-0 text-[24.4px] font-normal placeholder-color-32 px-[20px] py-[6.5px]",
  };

  return (
    <div className="flex flex-col w-full">
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <DatePicker
            id={name}
            {...field}
            selected={field.value}
            onChange={(date) => field.onChange(date)}
            placeholderText={placeholder}
            dateFormat={dateFormat}
            disabled={disabled}
            readOnly={readOnly}
            showTimeSelect
            timeIntervals={5}
            timeFormat="HH:mm"
            timeCaption="Time"
            className={clsx(
              "w-full text-color-24 focus:ring-2 focus:ring-blue-500 outline-none",
              variants[variant],
              error && "border-color-86",
              disabled && "bg-color-71 cursor-not-allowed",
              className
            )}
            autoComplete="off"
          />
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

DatePickerInput.propTypes = {
  name: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
  error: PropTypes.object,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  className: PropTypes.string,
  showError: PropTypes.bool,
  dateFormat: PropTypes.string,
};

export default DatePickerInput;
