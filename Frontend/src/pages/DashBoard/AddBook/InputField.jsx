import PropTypes from 'prop-types';

const InputField = ({ label, name, type = 'text', register, placeholder, error, rules }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {type === 'textarea' ? (
        <textarea
          {...register(name, rules)}
          className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${error ? 'border-red-500' : ''}`}
          placeholder={placeholder}
          rows="4"
        />
      ) : (
        <input
          type={type}
          {...register(name, rules)}
          className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${error ? 'border-red-500' : ''}`}
          placeholder={placeholder}
        />
      )}
      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  register: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.object,
  rules: PropTypes.object,
};

export default InputField;