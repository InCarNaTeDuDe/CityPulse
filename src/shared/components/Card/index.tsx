import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = true,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] ${
        hoverable ? 'hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-neutral-200/80 dark:hover:border-neutral-700/50' : ''
      } transition duration-300 ${onClick ? 'cursor-pointer active:scale-[0.995]' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
export default Card;
