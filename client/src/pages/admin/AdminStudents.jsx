import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  Building2,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { getAdminStudents } from '../../services/api';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [batchFilter, setBatchFilter] = useState('2026');

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (deptFilter !== 'ALL') params.department = deptFilter;
      if (batchFilter !== 'ALL') params.batch = batchFilter;
      if (search.trim()) params.search = search.trim();
      const res = await getAdminStudents(params);
      setStudents(res.students || []);
    } catch (err) {
      setError(err.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [deptFilter, batchFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadStudents();
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-[10px] font-bold uppercase tracking-wide mb-1.5">
            <GraduationCap className="w-3 h-3 text-purple-600" />
            Institutional Student Roster
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-genesis-black tracking-tight">
            Student Assessment Records
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Supervisory cohort records, assessment lifecycle stages, verified scores, and placement readiness tiers.
          </p>
        </div>

        <button
          onClick={loadStudents}
          className="self-start md:self-auto inline-flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-all shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
          <span>Refresh Roster</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student by USN or candidate name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 font-medium"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-zinc-900"
          >
            <option value="ALL">All Departments</option>
            <option value="CSE">Computer Science (CSE)</option>
            <option value="ISE">Information Science (ISE)</option>
            <option value="ECE">Electronics (ECE)</option>
            <option value="AIML">AI & ML (AIML)</option>
          </select>

          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-zinc-900"
          >
            <option value="2026">Batch 2026</option>
            <option value="2025">Batch 2025</option>
            <option value="ALL">All Batches</option>
          </select>
        </div>
      </div>

      {/* Student Records Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-500 space-y-3">
            <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin mx-auto" />
            <p>Loading student records...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-700 space-y-2">
            <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
            <p>{error}</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 space-y-2">
            <GraduationCap className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="font-bold text-zinc-700">No student records found matching criteria.</p>
            <p>Check department filters or upload candidate assessment data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-extrabold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">USN & Candidate</th>
                  <th className="py-3.5 px-4">Dept / Batch</th>
                  <th className="py-3.5 px-4">CGPA</th>
                  <th className="py-3.5 px-4">Assessment Stage</th>
                  <th className="py-3.5 px-4">CareerFit Score</th>
                  <th className="py-3.5 px-4">Readiness Status</th>
                  <th className="py-3.5 px-4">Target Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-zinc-900">{s.name}</div>
                      <div className="text-[11px] font-mono text-zinc-500">{s.usn}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-700">
                      {s.department} · {s.batch_year}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {s.cgpa ? `${s.cgpa.toFixed(2)}/10.0` : <span className="text-zinc-400 italic">Not recorded</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.lifecycle_status === 'ANALYSIS_READY'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            : s.lifecycle_status === 'IN_PROGRESS' || s.lifecycle_status === 'STARTED'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                        }`}
                      >
                        {s.lifecycle_status === 'ANALYSIS_READY' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {s.lifecycle_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {s.career_fit_score !== null ? (
                        <span className="text-zinc-900">{s.career_fit_score.toFixed(1)}%</span>
                      ) : (
                        <span className="text-zinc-400 italic font-sans font-normal text-[11px]">Pending</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-zinc-800 text-[11px]">{s.readiness_status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 font-medium truncate max-w-xs">
                      {s.target_role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
