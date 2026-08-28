import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Lock, User, AlertCircle, ArrowRight, ShieldCheck, Mail, CheckCircle2, KeyRound } from 'lucide-react';
import { login, registerStudent, verifyOtp, resendOtp, isAuthenticated, isStudent, getAuthUser } from '../services/api';
import { formatErrorMessage } from '../utils/errorFormatter';

export default function StudentLogin() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [usn, setUsn] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [gradYear, setGradYear] = useState('2026');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getAuthUser();
      const role = String(user.role || '').toUpperCase();
      if (role === 'STUDENT' || isStudent()) {
        navigate('/student/dashboard', { replace: true });
      } else if (role === 'PLACEMENT_OFFICER') {
        navigate('/placement/dashboard', { replace: true });
      } else {
        navigate('/admin', { replace: true });
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Please enter your USN / Email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const authData = await login(identifier.trim(), password, 'STUDENT', identifier.trim());
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, 'Student record not found. Please verify your USN or register below.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !usn.trim() || !password.trim()) {
      setErrorMsg('Please fill in all required registration fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await registerStudent({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        usn: usn.trim().toUpperCase(),
        department,
        graduation_year: gradYear,
        password
      });

      setSuccessMsg('Account created! A 6-digit OTP has been sent to your email.');
      setShowOtpScreen(true);
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, 'Registration failed. Please check the information provided.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMsg('Please enter the valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await verifyOtp(email.trim().toLowerCase(), otp.trim());
      setSuccessMsg('Email verified successfully! You can now log in.');
      setShowOtpScreen(false);
      setIsRegister(false);
      setIdentifier(usn.trim().toUpperCase() || email.trim().toLowerCase());
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, 'Invalid or expired OTP. Please request a new code.'));
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
              STUDENT CAREER PORTAL
            </div>
          </div>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
            Discover your strengths. Understand your career direction.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-8 space-y-6">
          {/* Header Tabs */}
          {!showOtpScreen && (
            <div className="flex border-b border-zinc-200 pb-1">
              <button
                type="button"
                onClick={() => { setIsRegister(false); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 pb-3 text-xs font-bold transition-all ${
                  !isRegister
                    ? 'text-zinc-900 border-b-2 border-yellow-400'
                    : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 pb-3 text-xs font-bold transition-all ${
                  isRegister
                    ? 'text-zinc-900 border-b-2 border-yellow-400'
                    : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                Register Account
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {showOtpScreen ? (
            /* OTP Verification Screen */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1 pb-2">
                <div className="text-sm font-bold text-zinc-900">Verify Your Email Address</div>
                <p className="text-xs text-zinc-500">Enter the 6-digit code sent to <span className="font-semibold text-zinc-800">{email}</span></p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2 text-center">
                  6-Digit Verification OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  required
                  autoFocus
                  className="w-full py-3 bg-zinc-50 border border-zinc-300 text-zinc-900 text-center font-mono text-xl tracking-widest font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-zinc-900 hover:bg-black text-yellow-400 hover:text-yellow-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                {loading ? 'Verifying OTP...' : 'Verify & Activate Account'}
              </button>

              <button
                type="button"
                onClick={() => setShowOtpScreen(false)}
                className="w-full text-center text-xs font-semibold text-zinc-500 hover:text-zinc-900 pt-2"
              >
                ← Back to Registration
              </button>
            </form>
          ) : !isRegister ? (
            /* Sign In Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                  USN / Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 1CS23101 or student@college.edu"
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
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-300 text-zinc-900 placeholder-zinc-400 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-zinc-900 hover:bg-black text-yellow-400 hover:text-yellow-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In to Student Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    University USN
                  </label>
                  <input
                    type="text"
                    value={usn}
                    onChange={(e) => setUsn(e.target.value.toUpperCase())}
                    placeholder="e.g. 1CS23101"
                    required
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs uppercase font-mono rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Branch / Dept
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ISE">ISE</option>
                    <option value="AIML">AIML</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Email Address (for OTP verification)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@college.edu"
                  required
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Create Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-zinc-900 hover:bg-black text-yellow-400 hover:text-yellow-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 mt-1"
              >
                {loading ? 'Creating Account...' : 'Register & Receive OTP'}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <Link
              to="/placement/login"
              className="font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Placement Officer Portal →
            </Link>
            <Link
              to="/login"
              className="font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Portal Gateway
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
