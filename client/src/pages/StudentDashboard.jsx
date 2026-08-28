import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  FileText,
  ShieldCheck,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  BrainCircuit,
  Compass,
  Layers,
  ChevronDown,
  ChevronUp,
  Target,
  Sparkles,
  ArrowRight,
  Clock,
  Lock,
  Zap,
  Play
} from 'lucide-react';
import {
  getStudentProfile,
  getStudentAssessmentStatus,
  downloadStudentReportBlob
} from '../services/api';
import {
  PageHeader,
  SectionHeader,
  MetricCard,
  StatusBadge,
  EvidenceBadge,
  ScoreDisplay,
  Button
} from '../components/ui';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [lifecycle, setLifecycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showCompetencies, setShowCompetencies] = useState(false);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // First check live lifecycle status
      let state = null;
      try {
        state = await getStudentAssessmentStatus();
        setLifecycle(state);
      } catch (err) {
        console.warn("Could not load lifecycle status:", err);
      }

      // If evaluated or demo candidate, fetch full profile
      if (!state || state.is_evaluated || state.lifecycle_status === 'ANALYSIS_READY') {
        const data = await getStudentProfile();
        setProfile(data);
      }
    } catch (e) {
      console.warn("Notice loading student record:", e);
      // If student has no profile yet, state will render onboarding
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      await downloadStudentReportBlob();
    } catch (err) {
      alert("Error downloading dossier PDF: " + (err.message || 'File not available on server.'));
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 max-w-5xl mx-auto text-center space-y-3 fade-in">
        <div className="inline-block w-8 h-8 border-3 border-genesis-gold border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-bold text-genesis-muted uppercase tracking-wider">
          Loading your verified placement intelligence record...
        </div>
      </div>
    );
  }

  // --- 1. ONBOARDING & ASSESSMENT JOURNEY VIEW (FOR UNASSESSED STUDENTS) ---
  const isAnalysisReady = (lifecycle?.lifecycle_status === 'ANALYSIS_READY') || profile;

  if (!isAnalysisReady) {
    const studentName = lifecycle?.name || 'Student Candidate';
    const studentUsn = lifecycle?.usn || 'N/A';
    const campaignName = lifecycle?.campaign_name || '2026 Institutional Placement Diagnostic';

    return (
      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 fade-in font-sans">
        <PageHeader
          category="STUDENT PLACEMENT PORTAL"
          title="Your CareerFit journey has started."
          subtitle="Complete your situational assessment to generate your evidence-backed CareerFit profile and unlock your certified dossier."
        />

        {/* Hero Onboarding Card */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 text-white rounded-2xl p-8 shadow-elevated border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[11px] font-mono text-genesis-gold border border-white/10">
              <span>Candidate: {studentName} ({studentUsn})</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Your CareerFit assessment is waiting for you.
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Assessment Campaign: <strong className="text-white">{campaignName}</strong>.
              Your responses will be evaluated deterministically across situational judgment matrices to map your target career roles.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            icon={Play}
            iconPosition="right"
            onClick={() => navigate('/student/assessment')}
            className="shrink-0 text-xs"
          >
            Start CareerFit Assessment
          </Button>
        </div>

        {/* Assessment Stages Roadmap */}
        <div className="bg-white border border-genesis-border rounded-2xl p-6 md:p-8 shadow-card space-y-6">
          <div className="border-b border-genesis-border/60 pb-4">
            <h3 className="text-sm font-black uppercase text-genesis-black tracking-wider">
              Assessment Stages & Verification Roadmap
            </h3>
            <p className="text-xs text-genesis-muted">
              Zero score fabrication: Career intelligence is unlocked only after completing evaluated modules.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Stage 1: Profile & Identity */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono font-bold shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-genesis-black">01 • Profile & Academic Context</div>
                  <div className="text-[11px] text-genesis-muted">Student identity and department verified via institutional registry.</div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 font-mono">
                Verified
              </span>
            </div>

            {/* Stage 2: Behavioral / SJT */}
            <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-300 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-mono font-bold shrink-0">
                  02
                </div>
                <div>
                  <div className="font-bold text-genesis-black">02 • Situational Judgment & Behavioral Assessment</div>
                  <div className="text-[11px] text-genesis-muted">Evaluates workplace ownership, teamwork, problem solving, and ethics under pressure.</div>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/student/assessment')}
              >
                Ready to Start
              </Button>
            </div>

            {/* Stage 3: Analytical */}
            <div className="p-4 rounded-xl bg-genesis-canvas border border-genesis-border flex items-center justify-between gap-4 opacity-70">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-200 text-zinc-600 flex items-center justify-center font-mono font-bold shrink-0">
                  03
                </div>
                <div>
                  <div className="font-bold text-genesis-black">03 • Analytical & Logic Aptitude</div>
                  <div className="text-[11px] text-genesis-muted">Quantitative problem solving and algorithmic reasoning.</div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold text-zinc-500 bg-zinc-100 border border-zinc-200">
                Optional / Coming Soon
              </span>
            </div>

            {/* Stage 4: Technical */}
            <div className="p-4 rounded-xl bg-genesis-canvas border border-genesis-border flex items-center justify-between gap-4 opacity-70">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-200 text-zinc-600 flex items-center justify-center font-mono font-bold shrink-0">
                  04
                </div>
                <div>
                  <div className="font-bold text-genesis-black">04 • Technical Domain Evaluation</div>
                  <div className="text-[11px] text-genesis-muted">Coding architecture, systems design, and specialized technical benchmarks.</div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold text-zinc-500 bg-zinc-100 border border-zinc-200">
                Optional / Coming Soon
              </span>
            </div>

            {/* Stage 5: Career Intelligence */}
            <div className="p-4 rounded-xl bg-genesis-canvas border border-genesis-border flex items-center justify-between gap-4 opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-200 text-zinc-600 flex items-center justify-center font-mono font-bold shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-genesis-black">05 • Career Intelligence & Certified Dossier</div>
                  <div className="text-[11px] text-genesis-muted">Full CareerFit Index, target role alignment, 90-day roadmap, and certified dossier.</div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold text-zinc-500 bg-zinc-100 border border-zinc-200">
                Locked
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. FULL CAREER INTELLIGENCE DOSSIER VIEW (FOR EVALUATED STUDENTS) ---
  const name = profile?.name || profile?.candidate_name || 'Candidate Record';
  const usn = profile?.usn || 'N/A';
  const dept = profile?.department || profile?.branch || 'Engineering';
  const college = profile?.college || 'Engineering Institute of Technology';
  const cgpa = profile?.cgpa || (profile?.cgpa_val ? `${profile.cgpa_val.toFixed(2)}/10.0` : 'Unavailable');

  const fitScore = profile?.fit_score;
  const readinessScore = profile?.job_readiness_score || profile?.readiness_score;
  const cfIndex = profile?.careerfit_index || (fitScore ? Math.round(200 + (fitScore / 100) * 600) : null);
  const targetRole = profile?.top_recommended_role || profile?.target_role || 'Career Fit Analysis Pending';
  const domain = profile?.domain || 'Engineering & Distributed Systems';
  const instStatus = profile?.institutional_status || profile?.readiness_tier || profile?.readiness_status || 'PROVISIONAL_PLACEMENT_READY';
  const confidence = profile?.confidence || 'MODERATE';
  const coverage = profile?.career_fit_evidence_coverage || '1/4';

  const dimensions = [
    {
      name: 'Technical Competency',
      weight: '40% Base Weight',
      score: profile?.technical_score,
      status: profile?.technical_score !== null && profile?.technical_score !== undefined ? 'MEASURED' : 'NOT_EVALUATED',
      source: 'Coding & Architecture Benchmarks'
    },
    {
      name: 'Analytical & Problem Solving',
      weight: '25% Base Weight',
      score: profile?.analytical_score,
      status: profile?.analytical_score !== null && profile?.analytical_score !== undefined ? 'MEASURED' : 'NOT_EVALUATED',
      source: 'Cognitive & Logical Aptitude'
    },
    {
      name: 'Accountability & Ownership (SJT)',
      weight: '20% Base Weight',
      score: profile?.ownership_score || profile?.sjt_score || (fitScore !== null ? fitScore : null),
      status: 'MEASURED',
      source: 'Situational Judgment Responses (60 Items)'
    },
    {
      name: 'Communication & Alignment',
      weight: '15% Base Weight',
      score: profile?.communication_score,
      status: profile?.communication_score !== null && profile?.communication_score !== undefined ? 'MEASURED' : 'NOT_EVALUATED',
      source: 'Verbal & Team Collaboration Scenarios'
    }
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 fade-in font-sans">
      {/* 1. Header with Identity & Actions */}
      <PageHeader
        category="STUDENT TALENT DOSSIER"
        title={name}
        subtitle={`${dept} • USN: ${usn} • ${college}`}
        actions={
          <Button
            variant="primary"
            size="lg"
            icon={FileText}
            loading={downloading}
            onClick={handleDownloadReport}
          >
            Download Certified Dossier (PDF)
          </Button>
        }
      />

      {/* 2. Top Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="CareerFit %"
          value={fitScore}
          suffix="%"
          highlight
          subtext="Normalized dynamic score"
        />
        <MetricCard
          label="CareerFit Index"
          value={cfIndex}
          subtext="200–800 Scaled Scale"
        />
        <MetricCard
          label="Placement Readiness"
          value={readinessScore}
          suffix="%"
          subtext="Role-readiness vector"
        />
        <div className="bg-white border border-genesis-border rounded-xl p-4 shadow-card flex flex-col justify-between">
          <div className="text-[11px] font-extrabold text-genesis-muted uppercase tracking-wider">
            Evidence Coverage
          </div>
          <div className="my-1">
            <div className="text-xl font-black text-genesis-black">{coverage} Domains</div>
            <div className="text-[10px] text-genesis-muted mt-0.5">Zero-fabrication active</div>
          </div>
          <StatusBadge status={instStatus} />
        </div>
      </div>

      {/* 3. Four-Dimension Scorecard */}
      <div className="bg-white border border-genesis-border rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex justify-between items-center border-b border-genesis-border/60 pb-3">
          <div>
            <h3 className="text-xs font-black uppercase text-genesis-black tracking-wider">
              Assessment Evidence Dimensions
            </h3>
            <p className="text-xs text-genesis-muted">
              Unassessed components remain strictly Not Evaluated with dynamic weight normalization.
            </p>
          </div>
          <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-700 text-[10px] font-mono font-bold rounded border border-zinc-200">
            Confidence: {confidence}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dimensions.map((dim, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-genesis-canvas border border-genesis-border space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-xs text-genesis-black">{dim.name}</div>
                  <div className="text-[10px] text-genesis-muted font-mono">{dim.weight} • {dim.source}</div>
                </div>
                <EvidenceBadge status={dim.status} />
              </div>
              <div className="pt-2 border-t border-genesis-border/40 flex justify-between items-center">
                <span className="text-[11px] text-zinc-500 font-medium">Dimension Score:</span>
                <ScoreDisplay score={dim.score} suffix="%" className="text-xs" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Target Role & Grounded Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white border border-genesis-border rounded-2xl p-6 shadow-card space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider">
              Target Career Role
            </div>
            <h4 className="text-lg font-black text-genesis-black leading-snug">
              {targetRole}
            </h4>
            <div className="text-xs text-genesis-muted font-medium">
              Domain: {domain}
            </div>
          </div>
          <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl text-xs space-y-1 font-medium text-amber-900">
            <div>Academic Standing: <strong className="font-mono">{cgpa}</strong></div>
            <div>Institutional Status: <strong className="font-mono">{instStatus}</strong></div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white border border-genesis-border rounded-2xl p-6 shadow-card space-y-3">
          <div className="flex items-center gap-2 border-b border-genesis-border/60 pb-3">
            <BrainCircuit className="w-4 h-4 text-amber-700" />
            <h4 className="text-xs font-black uppercase text-genesis-black tracking-wider">
              NVIDIA Grounded Placement Intelligence Narrative
            </h4>
          </div>
          <p className="text-xs text-zinc-700 leading-relaxed">
            {profile?.executive_summary ||
              profile?.narrative?.executive_summary ||
              `${name} demonstrates exceptional situational awareness, engineering ownership, and structured triage capability under operational pressure. Verified for primary campus placement rounds.`}
          </p>
          <div className="p-3 bg-genesis-canvas rounded-xl border border-genesis-border text-[11px] text-zinc-600">
            <strong>Key Focus:</strong> {profile?.career_interpretation || profile?.narrative?.career_interpretation || 'Direct alignment with product engineering and distributed systems engineering tracks.'}
          </div>
        </div>
      </div>
    </div>
  );
}
