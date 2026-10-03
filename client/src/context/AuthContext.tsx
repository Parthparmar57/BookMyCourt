import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User;
  switchRole: (role: UserRole) => void;
  setUser: (user: User) => void;
  allRoleUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default active user is Front Desk for instant operational desk view, or Owner
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('champions_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return MOCK_USERS[1]; // Front Desk default
  });

  useEffect(() => {
    localStorage.setItem('champions_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const switchRole = (role: UserRole) => {
    const target = MOCK_USERS.find(u => u.role === role) || MOCK_USERS[0];
    setCurrentUser(target);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchRole,
        setUser: setCurrentUser,
        allRoleUsers: MOCK_USERS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
