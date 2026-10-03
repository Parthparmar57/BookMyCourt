import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roleHomePath } from '../shared/utils/roles';

/**
 * Route guard. Wrap a route element with <ProtectedRoute roles={[...]} />.
 * - Not authenticated  -> redirect to /login (remembering where they came from).
 * - Authenticated but wrong role -> redirect to their own role's home.
 * - While the session is still bootstrapping, render a light placeholder.
 */
export const ProtectedRoute = ({ roles }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    return <Navigate to={roleHomePath(role)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
