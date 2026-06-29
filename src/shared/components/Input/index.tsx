import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 font-sans">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-4 text-neutral-400 dark:text-neutral-500">
              {icon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={`w-full ${
              icon ? 'pl-11' : 'pl-4'
            } pr-4 py-3 bg-neutral-50 dark:bg-neutral-900/60 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/60 focus:bg-white dark:focus:bg-neutral-950 border border-transparent focus:border-neutral-200 dark:focus:border-neutral-800 hover:border-neutral-200/50 dark:hover:border-neutral-800/50 rounded-xl text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none transition shadow-inner dark:shadow-none focus:shadow-none ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-[11px] text-red-500 font-medium pl-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
