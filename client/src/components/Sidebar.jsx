import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GitCompare,
  Target,
  CheckCircle2,
  UploadCloud,
  Building2,
  Compass,
  Map,
  FileText,
  User,
  LogOut,
  ShieldCheck,
  Layers,
  Settings,
  Activity,
  ClipboardList,
  GraduationCap
} from 'lucide-react';
import { isStudent, isPlacementOfficer, isPlacementAdmin, getAuthUser, logout } from '../services/api';

export default function Sidebar() {
  const studentRole = isStudent();
  const adminRole = isPlacementAdmin();
  const officerRole = isPlacementOfficer();
  const authUser = getAuthUser();

  const userName = authUser.name || (
    adminRole ? 'Platform Administrator' : (studentRole ? 'Student Candidate' : 'Placement Officer')
  );
  const userUsn = authUser.usn || '';

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ease-in-out ${
      isActive
        ? 'bg-zinc-900 text-white font-bold border-l-2 border-genesis-gold shadow-2xs'
        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
    }`;

  return (
    <aside className="w-64 bg-genesis-black text-white flex flex-col justify-between border-r border-zinc-800/80 min-h-screen shrink-0 select-none">
      <div>
        {/* Brand Header with Official Logo */}
        <div className="p-5 border-b border-zinc-900 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 p-0.5 shrink-0 flex items-center justify-center">
            <img
              src="/logo.jpg"
              alt="Genesis CareerFit Brand"
              className="w-full h-full object-contain rounded"
            />
          </div>
          <div className="overflow-hidden">
            <div className="font-black text-xs tracking-wider text-white uppercase flex items-center gap-1.5">
              <span>Genesis CareerFit</span>
            </div>
            <div className="text-[10px] text-genesis-gold font-bold tracking-widest uppercase truncate">
              {adminRole ? 'Platform Control' : (studentRole ? 'Student Portal' : 'Placement Intelligence')}
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3.5 space-y-5 text-xs overflow-y-auto max-h-[calc(100vh-140px)]">
          {adminRole ? (
            /* PLATFORM ADMIN NAVIGATION */
            <>
              {/* COLLEGE MANAGEMENT (PRIMARY) */}
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-extrabold tracking-widest text-zinc-500 uppercase">
                  Colleges & Tenancy
                </div>
                <NavLink to="/admin" end className={navItemClass}>
                  <Building2 className="w-4 h-4 text-genesis-gold shrink-0" />
                  <span>College Management</span>
                </NavLink>
              </div>

              {/* ACCESS MANAGEMENT */}
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-extrabold tracking-widest text-zinc-500 uppercase">
                  Access & People
                </div>
                <NavLink to="/admin/users" className={navItemClass}>
                  <Users className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>User Management</span>
                </NavLink>
                <NavLink to="/admin/students" className={navItemClass}>
                  <GraduationCap className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Student Records</span>
                </NavLink>
              </div>

              {/* SECURITY & DIAGNOSTICS */}
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-extrabold tracking-widest text-zinc-500 uppercase">
                  System
                </div>
                <NavLink to="/admin/audit" className={navItemClass}>
                  <ClipboardList className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Audit Logs</span>
                </NavLink>
                <NavLink to="/admin/system" className={navItemClass}>
                  <Activity className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>System Health</span>
                </NavLink>
              </div>
            </>
          ) : studentRole ? (
            /* STUDENT NAVIGATION */
            <div className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-extrabold tracking-widest text-zinc-500 uppercase">
                Talent File
              </div>
              <NavLink to="/student/dashboard" className={navItemClass}>
                <User className="w-4 h-4 text-genesis-gold shrink-0" />
                <span>My CareerFit Dossier</span>
              </NavLink>
              <NavLink to="/student/assessment" className={navItemClass}>
                <Target className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>My Assessment</span>
              </NavLink>
            </div>
          ) : (
            /* PLACEMENT OFFICER NAVIGATION */
            <>
              {/* OVERVIEW */}
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-extrabold tracking-widest text-zinc-500 uppercase">
                  Overview
                </div>
                <NavLink to="/placement/dashboard" className={navItemClass}>
                  <LayoutDashboard className="w-4 h-4 text-genesis-gold shrink-0" />
                  <span>Institutional Dashboard</span>
                </NavLink>
              </div>

              {/* TALENT DIRECTORY */}
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-extrabold tracking-widest text-zinc-500 uppercase">
                  Talent
                </div>
                <NavLink to="/candidates" end className={navItemClass}>
                  <Users className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Candidate Directory</span>
                </NavLink>
                <NavLink to="/candidates/comparison" className={navItemClass}>
                  <GitCompare className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Candidate Comparison</span>
                </NavLink>
                <NavLink to="/placement/readiness" className={navItemClass}>
                  <CheckCircle2 className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Placement Readiness</span>
                </NavLink>
                <NavLink to="/careers/skill-gaps" className={navItemClass}>
                  <Target className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Skill Gap Analysis</span>
                </NavLink>
              </div>

              {/* INTELLIGENCE & TRACKS */}
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-extrabold tracking-widest text-zinc-500 uppercase">
                  Intelligence
                </div>
                <NavLink to="/placement/departments" className={navItemClass}>
                  <Building2 className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Department Analysis</span>
                </NavLink>
                <NavLink to="/careers/explorer" className={navItemClass}>
                  <Compass className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Career Explorer</span>
                </NavLink>
                <NavLink to="/careers/roadmaps" className={navItemClass}>
                  <Map className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Career Roadmaps</span>
                </NavLink>
              </div>

              {/* REPORTING */}
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-extrabold tracking-widest text-zinc-500 uppercase">
                  Reporting
                </div>
                <NavLink to="/reports/individual" className={navItemClass}>
                  <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Dossiers & Reports</span>
                </NavLink>
              </div>
            </>
          )}
        </nav>
      </div>

      {/* Footer User Profile & Logout */}
      <div className="p-3.5 border-t border-zinc-900 space-y-2.5">
        <div className="px-2 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between">
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-white truncate">{userName}</div>
            <div className="text-[10px] font-mono text-zinc-400 truncate">
              {userUsn || (adminRole ? 'Administrator' : (studentRole ? 'Student' : 'Officer Session'))}
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        </div>

        <button
          onClick={() => logout()}
          className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 text-xs font-bold rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
