import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roleHomePath } from '../shared/utils/roles';
import { Loader2 } from 'lucide-react';

/**
 * Route guard. Wrap a route element with <ProtectedRoute roles={[...]} />.
 * - Not authenticated -> redirect to /login (remembering where they came from).
 * - Authenticated but wrong role -> render a clean 403 Access Denied banner.
 * - While session is bootstrapping -> render sleek loading state.
 */
export const ProtectedRoute = ({ roles }) => {
  const { isAuthenticated, isLoading, role, user, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <span className="text-xs font-semibold tracking-wide text-slate-400">Verifying session…</span>
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
