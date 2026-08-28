import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileSpreadsheet, Users, Briefcase, TrendingUp,
  FileText, Bot, Settings, ChevronDown, ChevronRight, UploadCloud,
  FileSearch, Sliders, PlayCircle, UserCheck, GitCompare, Compass,
  Target, ListTodo, Milestone, Building2, PieChart, Award
} from 'lucide-react';

export default function Sidebar() {
  const [openMenus, setOpenMenus] = useState({
    assessment: true, candidates: true, career: true, placement: true, reports: true
  });


  const navItemClass = ({ isActive }) =>
    isActive ? 'flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-[#F5C400] text-[#0B0B0B] shadow-sm' : 'flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-gray-400 hover:text-white hover:bg-white/5';

  const subNavItemClass = ({ isActive }) =>
    isActive ? 'flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold rounded-md text-[#F5C400] bg-[#F5C400]/10 border-l-2 border-[#F5C400]' : 'flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium rounded-md text-gray-400 hover:text-gray-200 hover:bg-white/5';

  return (
    <aside className="w-64 bg-[#0B0B0B] text-white flex flex-col h-screen border-r border-white/10 select-none z-30">
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F5C400] flex items-center justify-center font-black text-[#0B0B0B] text-sm shadow-md">
            GC
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1">
              GENESIS <span className="text-[#F5C400]">CAREERFIT</span>
            </div>
            <div className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
              Placement Intelligence
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        <NavLink to="/" className={navItemClass} end>
          <LayoutDashboard className="w-4 h-4 text-inherit" />
          <span>Dashboard</span>
        </NavLink>

        <div>
          <button onClick={() => toggleMenu('assessment')} className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-gray-300 hover:text-white rounded-lg hover:bg-white/5">
            <div className="flex items-center gap-2.5"><FileSpreadsheet className="w-4 h-4 text-[#F5C400]" /><span>Assessment</span></div>
            {openMenus.assessment ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
          </button>
          {openMenus.assessment && (
            <div className="ml-5 pl-2 border-l border-white/10 my-1 space-y-0.5">
              <NavLink to="/assessment/upload" className={subNavItemClass}><UploadCloud className="w-3.5 h-3.5" /><span>Upload Assessment</span></NavLink>
              <NavLink to="/assessment/schema" className={subNavItemClass}><FileSearch className="w-3.5 h-3.5" /><span>Schema Discovery</span></NavLink>
              <NavLink to="/assessment/config" className={subNavItemClass}><Sliders className="w-3.5 h-3.5" /><span>Configuration</span></NavLink>
              <NavLink to="/assessment/runs" className={subNavItemClass}><PlayCircle className="w-3.5 h-3.5" /><span>Evaluation Runs</span></NavLink>
            </div>
          )}
        </div>

        <div>
          <button onClick={() => toggleMenu('candidates')} className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-gray-300 hover:text-white rounded-lg hover:bg-white/5">
            <div className="flex items-center gap-2.5"><Users className="w-4 h-4 text-[#F5C400]" /><span>Candidates</span></div>
            {openMenus.candidates ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
          </button>
          {openMenus.candidates && (
            <div className="ml-5 pl-2 border-l border-white/10 my-1 space-y-0.5">
              <NavLink to="/candidates" className={subNavItemClass} end><UserCheck className="w-3.5 h-3.5" /><span>All Candidates</span></NavLink>
              <NavLink to="/candidates/comparison" className={subNavItemClass}><GitCompare className="w-3.5 h-3.5" /><span>Candidate Comparison</span></NavLink>
            </div>
          )}
        </div>

        <div>
          <button onClick={() => toggleMenu('career')} className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-gray-300 hover:text-white rounded-lg hover:bg-white/5">
            <div className="flex items-center gap-2.5"><Briefcase className="w-4 h-4 text-[#F5C400]" /><span>Career Intelligence</span></div>
            {openMenus.career ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
          </button>
          {openMenus.career && (
            <div className="ml-5 pl-2 border-l border-white/10 my-1 space-y-0.5">
              <NavLink to="/careers/explorer" className={subNavItemClass}><Compass className="w-3.5 h-3.5" /><span>Career Explorer</span></NavLink>
              <NavLink to="/careers/matching" className={subNavItemClass}><Target className="w-3.5 h-3.5" /><span>Career Matching</span></NavLink>
              <NavLink to="/careers/skill-gaps" className={subNavItemClass}><ListTodo className="w-3.5 h-3.5" /><span>Skill Gap Analysis</span></NavLink>
              <NavLink to="/careers/roadmaps" className={subNavItemClass}><Milestone className="w-3.5 h-3.5" /><span>Career Roadmaps</span></NavLink>
            </div>
          )}
        </div>

        <div>
          <button onClick={() => toggleMenu('placement')} className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-gray-300 hover:text-white rounded-lg hover:bg-white/5">
            <div className="flex items-center gap-2.5"><TrendingUp className="w-4 h-4 text-[#F5C400]" /><span>Placement Intel</span></div>
            {openMenus.placement ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
          </button>
          {openMenus.placement && (
            <div className="ml-5 pl-2 border-l border-white/10 my-1 space-y-0.5">
              <NavLink to="/placement/dashboard" className={subNavItemClass}><Building2 className="w-3.5 h-3.5" /><span>Placement Dashboard</span></NavLink>
              <NavLink to="/placement/departments" className={subNavItemClass}><PieChart className="w-3.5 h-3.5" /><span>Department Analysis</span></NavLink>
              <NavLink to="/placement/readiness" className={subNavItemClass}><Award className="w-3.5 h-3.5" /><span>Placement Readiness</span></NavLink>
            </div>
          )}
        </div>

        <div>
          <button onClick={() => toggleMenu('reports')} className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-gray-300 hover:text-white rounded-lg hover:bg-white/5">
            <div className="flex items-center gap-2.5"><FileText className="w-4 h-4 text-[#F5C400]" /><span>Reports Hub</span></div>
            {openMenus.reports ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
          </button>
          {openMenus.reports && (
            <div className="ml-5 pl-2 border-l border-white/10 my-1 space-y-0.5">
              <NavLink to="/reports/individual" className={subNavItemClass}><span>Individual Reports</span></NavLink>
              <NavLink to="/reports/batch" className={subNavItemClass}><span>Batch Downloads</span></NavLink>
              <NavLink to="/reports/templates" className={subNavItemClass}><span>Report Templates</span></NavLink>
            </div>
          )}
        </div>

        <NavLink to="/advisor" className={navItemClass}><Bot className="w-4 h-4 text-[#F5C400]" /><span>AI Career Advisor</span></NavLink>
        <NavLink to="/settings" className={navItemClass}><Settings className="w-4 h-4 text-inherit" /><span>Settings</span></NavLink>
      </div>

      <div className="p-3.5 border-t border-white/10 bg-[#161616]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F5C400]/20 border border-[#F5C400]/40 flex items-center justify-center text-[#F5C400] font-extrabold text-xs">EP</div>
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate">East Point College</div>
            <div className="text-[10px] text-gray-400 font-medium truncate">Placement Director Portal</div>
          </div>
        </div>
      </div>
    </aside>
  );
}