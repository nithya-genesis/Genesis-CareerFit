import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileText,
  Archive,
  GitCompare,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Compass
} from 'lucide-react';
import {
  getLatestCandidates,
  getDashboardStats,
  getPlacementMatrix,
  downloadReportPdfBlob,
  downloadReportsZipBlob,
  getActiveRunId
} from '../services/api';
import RunSelector from '../components/RunSelector';
import {
  PageHeader,
  SectionHeader,
  MetricCard,
  StatusBadge,
  ScoreDisplay,
  DataTable,
  Button
} from '../components/ui';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState(null);
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState({});

  const currentRunId = searchParams.get('run_id') || getActiveRunId();

  useEffect(() => {
    loadDashboardData(currentRunId);
  }, [currentRunId]);

  const loadDashboardData = async (targetRunId = null) => {
    setLoading(true);
    try {
      const runId = targetRunId || searchParams.get('run_id') || getActiveRunId();
      if (!runId) {
        setCandidates([]);
        setStats({});
        setMatrix({});
        return;
      }
      const [candsData, statsData, matrixData] = await Promise.all([
        getLatestCandidates(runId),
        getDashboardStats(runId),
        getPlacementMatrix(runId)
      ]);
      setCandidates(Array.isArray(candsData) ? candsData : (candsData?.candidates || []));
      setStats(statsData || {});
      setMatrix(matrixData || {});
    } catch (err) {
      console.error("Dashboard loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const departments = ['ALL', ...new Set(candidates.map(c => c.department || c.branch).filter(Boolean))];

  const filteredCandidates = candidates.filter(c => {
    const matchesDept = deptFilter === 'ALL' || (c.department || c.branch) === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || (c.readiness_status || c.readiness_tier || '').toUpperCase().includes(statusFilter);
    const matchesSearch = !searchQuery || 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.usn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.top_recommended_role || c.target_role)?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesStatus && matchesSearch;
  });

  const totalEval = candidates.length;
  const placementReady = candidates.filter(c => {
    const st = (c.readiness_status || c.readiness_tier || '').toUpperCase();
    return st.includes('READY') || st.includes('TIER-1');
  }).length;
  const provisionalCount = candidates.filter(c => {
    const st = (c.readiness_status || c.readiness_tier || '').toUpperCase();
    return st.includes('PROVISIONAL') || st.includes('DEVELOP');
  }).length;
  const needsDev = totalEval - placementReady;

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      await downloadReportsZipBlob();
    } catch (err) {
      alert(err.message || 'Failed to download batch ZIP archive.');
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDownloadPdf = async (e, candidate) => {
    e.stopPropagation();
    const cleanIdentifier = candidate.usn || candidate.candidate_id || candidate.id;
    const safeName = (candidate.name || 'Candidate').replace(/\s+/g, '_');
    const safeUsn = (candidate.usn || 'USN').trim();
    const filename = candidate.pdf_filename || `${safeName}_${safeUsn}_CareerFit_Dossier.pdf`;

    setDownloadingPdf(prev => ({ ...prev, [filename]: true }));
    try {
      await downloadReportPdfBlob(cleanIdentifier, filename);
    } catch (err) {
      alert(err.message || 'Failed to download candidate dossier PDF.');
    } finally {
      setDownloadingPdf(prev => ({ ...prev, [filename]: false }));
    }
  };

  const columns = [
    {
      header: 'Candidate Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-bold text-genesis-black hover:text-amber-700 transition">
            {row.name}
          </div>
          <div className="text-[10px] text-genesis-muted">
            {row.department || row.branch} • Batch 2026
          </div>
        </div>
      )
    },
    {
      header: 'USN',
      accessor: 'usn',
      render: (row) => <span className="font-mono font-bold text-zinc-700">{row.usn}</span>
    },
    {
      header: 'Top Recommended Role',
      accessor: 'target_role',
      render: (row) => (
        <span className="font-medium text-zinc-800">
          {row.top_recommended_role || row.target_role || 'Insufficient Evidence'}
        </span>
      )
    },
    {
      header: 'CareerFit Index',
      align: 'center',
      render: (row) => (
        <ScoreDisplay
          score={row.overall_index || row.careerfit_index || Math.round(200 + ((row.fit_score || 0) / 100) * 600)}
          suffix=""
          scale="800"
          className="text-genesis-black"
        />
      )
    },
    {
      header: 'Career Fit %',
      align: 'center',
      render: (row) => (
        <ScoreDisplay
          score={row.fit_score}
          suffix="%"
          className="text-amber-700 font-bold"
        />
      )
    },
    {
      header: 'Placement Readiness',
      align: 'center',
      render: (row) => (
        <ScoreDisplay
          score={row.job_readiness_score || row.readiness_score}
          suffix="%"
          className="text-emerald-700 font-bold"
        />
      )
    },
    {
      header: 'Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.readiness_tier || row.readiness_status} />
    },
    {
      header: 'Action',
      align: 'right',
      render: (row) => {
        const safeName = (row.name || 'Candidate').replace(/\s+/g, '_');
        const safeUsn = (row.usn || 'USN').trim();
        const filename = row.pdf_filename || `${safeName}_${safeUsn}_CareerFit_Dossier.pdf`;
        const isDownloading = Boolean(downloadingPdf[filename]);

        return (
          <Button
            size="sm"
            variant="secondary"
            icon={FileText}
            loading={isDownloading}
            onClick={(e) => handleDownloadPdf(e, row)}
            className="text-[11px]"
          >
            12P Dossier
          </Button>
        );
      }
    }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 fade-in">
      {/* Page Header */}
      <PageHeader
        category="INSTITUTIONAL PLACEMENT COMMAND CENTER"
        title="Cohort Placement Health & Talent Alignment"
        subtitle="Real-time deterministic assessment verification, branch-level talent readiness, and certified 12-page candidate dossiers."
        actions={
          <>
            <RunSelector onRunChange={(newRunId) => loadDashboardData(newRunId)} />
            <Button
              variant="secondary"
              icon={GitCompare}
              onClick={() => navigate('/candidates/comparison')}
            >
              Compare Talent
            </Button>
            <Button
              variant="primary"
              icon={Archive}
              loading={downloadingZip}
              onClick={handleDownloadZip}
            >
              Download All Reports (ZIP)
            </Button>
          </>
        }
      />

      {/* Empty State when no assessment uploaded */}
      {!loading && candidates.length === 0 && (
        <div className="bg-white border border-dashed border-genesis-border rounded-2xl p-10 text-center shadow-subtle space-y-4">
          <div className="w-12 h-12 bg-amber-50 border border-genesis-gold/40 rounded-xl flex items-center justify-center mx-auto text-amber-800">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-genesis-black">No assessment data available yet.</h3>
            <p className="text-xs text-genesis-muted max-w-md mx-auto">
              Upload an assessment workbook (.csv / .xlsx) to discover schema, evaluate candidates, and generate placement intelligence.
            </p>
          </div>
          <div className="text-xs text-genesis-muted font-mono">
            Contact your Institution Administrator to upload and publish an assessment cohort.
          </div>
        </div>
      )}

      {/* Executive KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <MetricCard
          title="Total Evaluated"
          value={totalEval}
          subtitle="Assessed Cohort"
          icon={Users}
        />
        <MetricCard
          title="Placement Ready"
          value={placementReady}
          subtitle="Direct Tier-1 Track"
          icon={CheckCircle2}
          highlight={true}
        />
        <MetricCard
          title="Provisional Ready"
          value={provisionalCount}
          subtitle="Domain Aligned"
          icon={TrendingUp}
        />
        <MetricCard
          title="Needs Upskilling"
          value={needsDev}
          subtitle="Action Recommended"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Evidence Coverage"
          value={candidates[0]?.career_fit_evidence_coverage || "1/4"}
          subtitle="SJT Verified"
          icon={Layers}
        />
        <MetricCard
          title="Avg CareerFit"
          value={candidates.length > 0 ? `${(candidates.reduce((acc, c) => acc + (parseFloat(c.fit_score) || 0), 0) / candidates.length).toFixed(1)}%` : '—'}
          subtitle="Cohort Mean"
          icon={Activity}
        />
      </div>

      {/* 4-Quadrant Placement Matrix Model */}
      <div className="bg-white border border-genesis-border rounded-xl p-5 shadow-card space-y-4">
        <SectionHeader
          title="CareerFit × Job Readiness 4-Quadrant Matrix"
          subtitle="Deterministic multi-dimensional candidate positioning"
          badge="Live Distribution"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Q2: Develop & Align */}
          <div className="border border-amber-200 bg-amber-50/30 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold uppercase text-amber-900 text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Q2: Develop & Align (High Fit / Developing Readiness)
              </span>
              <span className="px-2 py-0.5 bg-amber-100/80 text-amber-800 font-bold rounded text-[10px]">
                High Directional Affinity
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Candidates possess strong behavioral alignment with target domain but require project speed-drills and technical mock sessions prior to enterprise interviews.
            </p>
          </div>

          {/* Q1: Placement Ready */}
          <div className="border border-emerald-200 bg-emerald-50/30 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold uppercase text-emerald-900 text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Q1: Placement Ready (High Fit / High Readiness)
              </span>
              <span className="px-2 py-0.5 bg-emerald-100/80 text-emerald-800 font-bold rounded text-[10px]">
                Tier-1 Qualified
              </span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed font-medium">
              Verified top-tier candidates recommended for primary campus recruitment drives, product engineering roles, and high-package enterprise interviews.
            </p>
          </div>

          {/* Q4: Guidance Required */}
          <div className="border border-zinc-300 bg-zinc-50/60 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold uppercase text-zinc-900 text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-500" />
                Q4: Remediation Track (Low Fit / Low Readiness)
              </span>
              <span className="px-2 py-0.5 bg-zinc-200 text-zinc-700 font-bold rounded text-[10px]">
                Remediation Track
              </span>
            </div>
            <p className="text-xs text-zinc-700 leading-relaxed font-medium">
              Foundational aptitude remediation and structured domain training required prior to scheduling placement drives.
            </p>
          </div>

          {/* Q3: Explore Alternatives */}
          <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold uppercase text-blue-900 text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Q3: Explore Alternatives (Developing Fit / High Readiness)
              </span>
              <span className="px-2 py-0.5 bg-blue-100/80 text-blue-800 font-bold rounded text-[10px]">
                Cross-Domain Pivot
              </span>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              Strong baseline execution readiness that demonstrates higher suitability for adjacent technical tracks or specialized consulting tracks.
            </p>
          </div>
        </div>
      </div>

      {/* Candidate Talent Roster */}
      <div className="space-y-3">
        {/* Table Filters Header */}
        <div className="bg-white border border-genesis-border rounded-xl p-4 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-genesis-black">
              Talent Roster
            </span>
            <span className="text-xs text-genesis-muted font-medium">
              ({filteredCandidates.length} candidates)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-genesis-muted" />
              <input
                type="text"
                placeholder="Filter by name, USN, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-genesis-canvas border border-genesis-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-genesis-black placeholder-genesis-muted focus:outline-none focus:border-genesis-gold"
              />
            </div>

            {/* Department Dropdown */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-white border border-genesis-border rounded-lg px-3 py-1.5 text-xs font-bold text-genesis-black focus:outline-none focus:border-genesis-gold"
            >
              {departments.map((dept, i) => (
                <option key={i} value={dept}>
                  {dept === 'ALL' ? 'All Departments' : dept}
                </option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-genesis-border rounded-lg px-3 py-1.5 text-xs font-bold text-genesis-black focus:outline-none focus:border-genesis-gold"
            >
              <option value="ALL">All Placement Tiers</option>
              <option value="READY">Placement Ready</option>
              <option value="PROVISIONAL">Provisional</option>
            </select>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={filteredCandidates}
          loading={loading}
          emptyMessage="No candidates found matching the selected filter criteria."
          onRowClick={(row) => navigate(`/candidates/${row.usn || row.id}`)}
        />
      </div>
    </div>
  );
}
