import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.ADMIN_KEY': JSON.stringify(env.VITE_ADMIN_KEY || '2bahead2025'),
        'process.env.FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY || 'AIzaSyBZbBaWYldQLNYCzxOCdeI7sTyENaatmiw'),
        'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN || 'onboarding-2ba.firebaseapp.com'),
        'process.env.FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID || 'onboarding-2ba'),
        'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET || 'onboarding-2ba.firebasestorage.app'),
        'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID || '895920105930'),
        'process.env.FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID || '1:895920105930:web:dd02c519d4136f9b3bc733')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
