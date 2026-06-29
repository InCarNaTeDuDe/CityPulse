import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Sleek page loader skeleton/fallback
const PageLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col items-center justify-center font-sans p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-neutral-200 dark:border-neutral-800 border-t-emerald-500 dark:border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

// Layouts - Dynamically split
const PublicLayout = React.lazy(() => import('./layouts/PublicLayout'));
const AuthLayout = React.lazy(() => import('./layouts/AuthLayout'));
const AppLayout = React.lazy(() => import('./layouts/AppLayout'));

// Pages - Dynamically split
const LoginPage = React.lazy(() => import('@/src/shared/auth/LoginPage'));
const HomeFeed = React.lazy(() => import('@/src/modules/daymates/pages/HomeFeed'));
const ChatsPage = React.lazy(() => import('@/src/modules/daymates/pages/ChatsPage'));
const NotificationsPage = React.lazy(() => import('@/src/modules/daymates/pages/NotificationsPage'));
const UserProfile = React.lazy(() => import('@/src/modules/profile/pages/UserProfile'));

export const AppRouter: React.FC = () => {
  return (
    <React.Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Landing & Login Flow */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Authenticated Application Flow */}
        <Route element={<AuthLayout />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomeFeed />} />
            <Route path="/chats" element={<ChatsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Catch All / Fallback Redirections */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRouter;
