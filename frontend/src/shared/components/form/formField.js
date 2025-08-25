const gapMap = {
  // "0": "gap-0",
  // "1": "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  // "5": "gap-5",
  // "6": "gap-6",
  // "7": "gap-7",
  // "8": "gap-8",
};

const FormField = ({ children, classname = "", gap = "4" }) => {
  const gapClass = gapMap[gap] || "gap-2";
  return (
    <div className={`flex items-baseline ${gapClass} ${classname}`}>
      {children}
    </div>
  );
};

export default FormField;
