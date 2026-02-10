import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: () => void;
}

export function ToastComponent({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#218D8D]" />,
    error: <XCircle className="w-5 h-5 text-[#C01F2F]" />,
    info: <Info className="w-5 h-5 text-[#1C1C8B]" />,
    warning: <AlertCircle className="w-5 h-5 text-[#A84B2F]" />,
  };

  const bgColors = {
    success: 'bg-[#218D8D]/10 border-[#218D8D]/30',
    error: 'bg-[#C01F2F]/10 border-[#C01F2F]/30',
    info: 'bg-[#1C1C8B]/10 border-[#1C1C8B]/30',
    warning: 'bg-[#A84B2F]/10 border-[#A84B2F]/30',
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-[8px] border shadow-lg min-w-[300px] max-w-[500px] animate-in slide-in-from-top-5 duration-200 ${bgColors[toast.type]}`}
    >
      {icons[toast.type]}
      <p className="flex-1 text-[14px] text-[#1F2121]">{toast.message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded-full hover:bg-black/10 transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4 text-[#6B7C7C]" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onClose={() => onClose(toast.id)} />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info', duration?: number) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, message, type, duration };
    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (message: string, duration?: number) => showToast(message, 'success', duration);
  const error = (message: string, duration?: number) => showToast(message, 'error', duration);
  const info = (message: string, duration?: number) => showToast(message, 'info', duration);
  const warning = (message: string, duration?: number) => showToast(message, 'warning', duration);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };
}
