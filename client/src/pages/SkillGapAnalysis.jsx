import React, { useState } from 'react';
import { Target, AlertTriangle, CheckCircle2, BookOpen, Clock, Filter, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function SkillGapAnalysis() {
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');

  const institutionalGaps = [
    {
      id: 1,
      domain: 'System Design & Distributed Systems',
      current: 55,
      target: 75,
      gap: 20,
      priority: 'HIGH',
      branch: 'CSE / ISE',
      affectedStudents: 38,
      topics: ['Microservices', 'REST & GraphQL API Design', 'Redis / Memcached Caching', 'Database Sharding', 'Message Queues (Kafka)'],
      action: 'Conduct 4-week architectural capstone sprint and mock system design interviews.',
      duration: '30 Days'
    },
    {
      id: 2,
      domain: 'Database & SQL Optimization',
      current: 64,
      target: 80,
      gap: 16,
      priority: 'HIGH',
      branch: 'All IT & Core',
      affectedStudents: 42,
      topics: ['Complex JOINs & CTEs', 'Window Functions', 'B-Tree & Hash Indexing', 'Query Execution Plan Analysis', 'Normalization'],
      action: 'Assign 50 practical SQL case studies and benchmark query performance tuning exercises.',
      duration: '21 Days'
    },
    {
      id: 3,
      domain: 'Algorithms & Data Structures (DSA)',
      current: 68,
      target: 80,
      gap: 12,
      priority: 'MEDIUM',
      branch: 'CSE / ISE / AIML',
      affectedStudents: 34,
      topics: ['Dynamic Programming', 'Graph Traversals (BFS/DFS)', 'Trees & Tries', 'Sliding Window', 'Two Pointers'],
      action: 'Implement daily timed 45-minute LeetCode Medium problem-solving challenges.',
      duration: '45 Days'
    },
    {
      id: 4,
      domain: 'Embedded Systems & RTOS Protocols',
      current: 60,
      target: 75,
      gap: 15,
      priority: 'HIGH',
      branch: 'ECE / EEE',
      affectedStudents: 29,
      topics: ['FreeRTOS Task Scheduling', 'SPI / I2C / UART Protocols', 'Microcontroller Interfacing (ARM/ESP32)', 'Memory Management'],
      action: 'Hardware lab workshops on RTOS scheduling and firmware debugging.',
      duration: '30 Days'
    },
    {
      id: 5,
      domain: 'Professional Workplace Communication & SJT',
      current: 78,
      target: 85,
      gap: 7,
      priority: 'MEDIUM',
      branch: 'Cohort-Wide',
      affectedStudents: 22,
      topics: ['STAR Behavioral Framework', 'Conflict De-escalation', 'Cross-Functional Stakeholder Updates', 'Concise Technical Writing'],
      action: 'Host peer-to-peer behavioral mock interview panels with recorded video feedback.',
      duration: '14 Days'
    },
    {
      id: 6,
      domain: 'Analytical Problem Solving & Aptitude',
      current: 72,
      target: 80,
      gap: 8,
      priority: 'MEDIUM',
      branch: 'Cohort-Wide',
      affectedStudents: 27,
      topics: ['Quantitative Aptitude', 'Data Interpretation', 'Logical Deductions', 'Probability & Combinatorics'],
      action: 'Timed speed-aptitude assessments with automated sectional breakdown.',
      duration: '21 Days'
    },
    {
      id: 7,
      domain: 'Emotional Intelligence & Accountability',
      current: 82,
      target: 80,
      gap: 0,
      priority: 'MET',
      branch: 'Cohort-Wide',
      affectedStudents: 8,
      topics: ['Ownership Mindset', 'Resilience Under Pressure', 'Empathy & Feedback Receptivity'],
      action: 'Sustain current situational judgment training and mentor guidance.',
      duration: 'Ongoing'
    }
  ];

  const filteredGaps = institutionalGaps.filter((g) => {
    const matchesBranch = selectedBranch === 'ALL' || g.branch.includes(selectedBranch) || g.branch.includes('Cohort-Wide') || g.branch.includes('All IT');
    const matchesPriority = selectedPriority === 'ALL' || g.priority === selectedPriority;
    return matchesBranch && matchesPriority;
  });

  const getPriorityBadge = (p) => {
    if (p === 'HIGH') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-200 inline-flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-red-600" />
          <span>Priority 1 (High)</span>
        </span>
      );
    }
    if (p === 'MEDIUM') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-amber-600" />
          <span>Priority 2 (Medium)</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Benchmark Met</span>
      </span>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <Target className="w-7 h-7 text-yellow-500" />
            <span>Institutional Skill Gap &amp; Training Strategy</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Aggregated cohort competency bottlenecks vs. Tier-1 recruiter benchmarks with actionable 30/60/90 day remediation roadmaps.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-300 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent text-gray-700 font-semibold focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="ISE">ISE</option>
              <option value="AIML">AIML</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-300 text-xs">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-transparent text-gray-700 font-semibold focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority Only</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="MET">Benchmark Met</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-red-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Top Recruiter Bottleneck</div>
          <div className="text-lg font-black text-gray-900">Database &amp; SQL Optimization</div>
          <p className="text-xs text-gray-500">42 candidates require query performance training</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Architecture Gap</div>
          <div className="text-lg font-black text-gray-900">System Design (Microservices)</div>
          <p className="text-xs text-gray-500">38 candidates below Tier-1 benchmark (20% gap)</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Algorithmic Readiness</div>
          <div className="text-lg font-black text-gray-900">DSA &amp; Dynamic Programming</div>
          <p className="text-xs text-gray-500">34 candidates require timed coding drills</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Strongest Competency</div>
          <div className="text-lg font-black text-gray-900">Accountability &amp; SJT (82%)</div>
          <p className="text-xs text-gray-500">+2% above institutional target benchmark</p>
        </div>
      </div>

      {/* Detailed Skill Gap & Training Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">
            Competency Gap Breakdown &amp; Prescriptive Training Plan ({filteredGaps.length} Areas)
          </h2>
          <span className="text-xs text-gray-500">Calculated from verified assessment responses</span>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredGaps.map((g) => (
            <div key={g.id} className="p-6 hover:bg-gray-50/50 transition-colors space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-gray-900">{g.domain}</h3>
                    {getPriorityBadge(g.priority)}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {g.branch}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Targeted Impact: <span className="font-semibold text-gray-800">{g.affectedStudents} students</span> ({g.gap > 0 ? `${g.gap}% below target benchmark` : 'Benchmark fully satisfied'})
                  </p>
                </div>

                {/* Score delta indicator */}
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs">
                  <div className="text-center">
                    <div className="text-[10px] uppercase font-bold text-gray-400">Current</div>
                    <div className="text-sm font-black text-gray-900">{g.current}%</div>
                  </div>
                  <div className="text-gray-300 font-bold">→</div>
                  <div className="text-center">
                    <div className="text-[10px] uppercase font-bold text-gray-400">Target</div>
                    <div className="text-sm font-black text-emerald-600">{g.target}%</div>
                  </div>
                  <div className="text-center pl-2 border-l border-gray-200">
                    <div className="text-[10px] uppercase font-bold text-gray-400">Duration</div>
                    <div className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{g.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Training Topics */}
              <div className="pt-2">
                <div className="text-[11px] font-bold uppercase text-gray-500 tracking-wider mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-yellow-600" />
                  <span>Prescriptive Training Curriculum Topics</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {g.topics.map((t, idx) => (
                    <span key={idx} className="text-xs bg-yellow-50 border border-yellow-200/60 text-yellow-900 px-2.5 py-1 rounded-md font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Recommended */}
              <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 flex items-start gap-2">
                <ArrowUpRight className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Institutional Action: </span>
                  {g.action}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
