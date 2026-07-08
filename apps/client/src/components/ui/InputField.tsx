import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const InputField = ({ label, error, className = '', ...props }: InputFieldProps) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label className="text-xs font-semibold text-industrial-gray tracking-wide uppercase">
        {label}
      </label>
      <input
        className={`px-3 py-2 border rounded-md text-sm bg-white text-industrial-dark focus:outline-none focus:ring-2 transition-all
          ${error ? 'border-red-500 focus:ring-red-200' : 'border-industrial-border focus:border-industrial-gray focus:ring-gray-100'}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
    </div>
  );
};