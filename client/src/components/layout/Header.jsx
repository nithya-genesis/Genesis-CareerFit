import React from 'react';
import { Search, Bell, ShieldCheck, Zap } from 'lucide-react';

export default function Header({ persona, setPersona }) {
  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidates by name, USN, branch, or target role..."
            className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg pl-9.5 pr-4 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F5C400] focus:ring-1 focus:ring-[#F5C400] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-[#F9FAFB] p-1 rounded-lg border border-[#E5E7EB]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 pl-2">View:</span>
          {['Placement Director', 'Faculty', 'Student'].map((role) => (
            <button
              key={role}
              onClick={() => setPersona(role)}
              className={persona === role ? 'bg-[#0B0B0B] text-[#F5C400] font-bold shadow-xs px-2.5 py-1 text-xs rounded-md' : 'text-gray-600 hover:text-gray-900 px-2.5 py-1 text-xs rounded-md'}
            >
              {role}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold">
          <Zap className="w-3.5 h-3.5 fill-emerald-500 text-emerald-600" />
          <span>3 / 3 AI Keys Active</span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#FFFBEB] text-[#92400E] border border-[#F59E0B]/30 px-2.5 py-1 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Processing Audit Log</span>
        </div>

        <button className="w-8 h-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 bg-[#F5C400] rounded-full absolute top-1.5 right-1.5"></span>
        </button>

        <div className="w-8 h-8 rounded-full bg-[#0B0B0B] text-[#F5C400] font-bold text-xs flex items-center justify-center border border-[#0B0B0B]">
          JD
        </div>
      </div>
    </header>
  );
}