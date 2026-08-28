import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getLatestCandidates, getActiveRunId } from '../services/api';
import RunSelector from '../components/RunSelector';

export default function PlacementReadiness() {
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
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
        return;
      }
      const data = await getLatestCandidates(runId);
      setCandidates(Array.isArray(data) ? data : (data?.candidates || []));
    } catch (err) {
      console.error("Failed to load placement readiness:", err);
    } finally {
      setLoading(false);
    }
  };

  const total = candidates.length;
  const tier1Count = candidates.filter(c => {
    const sc = parseFloat(String(c.career_fit_score || c.fit_score || 0).replace('%', ''));
    return sc >= 80.0;
  }).length;

  const standardCount = candidates.filter(c => {
    const sc = parseFloat(String(c.career_fit_score || c.fit_score || 0).replace('%', ''));
    return sc >= 60.0 && sc < 80.0;
  }).length;

  const atRiskCount = candidates.filter(c => {
    const sc = parseFloat(String(c.career_fit_score || c.fit_score || 0).replace('%', ''));
    return sc < 60.0;
  }).length;

  const tier1Pct = total > 0 ? Math.round((tier1Count / total) * 100) : 0;
  const standardPct = total > 0 ? Math.round((standardCount / total) * 100) : 0;
  const atRiskPct = total > 0 ? Math.round((atRiskCount / total) * 100) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Cohort Placement Readiness & Risk Intelligence</h1>
          <p className="text-sm text-gray-500 mt-1">Recruitment eligibility distribution, mock interview status, and at-risk candidate queues.</p>
        </div>
        <RunSelector onRunChange={(newRunId) => loadData(newRunId)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-green-700 uppercase">Tier 1 Direct Ready (80%+ Fit)</span>
            <span className="text-xs font-black bg-green-100 text-green-900 px-2 py-0.5 rounded-full">{tier1Pct}% ({tier1Count}/{total})</span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full rounded-full" style={{ width: `${tier1Pct}%` }}></div>
          </div>
          <p className="text-xs text-gray-500">Eligible for direct high-package campus placement drives across product firms.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-yellow-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-yellow-700 uppercase">Standard Track (60% – 79% Fit)</span>
            <span className="text-xs font-black bg-yellow-100 text-yellow-900 px-2 py-0.5 rounded-full">{standardPct}% ({standardCount}/{total})</span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${standardPct}%` }}></div>
          </div>
          <p className="text-xs text-gray-500">Requires targeted technical competency refinement before Tier-1 placement rounds.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-red-700 uppercase">At-Risk / Urgent Prep (&lt;60% Fit)</span>
            <span className="text-xs font-black bg-red-100 text-red-900 px-2 py-0.5 rounded-full">{atRiskPct}% ({atRiskCount}/{total})</span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full rounded-full" style={{ width: `${atRiskPct}%` }}></div>
          </div>
          <p className="text-xs text-gray-500">Requires foundational remediation and specialized interview coaching.</p>
        </div>
      </div>
    </div>
  );
}
