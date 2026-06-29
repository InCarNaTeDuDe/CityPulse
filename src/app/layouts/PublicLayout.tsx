import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/src/shared/auth/useAuth';

export const PublicLayout: React.FC = () => {
  const { user } = useAuth();

  // If already authenticated, redirect away from public login page to active app feed
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-neutral-950 flex flex-col transition-colors duration-200">
      <Outlet />
    </div>
  );
};
export default PublicLayout;
