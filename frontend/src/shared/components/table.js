import clsx from "clsx";

export const Table = ({ children }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full  border-b border-color-97">{children}</table>
    </div>
  );
};

export const Thead = ({ children, classname = "" }) => {
  return (
    <thead
      className={`bg-transparent border-t-[2px] border-b-[2px] border-color-93 ${classname}`}
    >
      {children}
    </thead>
  );
};

export const Tbody = ({ children }) => {
  return (
    <tbody className="bg-white divide-y divide-color-97">{children}</tbody>
  );
};

export const Tr = ({ children, hover = false, onClick, variant = "body" }) => {
  const isHead = variant === "head";
  return (
    <tr
      className={`
        ${!isHead ? "divide-x divide-color-97" : ""}
        ${hover && !isHead ? "hover:bg-color-82" : ""}
        ${!isHead ? "odd:bg-white even:bg-color-82" : ""}
      `}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

export const Th = ({ children }) => {
  return (
    <th className="px-4 py-[9px] text-center text-[20px] font-medium text-color-24">
      {children}
    </th>
  );
};

export const Td = ({
  children,
  textAlign = "text-left",
  rowSpan,
  colSpan,
  onClick,
  className,
}) => {
  return (
    <td
      className={clsx(
        "px-4 py-[11px] text-[20px] font-normal text-color-24",
        textAlign,
        className
      )}
      rowSpan={rowSpan}
      colSpan={colSpan}
      onClick={onClick}
    >
      {children ?? "-"}
    </td>
  );
};

// -------------------
export const Thead2 = ({ children, className = "" }) => {
  return (
    <thead className={clsx("border-b border-color-97 ", className)}>
      {children}
    </thead>
  );
};

export const Th2 = ({ children, className }) => {
  return (
    <th
      className={clsx(
        "px-4 py-[10.5px] bg-color-77 text-left text-[20px] font-normal text-color-24",
        className
      )}
    >
      {children}
    </th>
  );
};
