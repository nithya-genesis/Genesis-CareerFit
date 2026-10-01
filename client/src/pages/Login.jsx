import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Building2, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { isAuthenticated, isPlacementAdmin, isPlacementOfficer, isStudent } from '../services/api';

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      if (isPlacementAdmin()) navigate('/admin', { replace: true });
      else if (isPlacementOfficer()) navigate('/placement/dashboard', { replace: true });
      else if (isStudent()) navigate('/student/dashboard', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-zinc-900 flex flex-col justify-between p-6 sm:p-10 font-sans selection:bg-yellow-400 selection:text-black">
      {/* Top Brand Bar */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-zinc-200 p-0.5 shrink-0 flex items-center justify-center shadow-xs">
            <img
              src="/logo.jpg"
              alt="Genesis CareerFit Logo"
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="font-black text-sm text-zinc-900">G</span>';
              }}
            />
          </div>
          <div>
            <div className="text-base font-black tracking-tight text-zinc-900 uppercase flex items-center gap-1.5">
              <span>Genesis CareerFit</span>
            </div>
            <div className="text-[10px] text-yellow-600 font-bold tracking-widest uppercase">
              Placement Intelligence &amp; Career Matching Platform
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-zinc-500 bg-white px-3 py-1.5 rounded-full border border-zinc-200 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Enterprise Multi-Tenant Edition</span>
        </div>
      </header>

      {/* Main Gateway Hub */}
      <main className="max-w-4xl mx-auto w-full my-auto py-12 space-y-10 text-center">
        <div className="space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
            <span>Select Your Access Gateway</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900">
            Welcome to Genesis CareerFit
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
            Please choose your role portal below to access personalized candidate dossiers, institutional intelligence, or situational assessments.
          </p>
        </div>

        {/* Two Primary Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
          {/* Card 1: Student Career Portal */}
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-yellow-400 transition-all duration-200 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-700 border border-yellow-200 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Student Portal</h2>
                <p className="text-xs text-yellow-700 font-semibold mt-0.5">Undergraduate &amp; Graduate Candidates</p>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Take the 20-question situational assessment, view your personalized CareerFit score (200-800), explore verified job matches, and track your 90-day placement roadmap.
              </p>
              <ul className="space-y-2 text-xs text-zinc-600 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Personalized 12-page Master Dossier</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Verified 45-Role Career Fit Radar</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                to="/student/login"
                className="w-full py-3 px-4 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs group-hover:bg-yellow-400 group-hover:text-black"
              >
                <span>Continue as Student</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Placement Officer Portal */}
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-yellow-400 transition-all duration-200 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-800 border border-zinc-200 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Placement Officer Portal</h2>
                <p className="text-xs text-zinc-500 font-semibold mt-0.5">Institutional Placement Cell &amp; TPOs</p>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Access institution-scoped candidate directories, multi-attribute filtering, batch Excel workbook exports, department gap diagnostics, and certified student dossiers.
              </p>
              <ul className="space-y-2 text-xs text-zinc-600 pt-2 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Filter-scoped Excel Spreadsheet Export</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Certified 6-page Placement Summaries</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                to="/placement/login"
                className="w-full py-3 px-4 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs group-hover:bg-yellow-400 group-hover:text-black"
              >
                <span>Continue to Placement Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Institutional Footer */}
      <footer className="max-w-6xl mx-auto w-full py-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Genesis CareerFit Platform. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-600">
          <span>Institutional Multi-Tenancy</span>
          <span>•</span>
          <span>Deterministic Scoring</span>
          <span>•</span>
          <span>Certified Reports</span>
        </div>
      </footer>
    </div>
  );
}
