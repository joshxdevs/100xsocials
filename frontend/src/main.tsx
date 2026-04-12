import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './hooks/useAuth';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0F172A',
              color: '#e5e2e1',
              border: '1px solid rgba(41,112,255,0.2)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#00F5FF', secondary: '#0F172A' } },
            error: { iconTheme: { primary: '#ff4444', secondary: '#0F172A' } },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
