import clsx from "clsx";

const minWidthMap = {
  // 0: "min-w-0",
  // 4: "min-w-4",
  // 8: "min-w-8",
  15: "min-w-15",
  16: "min-w-16",
  20: "min-w-20",
  24: "min-w-24",
  26: "min-w-26",
  28: "min-w-28",
  30: "min-w-30",
  32: "min-w-32",
  // 36: "min-w-36",
  // 40: "min-w-40",
  // 44: "min-w-44",
  // 48: "min-w-48",
  // 52: "min-w-52",
  // 56: "min-w-56",
  // 60: "min-w-60",
  // 64: "min-w-64",
};
const colors = {
  default: "text-black",
  white: "text-color-82",
  gray: "text-color-24",
};
const variants = {
  thinner: "text-[20px] font-normal",
  default: "text-[20px] font-medium",
  big: "text-[22.4px] font-normal",
  formBig: "text-[24.4px] font-medium",
};

const Label = ({
  htmlFor,
  children,
  className = "",
  minWidth = "24",
  color = "default",
  variant = "default",
}) => {
  const minWidthClass = minWidthMap[minWidth];

  return (
    <label
      htmlFor={htmlFor}
      className={clsx(
        "whitespace-nowrap",
        minWidthClass,
        colors[color],
        variants[variant],
        className
      )}
    >
      {children}
    </label>
  );
};

export default Label;
