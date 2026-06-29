import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  className = '',
}) => {
  const styles = {
    primary: 'bg-neutral-900 text-white',
    secondary: 'bg-neutral-100 text-neutral-800',
    success: 'bg-green-50 text-green-700 border border-green-200/50',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/50',
    danger: 'bg-red-50 text-red-700 border border-red-200/50',
    info: 'bg-blue-50 text-blue-700 border border-blue-200/50',
    accent: 'bg-purple-50 text-purple-700 border border-purple-200/50',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};
export default Badge;
