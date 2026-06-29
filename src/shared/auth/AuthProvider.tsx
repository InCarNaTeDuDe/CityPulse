import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, Activity, Ticket, Conversation, NotificationItem } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: (name: string, email: string) => Promise<void>;
  loginWithGoogleCredential: (credential: string) => Promise<void>;
  logout: () => void;
  updateUserWallet: (amount: number) => void;
  updateUserStats: (type: 'joined' | 'sold' | 'bought', count: number) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


// Initial Mock Data
const INITIAL_ACTIVITIES: Activity[] = [];
const INITIAL_TICKETS: Ticket[] = [];
const INITIAL_CHATS: Conversation[] = [];
const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFreshUser = async (u: User) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'x-user-id': u.id,
          'x-user-name': u.name,
          'x-user-email': u.email,
          'x-user-avatar': u.avatar || '',
        },
      });
      if (res.ok) {
        const fresh = await res.json();
        setUser(fresh);
        localStorage.setItem('dm_ts_user', JSON.stringify(fresh));
      }
    } catch (e) {
      console.error('Failed to sync auth user with database', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // For a forced clean slate of old mock/static data
    if (!localStorage.getItem('dm_clean_slate_v3')) {
      localStorage.removeItem('dm_activities');
      localStorage.removeItem('ts_tickets');
      localStorage.removeItem('dm_chats');
      localStorage.removeItem('dm_notifications');
      localStorage.setItem('dm_clean_slate_v3', 'true');
    }

    const savedUser = localStorage.getItem('dm_ts_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      fetchFreshUser(parsed);
    } else {
      setLoading(false);
    }

    // Initialize client local backups
    if (!localStorage.getItem('dm_activities')) {
      localStorage.setItem('dm_activities', JSON.stringify(INITIAL_ACTIVITIES));
    }
    if (!localStorage.getItem('ts_tickets')) {
      localStorage.setItem('ts_tickets', JSON.stringify(INITIAL_TICKETS));
    }
    if (!localStorage.getItem('dm_chats')) {
      localStorage.setItem('dm_chats', JSON.stringify(INITIAL_CHATS));
    }
    if (!localStorage.getItem('dm_notifications')) {
      localStorage.setItem('dm_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
    }
  }, []);

  const loginWithGoogle = async (name: string, email: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const cleanName = name.trim() || 'Google User';
    const cleanEmail = email.trim() || 'user@gmail.com';
    const id = `google_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const loggedUser: User = {
      id,
      name: cleanName,
      email: cleanEmail,
      /* Hardcoded Unsplash stock profile picture removed per user request:
         avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', */
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=3b82f6&color=fff&bold=true`,
      rating: 4.9,
      activitiesJoinedCount: 0,
      ticketsSoldCount: 0,
      ticketsBoughtCount: 0,
      identityVerified: true,
      walletBalance: 500,
    };

    setUser(loggedUser);
    localStorage.setItem('dm_ts_user', JSON.stringify(loggedUser));

    // Register with backend
    await fetchFreshUser(loggedUser);
  };

  const loginWithGoogleCredential = async (credential: string) => {
    try {
      // Decode JWT token locally
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      const cleanName = payload.name || payload.given_name || 'Google User';
      
      const loggedUser: User = {
        id: `google_${payload.sub || Date.now()}`,
        name: cleanName,
        email: payload.email || 'user@gmail.com',
        /* Hardcoded fallback profile picture commented out per user request:
           avatar: payload.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', */
        avatar: payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=3b82f6&color=fff&bold=true`,
        rating: 4.9,
        activitiesJoinedCount: 0,
        ticketsSoldCount: 0,
        ticketsBoughtCount: 0,
        identityVerified: true,
        walletBalance: 500, // starting balance
      };
      
      setUser(loggedUser);
      localStorage.setItem('dm_ts_user', JSON.stringify(loggedUser));

      // Register with backend
      await fetchFreshUser(loggedUser);
    } catch (err) {
      console.error('Error logging in with Google credential', err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dm_ts_user');
  };

  const updateUserWallet = async (amount: number) => {
    if (!user) return;
    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-name': user.name,
          'x-user-email': user.email,
        },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem('dm_ts_user', JSON.stringify(updatedUser));
      } else {
        // Fallback locally if network fails
        const updated = { ...user, walletBalance: user.walletBalance + amount };
        setUser(updated);
        localStorage.setItem('dm_ts_user', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to top up wallet on server', e);
      const updated = { ...user, walletBalance: user.walletBalance + amount };
      setUser(updated);
      localStorage.setItem('dm_ts_user', JSON.stringify(updated));
    }
  };

  const updateUserStats = (type: 'joined' | 'sold' | 'bought', count: number) => {
    if (!user) return;
    let updated = { ...user };
    if (type === 'joined') {
      updated.activitiesJoinedCount += count;
    } else if (type === 'sold') {
      updated.ticketsSoldCount += count;
    } else if (type === 'bought') {
      updated.ticketsBoughtCount += count;
    }
    setUser(updated);
    localStorage.setItem('dm_ts_user', JSON.stringify(updated));
  };

  const refreshUser = async () => {
    if (user) {
      await fetchFreshUser(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithGoogleCredential,
        logout,
        updateUserWallet,
        updateUserStats,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
