import React from 'react';

interface LinearProgressProps {
  value: number; // 0-100
  showLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LinearProgress({
  value,
  showLabel = false,
  color = 'primary',
  size = 'md',
  className = '',
}: LinearProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  
  const colorStyles = {
    primary: 'bg-[#1C1C8B]',
    success: 'bg-[#218D8D]',
    warning: 'bg-[#A84B2F]',
    error: 'bg-[#C01F2F]',
    gold: 'bg-[#eda51f]',
  };
  
  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };
  
  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full ${sizeStyles[size]} bg-[#6B7C7C]/20 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${colorStyles[color]} transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-[12px] text-[#6B7C7C] text-right">
          {clampedValue}%
        </div>
      )}
    </div>
  );
}

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'gold';
}

export function CircularProgress({
  value,
  size = 80,
  strokeWidth = 6,
  showLabel = true,
  color = 'primary',
}: CircularProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;
  
  const colorStyles = {
    primary: '#1C1C8B',
    success: '#218D8D',
    warning: '#A84B2F',
    error: '#C01F2F',
    gold: '#eda51f',
  };
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#6B7C7C20"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorStyles[color]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[14px] font-semibold text-[#1F2121]">
            {clampedValue}%
          </span>
        </div>
      )}
    </div>
  );
}
