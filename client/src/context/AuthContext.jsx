import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { setAccessToken } from '../lib/apiClient';

const AuthContext = createContext(null);

// Clean name and derive first letter of the first name
const getFirstLetter = (name) => {
  if (!name) return 'U';
  const clean = name.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  return (clean.charAt(0) || 'U').toUpperCase();
};

const cleanDisplayName = (name) => {
  if (!name) return 'User';
  return name.replace(/\s*\([^)]*\)\s*/g, ' ').trim() || name;
};

// Server users have no avatar; generate a stable initials-based one for the UI.
const withAvatar = (user) => {
  if (!user) return null;
  const cleanName = cleanDisplayName(user.name);
  const initial = user.initial || getFirstLetter(cleanName);
  return {
    ...user,
    name: cleanName,
    initial,
    avatar:
      user.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=1b4332&color=ffffff&bold=true&length=1&size=128`,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load the in-memory access token is gone, so silently re-establish the
  // session from the httpOnly refresh cookie (if any), then hydrate from /auth/me.
  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      try {
        const { accessToken } = await authService.refresh();
        if (!accessToken) throw new Error('No active session');
        setAccessToken(accessToken);
        const me = await authService.me();
        if (active) setUser(withAvatar(me));
      } catch {
        setAccessToken(null);
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  // apiClient fires this when a refresh fails — force a clean logout.
  useEffect(() => {
    const onForcedLogout = () => {
      setAccessToken(null);
      setUser(null);
    };
    window.addEventListener('auth:logout', onForcedLogout);
    return () => window.removeEventListener('auth:logout', onForcedLogout);
  }, []);

  const login = useCallback(async (login, password) => {
    const data = await authService.login({ login, password });
    setAccessToken(data.accessToken); // in memory only; refresh token is the httpOnly cookie
    setUser(withAvatar(data.user));
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    setAccessToken(data.accessToken);
    setUser(withAvatar(data.user));
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* ignore network/logout errors — clear locally regardless */
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  const role = user?.role || 'VISITOR';

  const value = {
    // Phase 2 API
    user,
    role,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    // Backward-compatible aliases used by existing components
    currentUser: user,
    currentRole: role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
