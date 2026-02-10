import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-[#1C1C8B] text-white hover:bg-[#051d59] active:bg-[#111d3b] disabled:bg-[#1C1C8B]',
    secondary: 'bg-white text-[#1C1C8B] border-2 border-[#1C1C8B] hover:bg-[#f3f0fa] active:bg-[#e8e3f5] disabled:border-[#1C1C8B] disabled:bg-white',
    tertiary: 'bg-transparent text-[#1C1C8B] hover:bg-[#f3f0fa] active:bg-[#e8e3f5] disabled:bg-transparent',
    danger: 'bg-[#C01F2F] text-white hover:bg-[#9A1926] active:bg-[#7A141E] disabled:bg-[#C01F2F]',
  };
  
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-[32px] px-3 text-[12px] rounded-[8px]',
    md: 'h-[40px] px-4 text-[14px] rounded-[8px]',
    lg: 'h-[48px] px-6 text-[14px] rounded-[8px]',
  };
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
