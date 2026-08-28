import React from 'react';
import { Bot } from 'lucide-react';

export default function AICareerAdvisor() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-black text-[#0B0B0B] flex items-center gap-2"><Bot className="w-5 h-5 text-[#F5C400]" /> Interactive AI CareerFit Assistant</h1>
      <p className="text-xs text-gray-500 font-medium">Evidence-grounded Q&A strictly validated on candidate EvidencePacks.</p>
    </div>
  );
}