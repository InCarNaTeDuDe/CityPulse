import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        id="dialog-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-[2px] animate-fade-in"
      />

      {/* Dialog Panel */}
      <div
        id="dialog-panel"
        className="relative bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-neutral-100 z-50 overflow-hidden font-sans animate-scale-in"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-neutral-800 tracking-tight">{title}</h3>
          <button
            id="dialog-close"
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="text-sm text-neutral-600 mb-6 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};
export default Dialog;
