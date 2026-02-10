import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'basic' | 'hoverable' | 'clickable';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  variant = 'basic',
  padding = 'md',
  className = '',
  onClick,
}: CardProps) {
  const baseStyles = 'bg-white rounded-[8px] border border-[#6B7C7C]/20 transition-all duration-200';
  
  const variantStyles = {
    basic: '',
    hoverable: 'hover:shadow-lg hover:border-[#1C1C8B]/30',
    clickable: 'cursor-pointer hover:shadow-lg hover:border-[#1C1C8B]/50 active:scale-[0.98]',
  };
  
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-[18px] font-semibold text-[#1F2121] ${className}`}>
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-[#6B7C7C]/20 ${className}`}>
      {children}
    </div>
  );
}
