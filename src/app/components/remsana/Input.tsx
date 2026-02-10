import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  disabled,
  ...props
}: InputProps) {
  const baseStyles = 'w-full h-[40px] px-3 rounded-[4px] border transition-all duration-200';
  const stateStyles = error
    ? 'border-[#C01F2F] focus:border-[#C01F2F] focus:ring-2 focus:ring-[#C01F2F]/20'
    : 'border-[#6B7C7C]/30 focus:border-[#1C1C8B] focus:ring-2 focus:ring-[#1C1C8B]/20';
  const disabledStyles = disabled ? 'bg-[#f3f0fa] cursor-not-allowed opacity-60' : 'bg-white';
  
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-[14px] font-normal text-[#1F2121]">
          {label}
        </label>
      )}
      <input
        className={`${baseStyles} ${stateStyles} ${disabledStyles} ${className} outline-none`}
        disabled={disabled}
        {...props}
      />
      {error && (
        <p className="mt-1 text-[12px] text-[#C01F2F]">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-[12px] text-[#6B7C7C]">{helperText}</p>
      )}
    </div>
  );
}
