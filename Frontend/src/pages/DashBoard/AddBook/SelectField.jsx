import PropTypes from 'prop-types';

const SelectField = ({ label, name, options, register, error, rules }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      {...register(name, rules)}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
  </div>
);

SelectField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  register: PropTypes.func.isRequired,
  error: PropTypes.object,
  rules: PropTypes.object,
};

export default SelectField;