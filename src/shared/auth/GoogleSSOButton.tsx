import React from 'react';
import { Chrome } from 'lucide-react';

interface GoogleSSOButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export const GoogleSSOButton: React.FC<GoogleSSOButtonProps> = ({ onClick, isLoading }) => {
  return (
    <button
      id="google-sso-btn"
      onClick={onClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-neutral-200 hover:border-neutral-300 rounded-xl font-medium text-neutral-800 bg-white hover:bg-neutral-50 active:bg-neutral-100 transition shadow-sm disabled:opacity-50"
    >
      <Chrome className="w-5 h-5 text-red-500" />
      {isLoading ? 'Connecting...' : 'Continue with Google'}
    </button>
  );
};
