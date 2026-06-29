import React from 'react';
import { useAuth } from '@/src/shared/auth/useAuth';
import { Award, ShieldCheck, ChevronRight, LogOut, Settings2, HelpCircle, UserCheck } from 'lucide-react';
import { toast } from '@/src/shared/components/Toast';

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogoutClick = () => {
    logout();
    toast('Logged out successfully.');
  };

  return (
    <div className="px-5 py-6 font-sans max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 
          style={{ fontSize: 'clamp(1.125rem, 5vw, 1.625rem)' }}
          className="font-black text-neutral-900 dark:text-white tracking-tight"
        >
          Profile
        </h2>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 font-bold mt-0.5">Manage your identity and app configurations</p>
      </div>

      {/* User Card */}
      <div className="bg-neutral-900 dark:bg-neutral-900 text-white rounded-3xl p-6 mb-6 relative overflow-hidden shadow-xl shadow-neutral-900/10 border border-neutral-850">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
        
        <div className="flex gap-4 items-center">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=fff&bold=true`}
            alt={user?.name || 'User'}
            className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md shadow-emerald-500/10"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="text-lg font-extrabold tracking-tight">{user?.name || 'Bharath'}</h3>
              <span className="p-0.5 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md shadow-emerald-500/20" title="Verified Identity">
                <UserCheck className="w-3 h-3" />
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-medium">{user?.email || 'bharatmaska163@gmail.com'}</p>
            
            <div className="flex items-center gap-1 bg-white/10 px-2.5 py-0.5 rounded-full w-fit mt-2 text-[10px] font-black tracking-wide text-emerald-400">
              <span>⭐ {user?.rating || 4.9} rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <h4 className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">Your Metrics</h4>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80 p-3.5 rounded-2xl text-center">
          <p className="text-lg font-black text-neutral-800 dark:text-neutral-100">{user?.activitiesJoinedCount ?? 0}</p>
          <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold uppercase mt-1">Joined</p>
        </div>
        <div className="bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80 p-3.5 rounded-2xl text-center">
          <p className="text-lg font-black text-neutral-800 dark:text-neutral-100">{user?.ticketsSoldCount ?? 0}</p>
          <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold uppercase mt-1">Sold</p>
        </div>
        <div className="bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80 p-3.5 rounded-2xl text-center">
          <p className="text-lg font-black text-neutral-800 dark:text-neutral-100">{user?.ticketsBoughtCount ?? 0}</p>
          <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold uppercase mt-1">Bought</p>
        </div>
      </div>

      {/* Settings Options List */}
      <h4 className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">Settings & Support</h4>
      <div className="flex flex-col gap-2 mb-8">
        <button className="flex items-center justify-between p-4 border border-neutral-100 dark:border-neutral-800/80 rounded-2xl bg-white dark:bg-neutral-900 hover:bg-neutral-50/50 dark:hover:bg-neutral-800 transition text-left cursor-pointer">
          <div className="flex items-center gap-3">
            <Settings2 className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Account Configurations</span>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
        </button>

        <button className="flex items-center justify-between p-4 border border-neutral-100 dark:border-neutral-800/80 rounded-2xl bg-white dark:bg-neutral-900 hover:bg-neutral-50/50 dark:hover:bg-neutral-800 transition text-left cursor-pointer">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Identity Verification Status</span>
          </div>
          <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 px-2 py-0.5 rounded-full">VERIFIED</span>
        </button>

        <button className="flex items-center justify-between p-4 border border-neutral-100 dark:border-neutral-800/80 rounded-2xl bg-white dark:bg-neutral-900 hover:bg-neutral-50/50 dark:hover:bg-neutral-800 transition text-left cursor-pointer">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Help & Discrepancies</span>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
        </button>

        <button
          id="logout-button"
          onClick={handleLogoutClick}
          className="flex items-center justify-between p-4 border border-red-100 dark:border-red-950/40 rounded-2xl bg-red-50/40 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20 transition text-left mt-2 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-xs font-bold text-red-600 dark:text-red-400">Disconnect & Log Out</span>
          </div>
          <ChevronRight className="w-4 h-4 text-red-400 dark:text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
