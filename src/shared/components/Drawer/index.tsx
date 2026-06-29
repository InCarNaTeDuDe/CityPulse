import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  // Lock body scroll when drawer is open
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
    <>
      {/* Backdrop */}
      <div
        id="drawer-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px] animate-fade-in"
      />

      {/* Sheet Container */}
      <div
        id="drawer-container"
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-neutral-950 rounded-t-[2.5rem] shadow-[0_-8px_32px_rgba(0,0,0,0.08)] border-t border-neutral-100 dark:border-neutral-900 z-50 overflow-hidden font-sans pb-safe text-neutral-900 dark:text-neutral-100 animate-slide-up"
      >
        {/* Grab Handle */}
        <div className="flex justify-center py-3.5 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-700 transition" />
        </div>

        {/* Header */}
        {(title || onClose) && (
          <div className="px-6 pb-2 flex justify-between items-center border-b border-neutral-50 dark:border-neutral-900">
            {title ? (
              <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-100 tracking-tight hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-200 cursor-pointer">
                {title}
              </h3>
            ) : (
              <div />
            )}
            <button
              id="drawer-close-btn"
              onClick={onClose}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
};
export default Drawer;
