import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './styles.css';

// Suppress known library warnings/logs to keep console clean
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('Platform browser has already been set')) return;
  originalWarn(...args);
};

const originalLog = console.log;
console.log = (...args) => {
  if (args[0]?.includes?.('Download the React DevTools')) return;
  originalLog(...args);
};

// Also React DevTools sometimes uses console.info


ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(7, 12, 24, 0.92)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#f8fafc',
                backdropFilter: 'blur(18px)',
              },
            }}
          />
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </>
);

