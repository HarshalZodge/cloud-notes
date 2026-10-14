import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getGoogleClientId, 
  setGoogleClientId, 
  initGoogleTokenClient, 
  requestGoogleAccessToken,
  revokeGoogleToken 
} from '../services/googleAuth.js';
import { DEMO_USER } from '../services/demoData.js';

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  AUTH_USER: 'cloudnotes_auth_user',
  TOKEN_DATA: 'cloudnotes_token_data',
  IS_DEMO: 'cloudnotes_is_demo'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [authStatus, setAuthStatus] = useState('loading'); // 'loading' | 'authenticated' | 'unauthenticated' | 'demo'
  const [authError, setAuthError] = useState(null);
  const [clientId, setClientIdState] = useState(() => getGoogleClientId());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Restore session from localStorage on startup
  useEffect(() => {
    try {
      const isDemoSession = localStorage.getItem(STORAGE_KEYS.IS_DEMO) === 'true';
      if (isDemoSession) {
        setUser(DEMO_USER);
        setAuthStatus('demo');
        return;
      }

      const storedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN_DATA);

      if (storedUser && storedToken) {
        const parsedToken = JSON.parse(storedToken);
        const parsedUser = JSON.parse(storedUser);

        // Check if token is still valid (not expired)
        if (parsedToken.expiresAt && Date.now() < parsedToken.expiresAt - 60000) {
          setUser(parsedUser);
          setTokenData(parsedToken);
          setAuthStatus('authenticated');
          return;
        } else {
          // Token expired, clear or request re-auth
          localStorage.removeItem(STORAGE_KEYS.TOKEN_DATA);
          setUser(null);
          setAuthStatus('unauthenticated');
          return;
        }
      }
    } catch (e) {
      console.warn('Failed restoring auth session:', e);
    }
    setAuthStatus('unauthenticated');
  }, []);

  const updateClientId = useCallback((newId) => {
    setGoogleClientId(newId);
    setClientIdState(newId ? newId.trim() : '');
  }, []);

  const handleAuthSuccess = useCallback(({ tokenInfo, user: authedUser }) => {
    setTokenData(tokenInfo);
    setUser(authedUser);
    setAuthStatus('authenticated');
    setAuthError(null);
    localStorage.removeItem(STORAGE_KEYS.IS_DEMO);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(authedUser));
    localStorage.setItem(STORAGE_KEYS.TOKEN_DATA, JSON.stringify(tokenInfo));
  }, []);

  const handleAuthError = useCallback((err) => {
    console.error('OAuth token error:', err);
    let message = 'Google sign-in could not be completed.';
    if (err.error === 'popup_closed_by_user') {
      message = 'Sign-in window was closed before completing authorization.';
    } else if (err.error === 'access_denied') {
      message = 'Google Drive permission was not granted.';
    } else if (err.error_description) {
      message = err.error_description;
    }
    setAuthError(message);
  }, []);

  const signInWithGoogle = useCallback((customPrompt = '') => {
    setAuthError(null);
    try {
      initGoogleTokenClient(handleAuthSuccess, handleAuthError, customPrompt);
      requestGoogleAccessToken(customPrompt);
    } catch (err) {
      console.error('Sign-in initiation error:', err);
      setAuthError(err.message || 'Could not launch Google authentication.');
    }
  }, [handleAuthSuccess, handleAuthError]);

  const enterDemoMode = useCallback(() => {
    setUser(DEMO_USER);
    setTokenData(null);
    setAuthStatus('demo');
    setAuthError(null);
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, 'true');
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_DATA);
  }, []);

  const signOut = useCallback(() => {
    if (tokenData?.accessToken) {
      revokeGoogleToken(tokenData.accessToken, () => {
        console.debug('Google token revoked successfully.');
      });
    }
    setUser(null);
    setTokenData(null);
    setAuthStatus('unauthenticated');
    setAuthError(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_DATA);
    localStorage.removeItem(STORAGE_KEYS.IS_DEMO);
  }, [tokenData]);

  const reconnectGoogle = useCallback(() => {
    signInWithGoogle('consent');
  }, [signInWithGoogle]);

  const isTokenExpired = tokenData?.expiresAt ? Date.now() >= tokenData.expiresAt : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        tokenData,
        accessToken: tokenData?.accessToken || null,
        authStatus,
        authError,
        isOnline,
        isTokenExpired,
        clientId,
        updateClientId,
        signInWithGoogle,
        enterDemoMode,
        signOut,
        reconnectGoogle,
        clearAuthError: () => setAuthError(null)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
