import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'gold' | 'primary';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({
  children,
  variant = 'neutral',
  className = '',
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-3 py-1 rounded-[99px] text-[12px] font-medium';
  
  const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-[#218D8D]/10 text-[#218D8D] border border-[#218D8D]/20',
    warning: 'bg-[#A84B2F]/10 text-[#A84B2F] border border-[#A84B2F]/20',
    error: 'bg-[#C01F2F]/10 text-[#C01F2F] border border-[#C01F2F]/20',
    info: 'bg-[#626C71]/10 text-[#626C71] border border-[#626C71]/20',
    neutral: 'bg-[#6B7C7C]/10 text-[#6B7C7C] border border-[#6B7C7C]/20',
    gold: 'bg-[#eda51f]/10 text-[#eda51f] border border-[#eda51f]/20',
    primary: 'bg-[#1C1C8B]/10 text-[#1C1C8B] border border-[#1C1C8B]/20',
  };
  
  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
