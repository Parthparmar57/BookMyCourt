import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { currentUser } = useAuth();

  if (!allowedRoles.includes(currentUser.role)) {
    // Redirect unauthorized user to their own primary home route
    switch (currentUser.role) {
      case 'owner': return <Navigate to="/admin" replace />;
      case 'frontdesk': return <Navigate to="/staff/frontdesk" replace />;
      case 'bar': return <Navigate to="/staff/bar/tables" replace />;
      case 'kitchen': return <Navigate to="/staff/kitchen" replace />;
      case 'shop': return <Navigate to="/staff/shop/pos" replace />;
      case 'member': return <Navigate to="/member" replace />;
      default: return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
