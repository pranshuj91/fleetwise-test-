import React, { createContext, useContext, useState, useEffect } from 'react';
// TODO: Lovable will implement Supabase auth here
import { mockUser } from '../services/mockData';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // CRITICAL: Initialize with mock user immediately to prevent blank screen
  // TODO: Lovable will implement real Supabase authentication here
  const [user, setUser] = useState(mockUser); // Start with user, not null
  const [loading, setLoading] = useState(false); // Start as not loading

  useEffect(() => {
    // AUTO-LOGIN: Bypass authentication for frontend-only mode
    // Set user immediately to prevent any loading state
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.id) {
          setUser(parsed);
        } else {
          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
          localStorage.setItem('token', 'mock-token');
        }
      } catch (e) {
        // If parse fails, use mock user
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'mock-token');
      }
    } else {
      // Auto-login with mock user
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock-token');
    }
    
    // Ensure loading is false
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // TODO: Lovable will implement real login with Supabase
    // For now, always succeed and use mock user
    const token = 'mock-token-' + Date.now();
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
    
    return { success: true };
  };

  const logout = () => {
    // Keep user logged in for demo (but clear storage if needed)
    // localStorage.removeItem('token');
    // localStorage.removeItem('user');
    // setUser(null);
    // For demo, we'll keep auto-login but you can uncomment above for real logout
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isMasterAdmin: user?.role === 'master_admin',
    isCompanyAdmin: user?.role === 'company_admin' || user?.role === 'master_admin',
    isTechnician: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
