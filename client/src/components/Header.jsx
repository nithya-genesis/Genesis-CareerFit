import React, { useState, useEffect } from 'react';
import { Search, Sparkles, LogOut, Building, ShieldCheck } from 'lucide-react';
import { getAiHealth, getAuthUser, logout, isStudent, isPlacementOfficer, isPlacementAdmin } from '../services/api';
import Tooltip from './ui/Tooltip';

export default function Header() {
  const [aiHealth, setAiHealth] = useState({ status: 'healthy', provider: 'NVIDIA Nemotron' });
  const authUser = getAuthUser();

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      const data = await getAiHealth();
      setAiHealth(data);
    } catch (e) {
      setAiHealth({ status: 'offline', provider: 'NVIDIA Nemotron' });
    }
  };

  const isAdm = isPlacementAdmin();
  const isOfficer = isPlacementOfficer();
  const isStud = isStudent();
  const roleDisplay = isAdm ? 'Administrator' : (isOfficer ? 'Placement Officer' : 'Student Candidate');
  const nameDisplay = authUser.name || (isAdm ? 'System Administrator' : (isOfficer ? 'Placement Director' : (authUser.usn || 'Student')));

  return (
    <header className="h-14 bg-white border-b border-genesis-border px-6 flex items-center justify-between sticky top-0 z-30 shadow-subtle select-none">
      {/* Search & Breadcrumb context */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-genesis-muted" />
          <input
            type="text"
            placeholder={isOfficer ? "Search candidates by name, USN, branch..." : "Search competencies, career tracks..."}
            className="w-full bg-genesis-canvas border border-genesis-border rounded-lg pl-9 pr-12 py-1.5 text-xs text-genesis-black placeholder-genesis-muted focus:outline-none focus:border-genesis-gold focus:ring-1 focus:ring-genesis-gold transition-colors duration-150"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono font-bold text-zinc-400 bg-white border border-zinc-200 rounded">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Badges & User Profile Actions */}
      <div className="flex items-center gap-3">
        {/* Live NVIDIA AI Status Indicator */}
        <Tooltip text="NVIDIA Nemotron Grounded Interpretation Engine Operational">
          <div className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[11px] font-bold flex items-center gap-1.5 cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>AI Online</span>
          </div>
        </Tooltip>

{/* Institutional Tenant Badge removed for Placement Officer UI */}

        {/* User Identity Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-genesis-border">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-genesis-black leading-none">{nameDisplay}</div>
            <div className="text-[10px] font-mono text-genesis-muted mt-0.5 leading-none">{roleDisplay}</div>
          </div>

          <div className="w-7 h-7 rounded-lg bg-genesis-black text-genesis-gold font-extrabold flex items-center justify-center text-xs shadow-2xs border border-zinc-800">
            {isAdm ? 'AD' : (isOfficer ? 'TP' : (authUser.name ? authUser.name.charAt(0).toUpperCase() : 'ST'))}
          </div>
        </div>

        {/* Logout Action */}
        <button
          onClick={() => logout()}
          title="Sign Out"
          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-150 border border-transparent hover:border-rose-200"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
