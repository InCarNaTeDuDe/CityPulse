import React from 'react';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionButton?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Search className="w-10 h-10 text-neutral-300" />,
  title,
  description,
  actionButton,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-neutral-200/80 rounded-2xl bg-neutral-50/50 my-4 font-sans">
      <div className="mb-3.5 p-3.5 bg-neutral-100 rounded-full text-neutral-400 shadow-inner">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-neutral-800 tracking-tight mb-1">{title}</h3>
      <p className="text-xs text-neutral-500 max-w-xs leading-normal mb-5">{description}</p>
      {actionButton && <div className="animate-fade-in">{actionButton}</div>}
    </div>
  );
};
export default EmptyState;
