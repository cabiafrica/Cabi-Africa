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
    placeholder,
    required = false,
}: InputFieldProps) {
    const { register, formState: { errors } } = useFormContext();

    return (
        <div className="flex flex-col">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                id={name}
                type={type}
                placeholder={placeholder}
                {...register(name)}
                className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none transition-colors ${errors[name] ? 'border-red-500' : 'border-gray-300'
                    }`}
            />
            {errors[name] && (
                <span className="text-sm text-red-500 mt-1">
                    {errors[name]?.message as string}
                </span>
            )}
        </div>
    );
}
