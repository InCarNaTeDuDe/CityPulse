import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/src/shared/auth/useAuth';

export const AuthLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100/50 flex flex-col justify-center items-center font-sans">
        <div className="w-10 h-10 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-neutral-500 mt-3">Verifying authentication...</p>
      </div>
    );
  }

  // If not authenticated, redirect to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
export default AuthLayout;
