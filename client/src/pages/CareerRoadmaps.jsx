import React from 'react';

export default function CareerRoadmaps() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">90-Day Placement Readiness Roadmap</h1>
        <p className="text-sm text-gray-500 mt-1">Structured technical and behavioral sprint milestones for campus recruitment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border-t-4 border-yellow-500 shadow-sm space-y-3">
          <span className="text-xs font-bold text-yellow-800 uppercase">Days 1–30</span>
          <h2 className="text-lg font-bold text-gray-900">Foundation & Core Skills</h2>
          <ul className="text-xs text-gray-600 space-y-2">
            <li>• Master advanced SQL (Window functions, CTEs)</li>
            <li>• Daily 30-min aptitude speed drills</li>
            <li>• Complete 2 end-to-end analytical dashboards</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl border-t-4 border-black shadow-sm space-y-3">
          <span className="text-xs font-bold text-gray-800 uppercase">Days 31–60</span>
          <h2 className="text-lg font-bold text-gray-900">Projects & Profile Polish</h2>
          <ul className="text-xs text-gray-600 space-y-2">
            <li>• Deploy production repo to GitHub with live URL</li>
            <li>• Optimize resume for ATS keyword screening</li>
            <li>• Participate in 3 mock technical interviews</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl border-t-4 border-green-500 shadow-sm space-y-3">
          <span className="text-xs font-bold text-green-800 uppercase">Days 61–90</span>
          <h2 className="text-lg font-bold text-gray-900">Placement Blitz & Drives</h2>
          <ul className="text-xs text-gray-600 space-y-2">
            <li>• Solve 50 target company interview questions</li>
            <li>• Practice behavioral STAR interview responses</li>
            <li>• Attend Tier-1 direct campus recruitment rounds</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
