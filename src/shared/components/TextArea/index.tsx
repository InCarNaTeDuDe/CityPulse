import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 font-sans">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={ref}
          className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900/60 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/60 focus:bg-white dark:focus:bg-neutral-950 border border-transparent focus:border-neutral-200 dark:focus:border-neutral-800 hover:border-neutral-200/50 dark:hover:border-neutral-800/50 rounded-xl text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none transition min-h-[100px] resize-none shadow-inner dark:shadow-none focus:shadow-none ${className}`}
          {...props}
        />
        {error && <span className="text-[11px] text-red-500 font-medium pl-1">{error}</span>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
export default TextArea;
