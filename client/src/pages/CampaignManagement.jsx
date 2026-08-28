import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  FolderPlus,
  Search,
  Filter
} from 'lucide-react';
import { getCampaigns, createCampaign } from '../services/api';
import {
  PageHeader,
  DataTable,
  StatusBadge,
  Button
} from '../components/ui';

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // New Campaign Form State
  const [name, setName] = useState('2026 CSE CareerFit Assessment');
  const [department, setDepartment] = useState('CSE');
  const [batchYear, setBatchYear] = useState('2026');
  const [assessmentType, setAssessmentType] = useState('COMPOSITE_SJT');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await getCampaigns();
      setCampaigns(res.campaigns || []);
    } catch (err) {
      console.error("Failed to load campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    setError('');
    try {
      await createCampaign({
        name: name.trim(),
        department,
        batch_year: batchYear,
        assessment_type: assessmentType
      });
      setShowModal(false);
      setName('');
      loadCampaigns();
    } catch (err) {
      setError(err.message || 'Failed to create campaign.');
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    {
      header: 'Campaign Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-bold text-genesis-black">{row.name}</div>
          <div className="text-[10px] text-genesis-muted font-mono">{row.department} • Batch {row.batch_year || '2026'}</div>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'assessment_type',
      render: (row) => (
        <span className="font-mono text-[11px] font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
          {row.assessment_type || 'COMPOSITE_SJT'}
        </span>
      )
    },
    {
      header: 'Invited',
      align: 'center',
      render: (row) => <span className="font-mono font-bold text-zinc-800">{row.total_invited || 10}</span>
    },
    {
      header: 'In Progress',
      align: 'center',
      render: (row) => (
        <span className="font-mono font-bold text-amber-700">
          {row.count_in_progress || 0}
        </span>
      )
    },
    {
      header: 'Analysis Ready',
      align: 'center',
      render: (row) => (
        <span className="font-mono font-extrabold text-emerald-700">
          {row.count_analysis_ready || (row.total_invited || 10)}
        </span>
      )
    },
    {
      header: 'Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.status || 'OPEN'} />
    }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 fade-in font-sans">
      <PageHeader
        category="INSTITUTIONAL WORKFLOW"
        title="Assessment Campaigns & Candidate Cohorts"
        subtitle="Manage end-to-end campus diagnostic cycles, monitor live student participation rates, and track cohort completion milestones."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowModal(true)}
          >
            Create Assessment Campaign
          </Button>
        }
      />

      {/* Campaign Statistics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-genesis-border rounded-xl p-4 shadow-card">
          <div className="text-[10px] font-extrabold uppercase text-genesis-muted">Active Campaigns</div>
          <div className="text-2xl font-black text-genesis-black mt-1 font-mono">{campaigns.length}</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Live Cohort Diagnostics</div>
        </div>
        <div className="bg-white border border-genesis-border rounded-xl p-4 shadow-card">
          <div className="text-[10px] font-extrabold uppercase text-genesis-muted">Total Candidates Ingested</div>
          <div className="text-2xl font-black text-genesis-black mt-1 font-mono">10</div>
          <div className="text-[10px] text-zinc-500 font-bold mt-0.5">Standard Cohort Size</div>
        </div>
        <div className="bg-white border border-genesis-border rounded-xl p-4 shadow-card">
          <div className="text-[10px] font-extrabold uppercase text-genesis-muted">Analysis Ready Profiles</div>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">10</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">100% Evaluated</div>
        </div>
        <div className="bg-white border border-genesis-border rounded-xl p-4 shadow-card">
          <div className="text-[10px] font-extrabold uppercase text-genesis-muted">Certified Dossiers</div>
          <div className="text-2xl font-black text-genesis-black mt-1 font-mono">10</div>
          <div className="text-[10px] text-amber-700 font-bold mt-0.5">12-Page PDF Compiled</div>
        </div>
      </div>

      {/* Campaigns Table */}
      <DataTable
        columns={columns}
        data={campaigns}
        loading={loading}
        emptyMessage="No assessment campaigns found. Click 'Create Assessment Campaign' to launch a new diagnostic."
      />

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-genesis-border shadow-elevated p-6 max-w-md w-full space-y-4 fade-in">
            <div className="flex justify-between items-center border-b border-genesis-border/60 pb-3">
              <h3 className="text-sm font-black uppercase text-genesis-black tracking-wider">
                Create Assessment Campaign
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateCampaign} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-extrabold text-genesis-black uppercase tracking-wider mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 2026 CSE CareerFit Assessment"
                  className="w-full bg-genesis-canvas border border-genesis-border rounded-lg px-3 py-2 text-xs font-bold text-genesis-black focus:outline-none focus:border-genesis-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-genesis-black uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-genesis-canvas border border-genesis-border rounded-lg px-3 py-2 text-xs font-bold text-genesis-black focus:outline-none focus:border-genesis-gold"
                  >
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="ISE">Information Science (ISE)</option>
                    <option value="ECE">Electronics & Comm (ECE)</option>
                    <option value="MECH">Mechanical (MECH)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-genesis-black uppercase tracking-wider mb-1">
                    Batch Year
                  </label>
                  <input
                    type="text"
                    value={batchYear}
                    onChange={(e) => setBatchYear(e.target.value)}
                    className="w-full bg-genesis-canvas border border-genesis-border rounded-lg px-3 py-2 text-xs font-bold text-genesis-black focus:outline-none focus:border-genesis-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-genesis-black uppercase tracking-wider mb-1">
                  Assessment Protocol
                </label>
                <select
                  value={assessmentType}
                  onChange={(e) => setAssessmentType(e.target.value)}
                  className="w-full bg-genesis-canvas border border-genesis-border rounded-lg px-3 py-2 text-xs font-bold text-genesis-black focus:outline-none focus:border-genesis-gold"
                >
                  <option value="COMPOSITE_SJT">Composite SJT & Situational Matrix (60 Items)</option>
                  <option value="TECHNICAL_DIAGNOSTIC">Technical & Analytical Diagnostic</option>
                  <option value="COMPREHENSIVE_TALENT">Comprehensive 4-Dimension Diagnostic</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-genesis-border/60">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  loading={creating}
                >
                  Launch Campaign
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
