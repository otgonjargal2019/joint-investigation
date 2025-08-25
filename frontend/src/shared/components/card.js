import clsx from "clsx";

const Card = ({ children, className }) => {
  return (
    <div
      className={clsx(
        "bg-color-0 border border-color-36 rounded-20 p-4",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
