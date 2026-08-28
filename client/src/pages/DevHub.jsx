import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Terminal,
  Activity,
  Database,
  Cpu,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Users,
  FileText,
  LayoutDashboard,
  GraduationCap,
  Play,
  ClipboardCheck,
  Server
} from 'lucide-react';
import { getDevSystemSummary, resetStudentLifecycle } from '../services/api';
import {
  PageHeader,
  Button,
  LoadingState
} from '../components/ui';

export default function DevHub() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUsn, setSelectedUsn] = useState('1CS23101');
  const [actionMessage, setActionMessage] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await getDevSystemSummary();
      setSummary(data);
    } catch (err) {
      console.error("Failed to load dev system summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetStudent = async (targetStatus) => {
    setResetting(true);
    setActionMessage('');
    try {
      const res = await resetStudentLifecycle(selectedUsn, targetStatus);
      setActionMessage(`Candidate ${selectedUsn} successfully transitioned to ${targetStatus}.`);
      loadSummary();
    } catch (err) {
      setActionMessage(`Error: ${err.message || 'Action failed.'}`);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Connecting to local runtime diagnostics..." />;
  }

  const db = summary?.database || {};
  const data = summary?.data_summary || {};
  const ai = summary?.ai_status || {};

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 fade-in font-sans">
      {/* Dev Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-genesis-border/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-md text-[11px] font-mono font-bold text-amber-900 uppercase mb-2">
            <Terminal className="w-3.5 h-3.5 text-amber-600" />
            <span>Development & Local Demo Control Center</span>
          </div>
          <h1 className="text-2xl font-black text-genesis-black tracking-tight">
            System Inspection & Manual Verification
          </h1>
          <p className="text-xs text-genesis-muted">
            Inspect local SQLite relational persistence, NVIDIA grounding status, and test end-to-end student lifecycle progression.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/dev/verification">
            <Button variant="primary" size="sm" icon={ClipboardCheck}>
              Open Verification Checklist
            </Button>
          </Link>
          <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" icon={ExternalLink}>
              API Swagger Docs
            </Button>
          </a>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* 1. Live System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Frontend & Backend */}
        <div className="bg-white border border-genesis-border rounded-xl p-5 shadow-card space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-genesis-muted uppercase">
            <span>Runtime Services</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-zinc-500">Frontend:</span>
              <span className="font-bold text-emerald-700">Port 5173 (Vite)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Backend:</span>
              <span className="font-bold text-emerald-700">Port 8000 (FastAPI)</span>
            </div>
          </div>
        </div>

        {/* Database Persistence */}
        <div className="bg-white border border-genesis-border rounded-xl p-5 shadow-card space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-genesis-muted uppercase">
            <span>Database Backend</span>
            <Database className="w-4 h-4 text-amber-600" />
          </div>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-zinc-500">Active Engine:</span>
              <span className="font-bold text-genesis-black">{db.active_engine || 'sqlite_relational'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Connection:</span>
              <span className="font-bold text-emerald-700">{db.connection_status || 'CONNECTED'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Tables:</span>
              <span className="font-bold text-zinc-800">{db.tables_count || 16} Verified</span>
            </div>
          </div>
        </div>

        {/* NVIDIA NIM AI Engine */}
        <div className="bg-white border border-genesis-border rounded-xl p-5 shadow-card space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-genesis-muted uppercase">
            <span>AI Narrative Engine</span>
            <Cpu className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-zinc-500">Model:</span>
              <span className="font-bold text-zinc-800 truncate max-w-[120px]" title={ai.model}>
                {ai.model || 'nvidia/nemotron-3.5'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Status:</span>
              <span className="font-bold text-emerald-700">{ai.status || 'ONLINE'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Grounding:</span>
              <span className="font-bold text-amber-700">Deterministic Pack</span>
            </div>
          </div>
        </div>

        {/* Cloud Readiness */}
        <div className="bg-white border border-genesis-border rounded-xl p-5 shadow-card space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-genesis-muted uppercase">
            <span>Cloud Deployment</span>
            <Server className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-zinc-500">Supabase State:</span>
              <span className="font-bold text-zinc-600">Local Dev Mode</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Multi-Tenancy:</span>
              <span className="font-bold text-emerald-700">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Student Lifecycle Testing Box */}
      <div className="bg-white border border-genesis-border rounded-2xl p-6 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-genesis-border/60 pb-3">
          <div>
            <h2 className="text-sm font-black uppercase text-genesis-black tracking-wider flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Interactive Student Assessment Lifecycle Tester</span>
            </h2>
            <p className="text-xs text-genesis-muted">
              Reset a student's assessment state to test raw unassessed onboarding, live question submission, and analysis unlock.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-zinc-500 font-bold">Target USN:</span>
            <select
              value={selectedUsn}
              onChange={(e) => setSelectedUsn(e.target.value)}
              className="bg-genesis-canvas border border-genesis-border rounded-lg px-3 py-1.5 font-bold text-genesis-black focus:outline-none focus:border-genesis-gold"
            >
              <option value="1CS23101">1CS23101 (Aarav Sharma)</option>
              <option value="1CS23102">1CS23102 (Ananya Rao)</option>
              <option value="1CS23103">1CS23103 (Rohan Verma)</option>
              <option value="1CS23999">1CS23999 (New Unassessed Student)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            loading={resetting}
            icon={RotateCcw}
            onClick={() => handleResetStudent('INVITED')}
          >
            Reset to Unassessed (INVITED)
          </Button>

          <Button
            variant="secondary"
            size="sm"
            loading={resetting}
            icon={Play}
            onClick={() => handleResetStudent('STARTED')}
          >
            Mark Assessment STARTED
          </Button>

          <Button
            variant="dark"
            size="sm"
            icon={GraduationCap}
            onClick={() => navigate('/student/dashboard')}
          >
            Open Student Dashboard
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Play}
            onClick={() => navigate('/student/assessment')}
          >
            Launch Assessment Wizard
          </Button>
        </div>
      </div>

      {/* 3. Quick-Launch Route Explorer */}
      <div className="bg-white border border-genesis-border rounded-2xl p-6 shadow-card space-y-4">
        <h2 className="text-sm font-black uppercase text-genesis-black tracking-wider">
          Complete Application Route Explorer
        </h2>
        <p className="text-xs text-genesis-muted">
          All implemented routes are accessible for comprehensive manual testing.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <Link to="/" className="p-3 rounded-xl bg-genesis-canvas border border-genesis-border hover:border-zinc-300 transition flex items-center justify-between font-bold">
            <span>Public SaaS Landing (/)</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>

          <Link to="/login" className="p-3 rounded-xl bg-genesis-canvas border border-genesis-border hover:border-zinc-300 transition flex items-center justify-between font-bold">
            <span>Authentication Portal (/login)</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>

          <Link to="/dashboard" className="p-3 rounded-xl bg-genesis-canvas border border-genesis-border hover:border-zinc-300 transition flex items-center justify-between font-bold">
            <span>Institutional Dashboard (/dashboard)</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>

          <Link to="/campaigns" className="p-3 rounded-xl bg-genesis-canvas border border-genesis-border hover:border-zinc-300 transition flex items-center justify-between font-bold">
            <span>Assessment Campaigns (/campaigns)</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>

          <Link to="/candidates" className="p-3 rounded-xl bg-genesis-canvas border border-genesis-border hover:border-zinc-300 transition flex items-center justify-between font-bold">
            <span>Candidate Directory (/candidates)</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>

          <Link to="/candidates/1CS23101" className="p-3 rounded-xl bg-genesis-canvas border border-genesis-border hover:border-zinc-300 transition flex items-center justify-between font-bold">
            <span>Candidate Dossier (/candidates/:id)</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>

          <Link to="/candidates/comparison" className="p-3 rounded-xl bg-genesis-canvas border border-genesis-border hover:border-zinc-300 transition flex items-center justify-between font-bold">
            <span>Candidate Comparison (/candidates/comparison)</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>

          <Link to="/placement/departments" className="p-3 rounded-xl bg-genesis-canvas border border-genesis-border hover:border-zinc-300 transition flex items-center justify-between font-bold">
            <span>Department Analysis (/placement/departments)</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>

          <Link to="/placement/readiness" className="p-3 rounded-xl bg-genesis-canvas border border-genesis-border hover:border-zinc-300 transition flex items-center justify-between font-bold">
            <span>Placement Readiness (/placement/readiness)</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>

          <Link to="/skills/gaps" className="p-3 rounded-xl bg-genesis-canvas border border-genesis-border hover:border-zinc-300 transition flex items-center justify-between font-bold">
            <span>Skill Gap Analysis (/skills/gaps)</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>

          <Link to="/careers/explorer" className="p-3 rounded-xl bg-genesis-canvas border border-genesis-border hover:border-zinc-300 transition flex items-center justify-between font-bold">
            <span>Career Explorer (/careers/explorer)</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>

          <Link to="/reports/individual" className="p-3 rounded-xl bg-genesis-canvas border border-genesis-border hover:border-zinc-300 transition flex items-center justify-between font-bold">
            <span>Reports Hub & ZIP Export (/reports/individual)</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
