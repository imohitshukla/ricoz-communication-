import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: string[];
  children?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userRole = user?.role || 'Agent';
  const isAuthorized = allowedRoles.some(
    (role) => role.toLowerCase() === userRole.toLowerCase()
  );

  if (!isAuthorized) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-950/50 min-h-[70vh]">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl" />
          <div className="w-14 h-14 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-rose-500/10">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
            Admin Access Required
          </span>

          <h2 className="text-xl font-black text-white mt-3 mb-2">Restricted Portal</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            You are logged in as an <span className="font-bold text-slate-200 uppercase bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">{userRole}</span>. This administrative portal requires privileges from: <span className="text-emerald-400 font-semibold">{allowedRoles.join(', ')}</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/dashboard/overview"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Overview
            </Link>
            <Link
              to="/dashboard/inbox"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              Go to Inbox
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
