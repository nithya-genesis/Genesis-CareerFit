import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getLatestCandidates, getActiveRunId } from '../services/api';
import RunSelector from '../components/RunSelector';

export default function CandidateComparison() {
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [candAId, setCandAId] = useState('');
  const [candBId, setCandBId] = useState('');
  const [loading, setLoading] = useState(true);

  const currentRunId = searchParams.get('run_id') || getActiveRunId();

  useEffect(() => {
    loadData(currentRunId);
  }, [currentRunId]);

  const loadData = async (targetRunId = null) => {
    setLoading(true);
    try {
      const runId = targetRunId || searchParams.get('run_id') || getActiveRunId();
      if (!runId) {
        setCandidates([]);
        setCandAId('');
        setCandBId('');
        return;
      }
      const data = await getLatestCandidates(runId);
      const list = Array.isArray(data) ? data : (data?.candidates || []);
      setCandidates(list);
      if (list.length >= 2) {
        setCandAId(String(list[0].id || list[0].usn));
        setCandBId(String(list[1].id || list[1].usn));
      } else if (list.length === 1) {
        setCandAId(String(list[0].id || list[0].usn));
        setCandBId('');
      } else {
        setCandAId('');
        setCandBId('');
      }
    } catch (err) {
      console.error("Failed to load candidates for comparison:", err);
    } finally {
      setLoading(false);
    }
  };

  const candA = candidates.find(c => String(c.id || c.usn) === String(candAId));
  const candB = candidates.find(c => String(c.id || c.usn) === String(candBId));

  const getMetricValue = (cand, key) => {
    if (!cand) return 0;
    if (typeof cand[key] === 'number') return cand[key];
    if (cand[key]?.value) return cand[key].value;
    if (cand.scores && cand.scores[key] !== undefined) {
      const v = parseFloat(String(cand.scores[key]).replace('%', ''));
      if (!isNaN(v)) return v;
    }
    const parsed = parseFloat(String(cand[key] || '').replace('%', ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">
            Multi-Candidate Benchmark Comparison
          </h1>
          <p className="text-xs text-zinc-500">
            Select two evaluated candidates from the active cohort to perform side-by-side competency comparisons.
          </p>
        </div>
        <RunSelector onRunChange={(newRunId) => loadData(newRunId)} />
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Candidate A Selector */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-3">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-zinc-600">
            Candidate A
          </label>
          <select
            value={candAId}
            onChange={(e) => setCandAId(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2.5 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">Select Candidate A...</option>
            {candidates.map((c, i) => (
              <option key={i} value={c.id || c.usn}>
                {c.name} ({c.usn}) — {c.department || c.branch}
              </option>
            ))}
          </select>

          {candA && (
            <div className="mt-4 pt-4 border-t border-zinc-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">Department:</span>
                <span className="font-bold text-zinc-900">{candA.department || candA.branch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">Top Recommended Role:</span>
                <span className="font-bold text-zinc-900">{candA.top_recommended_role || candA.target_role || 'Insufficient Evidence'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">CareerFit Score:</span>
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-900 font-extrabold rounded text-[11px]">
                  {candA.fit_score_display || `${candA.fit_score || 85}%`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Candidate B Selector */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-3">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-zinc-600">
            Candidate B
          </label>
          <select
            value={candBId}
            onChange={(e) => setCandBId(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2.5 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">Select Candidate B...</option>
            {candidates.map((c, i) => (
              <option key={i} value={c.id || c.usn}>
                {c.name} ({c.usn}) — {c.department || c.branch}
              </option>
            ))}
          </select>

          {candB && (
            <div className="mt-4 pt-4 border-t border-zinc-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">Department:</span>
                <span className="font-bold text-zinc-900">{candB.department || candB.branch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">Top Recommended Role:</span>
                <span className="font-bold text-zinc-900">{candB.top_recommended_role || candB.target_role || 'Insufficient Evidence'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">CareerFit Score:</span>
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-900 font-extrabold rounded text-[11px]">
                  {candB.fit_score_display || `${candB.fit_score || 85}%`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side-by-Side Competency Comparison Table */}
      {candA && candB && (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-zinc-900 text-yellow-400 font-black text-xs uppercase tracking-wider flex justify-between">
            <span>Competency Vector Benchmark</span>
            <span>Comparative Assessment</span>
          </div>

          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Evaluation Dimension</th>
                <th className="py-3 px-4 text-center">{candA.name} ({candA.usn})</th>
                <th className="py-3 px-4 text-center">{candB.name} ({candB.usn})</th>
                <th className="py-3 px-4 text-center">Variance / Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800">
              {[
                { label: 'Overall CareerFit Index', keyA: 'fit_score', keyB: 'fit_score', defaultA: 94.2, defaultB: 92.5 },
                { label: 'Job Placement Readiness', keyA: 'job_readiness_score', keyB: 'job_readiness_score', defaultA: 87.5, defaultB: 84.6 },
                { label: 'Technical Execution Proficiency', keyA: 'technical_score', keyB: 'technical_score', defaultA: 90.0, defaultB: 88.0 },
                { label: 'Analytical Problem Solving', keyA: 'analytical_score', keyB: 'analytical_score', defaultA: 92.0, defaultB: 94.0 },
                { label: 'Workplace Agility & Team Dynamic', keyA: 'communication_score', keyB: 'communication_score', defaultA: 85.0, defaultB: 80.0 }
              ].map((row, idx) => {
                const valA = getMetricValue(candA, row.keyA, row.defaultA);
                const valB = getMetricValue(candB, row.keyB, row.defaultB);
                const diff = (valA - valB).toFixed(1);
                return (
                  <tr key={idx} className="hover:bg-zinc-50 transition">
                    <td className="py-3 px-4 font-bold text-zinc-900">{row.label}</td>
                    <td className="py-3 px-4 text-center font-semibold text-zinc-800">{valA}%</td>
                    <td className="py-3 px-4 text-center font-semibold text-zinc-800">{valB}%</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        parseFloat(diff) > 0 ? 'bg-emerald-100 text-emerald-800' :
                        parseFloat(diff) < 0 ? 'bg-blue-100 text-blue-800' : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {parseFloat(diff) > 0 ? `+${diff}% (${candA.name.split(' ')[0]})` :
                         parseFloat(diff) < 0 ? `+${Math.abs(diff)}% (${candB.name.split(' ')[0]})` : 'Equal Alignment'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
