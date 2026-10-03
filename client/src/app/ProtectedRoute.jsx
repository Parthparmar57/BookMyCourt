import React from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roleHomePath } from '../shared/utils/roles';
import { ShieldAlert, ArrowLeft, LogOut, Loader2 } from 'lucide-react';

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
    const home = roleHomePath(role);
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest bg-amber-100 text-amber-800 px-3 py-1 rounded-full inline-block">
              403 • Access Restricted
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Staff Privilege Required</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your account is signed in as <strong className="text-slate-900 font-bold">{user?.name || 'User'}</strong> ({role}). 
              This section is reserved exclusively for: <strong className="text-slate-900">{roles.join(', ')}</strong>.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              to={home}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to My Workspace</span>
            </Link>

            <button
              onClick={logout}
              className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
