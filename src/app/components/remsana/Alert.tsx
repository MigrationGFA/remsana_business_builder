import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

type AlertVariant = 'error' | 'warning' | 'success' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({
  variant,
  title,
  message,
  dismissible = false,
  onDismiss,
  className = '',
}: AlertProps) {
  const icons = {
    error: AlertCircle,
    warning: AlertTriangle,
    success: CheckCircle,
    info: Info,
  };
  
  const variantStyles: Record<AlertVariant, string> = {
    error: 'bg-[#C01F2F]/10 border-[#C01F2F]/30 text-[#C01F2F]',
    warning: 'bg-[#A84B2F]/10 border-[#A84B2F]/30 text-[#A84B2F]',
    success: 'bg-[#218D8D]/10 border-[#218D8D]/30 text-[#218D8D]',
    info: 'bg-[#626C71]/10 border-[#626C71]/30 text-[#626C71]',
  };
  
  const Icon = icons[variant];
  
  return (
    <div
      className={`flex gap-3 p-4 rounded-[8px] border ${variantStyles[variant]} ${className}`}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && (
          <h4 className="font-semibold text-[14px] mb-1 text-[#1F2121]">
            {title}
          </h4>
        )}
        <p className="text-[14px] text-[#1F2121]">
          {message}
        </p>
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Dismiss alert"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
