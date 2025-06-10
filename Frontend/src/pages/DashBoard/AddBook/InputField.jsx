import React from 'react';

const InputField = ({ label, name, type = 'text', register, placeholder, error }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {type === 'textarea' ? (
        <textarea
          {...register(name, { required: `${label} is required` })}
          className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${error ? 'border-red-500' : ''}`}
          placeholder={placeholder}
          rows="4"
        />
      ) : (
        <input
          type={type}
          {...register(name, { required: `${label} is required` })}
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

export default InputField;