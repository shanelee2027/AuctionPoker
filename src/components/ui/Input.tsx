'use client';

import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-300">{label}</label>
      )}
      <input
        className={`
          px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg
          text-white placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
