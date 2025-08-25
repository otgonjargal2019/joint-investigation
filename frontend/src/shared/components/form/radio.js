const RadioBox = ({ name, options, register, watch, classname }) => {
  const selected = watch(name);

  return (
    <div className={classname}>
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center gap-2 cursor-pointer"
        >
          <input
            type="radio"
            value={option.value}
            {...register(name)}
            className="sr-only"
          />
          <div
            className={`
              w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center
              ${selected === option.value ? "border-gray-900" : ""}
            `}
          >
            {selected === option.value && (
              <div className="w-2 h-2 bg-gray-900 rounded-full" />
            )}
          </div>
          <span className="text-gray-700">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default RadioBox;
