import PropTypes from 'prop-types';

const RadioBox = ({ name, options, register, watch, classname, readonly = false }) => {
  const selected = watch(name);

  return (
    <div className={classname}>
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex items-center gap-2 ${readonly ? '' : 'cursor-pointer'}`}
        >
          <input
            type="radio"
            value={option.value}
            {...register(name)}
            {...readonly === true ? { disabled: true } : {}}
            className="sr-only"
          />
          <div
            className={`
              w-4 h-4 rounded-full border-2 flex items-center justify-center
              ${selected === option.value ? "border-gray-900" : "border-gray-400"}
            `}
          >
            {selected === option.value && (
              <div className={`w-2 h-2 rounded-full bg-gray-900`} />
            )}
          </div>
          <span className={`text-gray-700`}>
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
};

RadioBox.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  register: PropTypes.func.isRequired,
  watch: PropTypes.func.isRequired,
  classname: PropTypes.string,
  readonly: PropTypes.bool,
};

export default RadioBox;
