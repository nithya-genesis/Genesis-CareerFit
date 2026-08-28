import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Archive,
  Search,
  Download,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  getLatestCandidates,
  downloadReportPdfBlob,
  downloadPlacementSummaryPdfBlob,
  downloadReportsZipBlob,
  getActiveRunId
} from '../services/api';
import RunSelector from '../components/RunSelector';

export default function ReportsHub() {
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportFormat, setReportFormat] = useState('DOSSIER'); // 'DOSSIER' (12-page) or 'SUMMARY' (6-page)
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState({});

  const currentRunId = searchParams.get('run_id') || getActiveRunId();

  useEffect(() => {
    loadReports(currentRunId);
  }, [currentRunId]);

  const loadReports = async (targetRunId = null) => {
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
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    return !searchQuery ||
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.usn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.top_recommended_role || c.target_role)?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      await downloadReportsZipBlob();
    } catch (err) {
      alert(err.message || 'Failed to download reports ZIP archive.');
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDownloadPdf = async (candidate, formatOverride = null) => {
    const cleanId = candidate.usn || candidate.candidate_id || candidate.id;
    const safeName = (candidate.name || 'Candidate').replace(/\s+/g, '_');
    const safeUsn = (candidate.usn || 'USN').trim();
    const effectiveFormat = formatOverride || reportFormat;
    const isSummary = effectiveFormat === 'SUMMARY';

    const filename = isSummary
      ? `CareerFit_Summary_${safeName}_${safeUsn}.pdf`
      : `CareerFit_Report_${safeName}_${safeUsn}_MASTER.pdf`;

    setDownloadingPdf(prev => ({ ...prev, [filename]: true }));
    try {
      if (isSummary) {
        await downloadPlacementSummaryPdfBlob(cleanId, filename, candidate.assessment_run_id || candidate.run_id || null);
      } else {
        await downloadReportPdfBlob(cleanId, filename, candidate.assessment_run_id || candidate.run_id || null);
      }
    } catch (err) {
      alert(err.message || 'Failed to download report PDF.');
    } finally {
      setDownloadingPdf(prev => ({ ...prev, [filename]: false }));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-yellow-500" />
            <span>Dossiers &amp; Certified Reports Hub</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Download certified 12-page executive dossiers and 6-page institutional placement summaries with Genesis logo watermark.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <RunSelector onRunChange={(rId) => loadReports(rId)} />
          <button
            onClick={handleDownloadZip}
            disabled={downloadingZip || candidates.length === 0}
            className="px-4 py-2.5 bg-black hover:bg-zinc-800 text-yellow-400 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 border border-black shadow-sm disabled:opacity-50"
          >
            <Archive className="w-4 h-4" />
            <span>{downloadingZip ? 'Archiving ZIP...' : 'Download Run ZIP'}</span>
          </button>
        </div>
      </div>

      {/* Report Type & Page Preset Selector Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-yellow-500" />
              <span>Report Compilation Preset &amp; Page Filtering</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Select between the complete 12-page Master Dossier and the condensed 6-page Placement Summary.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setReportFormat('DOSSIER')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                reportFormat === 'DOSSIER'
                  ? 'bg-black text-yellow-400 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Full Master Dossier (12 Pages)
            </button>
            <button
              onClick={() => setReportFormat('SUMMARY')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                reportFormat === 'SUMMARY'
                  ? 'bg-black text-yellow-400 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Placement Summary (6 Pages)
            </button>
          </div>
        </div>

        {/* Page Structure Checklist Preview */}
        <div className="pt-3 border-t border-gray-100">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            {reportFormat === 'SUMMARY' ? 'Placement Summary Active Page Structure (Strict 6-Page Order):' : 'Master Dossier Complete 12-Page Structure:'}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
            {[
              { num: 1, name: 'Executive Profile', inSummary: true },
              { num: 2, name: 'Scorecard & Index', inSummary: true },
              { num: 3, name: 'Evidence Scope', inSummary: false },
              { num: 4, name: 'SJT Dimensions', inSummary: false },
              { num: 5, name: 'Behavioral Traits', inSummary: false },
              { num: 6, name: 'Top Recommendation', inSummary: true },
              { num: 7, name: 'Career Matrix', inSummary: false },
              { num: 8, name: 'Skill Gap Matrix', inSummary: true },
              { num: 9, name: '90-Day Roadmap', inSummary: true },
              { num: 10, name: 'Interview Probes', inSummary: false },
              { num: 11, name: 'Strategic Diagnostic', inSummary: true },
              { num: 12, name: 'Certified Integrity', inSummary: false },
            ].map((p) => {
              const active = reportFormat === 'DOSSIER' || p.inSummary;
              return (
                <div
                  key={p.num}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    active
                      ? 'bg-yellow-50/70 border-yellow-300/80 text-yellow-950 font-semibold shadow-2xs'
                      : 'bg-gray-50/50 border-gray-200 text-gray-400 line-through opacity-60'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold">PAGE {p.num}</div>
                  <div className="text-[11px] truncate">{p.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Candidates Reports Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gray-50/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search candidate name, USN, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
            />
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-900">{filteredCandidates.length}</span> certified candidate reports
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-500 text-sm">Loading candidate records...</div>
        ) : filteredCandidates.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            {currentRunId ? 'No candidates matching search query.' : 'Please select an assessment run above.'}
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black text-white uppercase font-bold text-[11px]">
                <th className="py-3 px-4">Candidate &amp; USN</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">CGPA</th>
                <th className="py-3 px-4 text-center">CareerFit Index</th>
                <th className="py-3 px-4">Top Career Recommendation</th>
                <th className="py-3 px-4 text-center">Readiness</th>
                <th className="py-3 px-4 text-right">Report Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCandidates.map((c) => {
                const cfScore = c.careerfit_index || c.scores?.overall_index || c.fit_score || 'N/A';
                const cgpaVal = c.cgpa !== null && c.cgpa !== undefined ? Number(c.cgpa).toFixed(2) : 'N/A';
                const roleName = c.top_recommended_role || c.primary_role || 'Career Fit Analysis Pending';
                const readiness = c.fit_tier || c.quadrant_label || 'Provisional Ready';

                return (
                  <tr key={c.usn || c.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      <div>{c.name || c.full_name}</div>
                      <div className="text-[10px] font-mono text-gray-500 font-normal">{c.usn}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 font-medium">{c.department || c.branch}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold">{cgpaVal}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-extrabold text-gray-900 font-mono">
                        {cfScore !== 'N/A' ? `${cfScore} / 800` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-800">{roleName}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {readiness}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleDownloadPdf(c, 'SUMMARY')}
                          className="px-2.5 py-1.5 text-[11px] font-bold bg-yellow-50 hover:bg-yellow-100 text-yellow-900 rounded-lg border border-yellow-300 transition-all flex items-center gap-1"
                        >
                          <Download className="w-3 h-3 text-yellow-700" />
                          <span>6-Page Summary</span>
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(c, 'DOSSIER')}
                          className="px-2.5 py-1.5 text-[11px] font-bold bg-black hover:bg-zinc-800 text-white rounded-lg transition-all flex items-center gap-1"
                        >
                          <Download className="w-3 h-3 text-yellow-400" />
                          <span>12-Page Dossier</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
