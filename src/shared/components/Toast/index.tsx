import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export const toast = (message: string, type: ToastType = 'success') => {
  const event = new CustomEvent('app-toast', { detail: { message, type } });
  window.dispatchEvent(event);
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Omit<ToastMessage, 'id'>>;
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { id, ...customEvent.detail };
      
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    window.addEventListener('app-toast', handleToastEvent);
    return () => window.removeEventListener('app-toast', handleToastEvent);
  }, []);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const borders = {
    success: 'border-emerald-100 bg-emerald-50/90 text-emerald-900',
    warning: 'border-amber-100 bg-amber-50/90 text-amber-900',
    error: 'border-red-100 bg-red-50/90 text-red-900',
    info: 'border-blue-100 bg-blue-50/90 text-blue-900',
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-xl pointer-events-auto animate-scale-in ${borders[t.type]}`}
        >
          <div className="shrink-0">{icons[t.type]}</div>
          <p className="text-xs font-semibold leading-snug">{t.message}</p>
        </div>
      ))}
    </div>
  );
};
