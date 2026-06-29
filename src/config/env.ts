export const ENV = {
  APP_URL: (import.meta as any).env?.VITE_APP_URL || 'https://localhost:3000',
  ENV_MODE: (import.meta as any).env?.MODE || 'development',
  GOOGLE_CLIENT_ID: (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '',
};
