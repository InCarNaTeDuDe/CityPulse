import React from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  verified?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  size = 'md',
  className = '',
  verified = false,
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover border border-neutral-100 shadow-sm`}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className={`${sizes[size]} rounded-full bg-neutral-200 text-neutral-600 font-bold flex items-center justify-center border border-neutral-300 shadow-sm`}>
          {getInitials(name || 'U')}
        </div>
      )}
      {verified && (
        <span className="absolute bottom-0 right-0 block w-3.5 h-3.5 rounded-full bg-blue-500 ring-2 ring-white flex items-center justify-center" title="Verified Member">
          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </div>
  );
};
export default Avatar;
