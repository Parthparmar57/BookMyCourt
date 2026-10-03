import React, { createContext, useContext, useState } from 'react';
import { MOCK_USERS } from '../data/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Default to Visitor for landing page demo, but editable
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState('VISITOR'); // 'OWNER' | 'FRONT_DESK' | 'BAR_STAFF' | 'KITCHEN' | 'SHOP_STAFF' | 'MEMBER' | 'VISITOR'

  const loginAsRole = (role) => {
    setCurrentRole(role);
    if (role === 'VISITOR') {
      setCurrentUser(null);
      return;
    }
    const userMatch = MOCK_USERS.find(u => u.role === role) || MOCK_USERS[0];
    setCurrentUser(userMatch);
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole('VISITOR');
  };

  return (
    <AuthContext.Provider value={{ currentUser, currentRole, loginAsRole, logout, isAuthenticated: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
