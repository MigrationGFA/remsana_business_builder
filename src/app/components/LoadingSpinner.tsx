import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-[#1C1C8B]`} />
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="min-h-screen bg-[#f3f0fa] flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-[14px] text-[#6B7C7C]">Loading...</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-[8px] border border-[#6B7C7C]/20 p-6 animate-pulse">
      <div className="h-4 bg-[#f3f0fa] rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-[#f3f0fa] rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-[#f3f0fa] rounded w-2/3"></div>
    </div>
  );
}
