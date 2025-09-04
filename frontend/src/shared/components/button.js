import clsx from "clsx";
import React, { forwardRef } from "react";

const Button = forwardRef(
  (
    {
      type = "button",
      onClick,
      children,
      variant = "neon",
      disabled,
      className = "",
      size = "default",
    },
    ref
  ) => {
    const baseStyles =
      "flex items-center justify-center transition duration-200 focus:outline-none whitespace-nowrap hover:brightness-90";

    const variants = {
      neon: "bg-color-61 text-color-4",
      dark: "bg-color-4 text-color-1 hover:text-color-4 hover:bg-color-61",
      dark2: "bg-color-4 text-color-58",
      dark3: "bg-color-9 text-color-1",
      white: "bg-white border border-color-48 text-color-23",
      white2: "bg-white border border-color-24 text-color-24 hover:bg-color-1",
      grayWithWhite: "bg-color-52 text-white",
      grayWithDark: "bg-color-52 text-color-4",
      gray2: "bg-color-65 text-color-4",
      gray3: "bg-color-64 text-color-4",
      yellow: "bg-color-81 text-color-18 border border-color-48",
      pink: "bg-color-85 text-color-18 border border-color-48",
    };

    const sizes = {
      extraSmall: "h-[28px] px-[10.3px] text-[16px] font-normal rounded-10",
      small: "h-[45px] px-4 text-[20px] font-normal rounded-12",
      small2: "h-[45px] px-4 text-[20px] font-normal rounded-10",
      small3: "h-[45px] px-4 text-[20px] font-medium rounded-10",
      adminForm: "h-[45px] px-4 text-[20px] font-normal rounded-5",
      default: "h-[50px] min-w-[100px] text-[20px] font-normal rounded-5",
      mediumWithShadow:
        "h-[50px] px-4 text-[20px] font-medium rounded-5 shadow-md",
      medium: "h-[50px] min-w-[150px] text-[20px] font-normal rounded-12",
      header: "h-[60px] px-[21px] text-[22px] font-medium rounded-10",
      form: "h-[50px] px-4 text-[22.4px] font-normal rounded-12",
      bigForm: "h-[60px] px-4 text-[22.4px] font-medium rounded-12",
      big: "h-[64px] px-4 text-[22.4px] font-medium rounded-12",
    };

    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={clsx(
          baseStyles,
          sizes[size],
          variants[variant],
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className
        )}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
