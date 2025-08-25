import Button from "./button";
import Flag from "./icons/flag";

const SuccessNotice = ({
  icon,
  message,
  buttonText,
  onBtnClick,
  className,
}) => {
  return (
    <div className={`w-[600px] ${className}`}>
      <div className="bg-white border border-color-36 rounded-10 text-center flex flex-col items-center space-y-4 p-12">
        {icon || <Flag />}
        <p className="text-[20px] text-color-24 font-medium text-center">
          {message}
        </p>
      </div>
      <Button size="small2" className="mt-4 w-full" onClick={onBtnClick}>
        {buttonText || "default"}
      </Button>
    </div>
  );
};

export default SuccessNotice;
