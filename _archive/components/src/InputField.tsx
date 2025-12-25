'use client';

import { useFormContext } from 'react-hook-form';

interface InputFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

export default function InputField({
  name,
  label,
  type = 'text',
  placeholder = '',
  required = false,
}: InputFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1">
        <input id={name} type={type} placeholder={placeholder} {...register(name)} className={`block w-full appearance-none rounded-md border px-3 py-2 shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`} />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" id={`${name}-error`}>
          {error.message?.toString()}
        </p>
      )}
    </div>
  );
}