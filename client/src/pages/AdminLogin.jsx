import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { login, isAuthenticated, isPlacementAdmin, getAuthUser } from '../services/api';
import { formatErrorMessage } from '../utils/errorFormatter';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getAuthUser();
      const role = String(user.role || '').toUpperCase();
      if (role === 'PLATFORM_ADMIN' || role === 'PLACEMENT_ADMIN' || role === 'ADMIN' || isPlacementAdmin()) {
        navigate('/admin', { replace: true });
      } else if (role === 'OPERATIONS') {
        navigate('/admin', { replace: true });
      } else if (role === 'PLACEMENT_OFFICER') {
        navigate('/placement/dashboard', { replace: true });
      } else if (role === 'STUDENT') {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter your administrator username/email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const authData = await login(username.trim(), password, 'PLATFORM_ADMIN');
      const verifiedRole = String(authData.role || '').toUpperCase();
      
      if (verifiedRole === 'PLATFORM_ADMIN' || verifiedRole === 'PLACEMENT_ADMIN' || verifiedRole === 'ADMIN' || verifiedRole === 'OPERATIONS') {
        navigate('/admin', { replace: true });
      } else if (verifiedRole === 'PLACEMENT_OFFICER') {
        navigate('/placement/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, 'Invalid Platform Administrator credentials. Please verify your username and password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-zinc-900 flex flex-col justify-center items-center p-6 font-sans selection:bg-yellow-400 selection:text-black">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-zinc-200 p-1 shadow-sm mb-1">
            <img
              src="/logo.jpg"
              alt="Genesis CareerFit"
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="font-black text-xl text-zinc-900">G</span>';
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">
              GENESIS CAREERFIT
            </h1>
            <div className="inline-block mt-1 px-3 py-1 bg-yellow-100 border border-yellow-300 text-yellow-900 text-[11px] font-extrabold tracking-widest uppercase rounded-full">
              Platform Administration
            </div>
          </div>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
            Manage institutions, assessment data, career intelligence, reports and platform operations.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3 pb-5 border-b border-zinc-100">
            <div className="p-2.5 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">
                Genesis Platform Administration
              </h2>
              <p className="text-xs text-zinc-500">Restricted Genesis internal infrastructure</p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                Admin Email / Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin or admin@genesiscareerfit.ai"
                  required
                  autoFocus
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-300 text-zinc-900 placeholder-zinc-400 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-300 text-zinc-900 placeholder-zinc-400 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-zinc-900 hover:bg-black text-yellow-400 hover:text-yellow-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Authenticating Admin...</span>
              ) : (
                <>
                  <span>Sign In to Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Secure reset guidance */}
          <div className="pt-4 border-t border-zinc-100 text-center space-y-1.5">
            <div className="text-[11px] text-zinc-500 font-medium flex items-center justify-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
              <span>Forgot or Need to Reset Admin Password?</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">
              Execute <code className="bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded">python scripts/set_admin_password.py</code> on the server terminal.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            to="/login"
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            ← Back to Portal Gateway
          </Link>
        </div>
      </div>
    </div>
  );
}
