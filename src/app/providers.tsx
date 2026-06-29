import React from 'react';
import { AuthProvider } from '@/src/shared/auth/AuthProvider';
import { ThemeProvider } from '@/src/shared/theme/ThemeContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
};

export default AppProviders;
