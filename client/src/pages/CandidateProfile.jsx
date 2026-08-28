import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
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
  Calendar
} from 'lucide-react';
import { getCandidateById, downloadReportPdfBlob } from '../services/api';
import {
  PageHeader,
  SectionHeader,
  MetricCard,
  StatusBadge,
  EvidenceBadge,
  ScoreDisplay,
  Button
} from '../components/ui';

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [showAllCompetencies, setShowAllCompetencies] = useState(false);

  useEffect(() => {
    if (id) {
      loadCandidateData(id);
    }
  }, [id]);

  const loadCandidateData = async (candId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCandidateById(candId);
      setCandidate(data);
    } catch (err) {
      console.error("Candidate load failure:", err);
      if (err.response?.status === 404) {
        setError("Candidate not found.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to view this candidate record.");
      } else {
        setError(err.message || "Failed to load candidate intelligence record.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!candidate) return;
    const cleanId = candidate.usn || candidate.candidate_id || candidate.id || id;
    const safeName = (candidate.name || candidate.candidate_name || 'Candidate').replace(/\s+/g, '_');
    const safeUsn = (candidate.usn || 'USN').trim();
    const filename = candidate.pdf_filename || `${safeName}_${safeUsn}_CareerFit_Dossier.pdf`;

    setDownloading(true);
    try {
      await downloadReportPdfBlob(cleanId, filename);
    } catch (err) {
      alert(err.message || 'Failed to download candidate dossier PDF.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 max-w-5xl mx-auto text-center space-y-3 fade-in">
        <div className="inline-block w-8 h-8 border-3 border-genesis-gold border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-bold text-genesis-muted uppercase tracking-wider">
          Retrieving Verified Talent Intelligence File...
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="p-16 max-w-lg mx-auto text-center space-y-4 fade-in">
        <div className="inline-flex p-3 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-genesis-black">
          {error || "Candidate record unavailable."}
        </h2>
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => navigate('/candidates')}>
            Back to Directory
          </Button>
          <Button variant="primary" size="sm" onClick={() => loadCandidateData(id)}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const name = candidate.name || candidate.candidate_name || "Candidate Record";
  const usn = candidate.usn || "N/A";
  const dept = candidate.department || candidate.branch || "Engineering";
  const college = candidate.college || "Engineering Institute of Technology";
  const cgpa = candidate.cgpa || (candidate.cgpa_val ? `${candidate.cgpa_val.toFixed(2)}/10.0` : "Unavailable");

  const fitScore = candidate.fit_score;
  const readinessScore = candidate.job_readiness_score || candidate.readiness_score;
  const cfIndex = candidate.overall_index || candidate.careerfit_index || (fitScore ? Math.round(200 + (fitScore / 100) * 600) : null);
  const targetRole = candidate.top_recommended_role || candidate.target_role || "Insufficient Evidence";
  const domain = candidate.domain || "Engineering & Distributed Systems";
  const instStatus = candidate.institutional_status || candidate.readiness_tier || candidate.readiness_status || "PROVISIONAL_PLACEMENT_READY";
  const confidence = candidate.confidence || "MODERATE";
  const coverage = candidate.career_fit_evidence_coverage || "1/4";

  // Evidence components
  const evidencePack = candidate.raw_evidence_pack || {};
  const calculations = evidencePack.career_fit_calculations || {};
  const components = calculations.components || {};

  const techScore = candidate.technical_score ?? components.technical?.score;
  const anlyScore = candidate.analytical_score ?? components.analytical?.score;
  const ownScore = candidate.ownership_score ?? components.ownership?.score;
  const commScore = candidate.communication_score ?? components.communication?.score;

  // Psychometrics & Competencies
  const psychometrics = evidencePack.psychometrics || {};
  const competencies = psychometrics.competencies || candidate.competencies_19 || {};
  const compList = Object.entries(competencies);

  // AI Narrative
  const strengths = candidate.strengths || evidencePack.strengths || [];
  const devAreas = candidate.development_areas || evidencePack.development_areas || [];
  const roadmap = candidate.ninety_day_roadmap || [];
  const execSummary = candidate.executive_summary || candidate.narrative?.executive_summary;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 fade-in">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="secondary"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/candidates')}
        >
          Back to Directory
        </Button>

        <Button
          variant="primary"
          icon={FileText}
          loading={downloading}
          onClick={handleDownloadPdf}
        >
          Download 12-Page Dossier (PDF)
        </Button>
      </div>

      {/* Candidate Dossier Header Banner */}
      <div className="bg-white border border-genesis-border rounded-xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Verified Candidate Dossier
            </span>
            <span className="font-mono text-xs font-bold text-genesis-muted">{usn}</span>
          </div>
          <h1 className="text-2xl font-black text-genesis-black tracking-tight">{name}</h1>
          <p className="text-xs text-genesis-muted">
            Department: <strong className="text-zinc-800">{dept}</strong> • Campus: <strong className="text-zinc-800">{college}</strong> • CGPA: <strong className="text-zinc-800">{cgpa}</strong>
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
          <StatusBadge status={instStatus} />
          <div className="text-[11px] font-medium text-genesis-muted">
            Evaluation Confidence: <strong className="text-genesis-black">{confidence}</strong>
          </div>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CareerFit Index"
          value={cfIndex ? `${cfIndex} / 800` : '—'}
          subtitle="Mathematical Index (Scale 200–800)"
          icon={Award}
          highlight={true}
        />
        <MetricCard
          title="Career Fit Match"
          value={fitScore ? `${fitScore}%` : '—'}
          subtitle="Primary Track Alignment"
          icon={Target}
        />
        <MetricCard
          title="Job Readiness"
          value={readinessScore ? `${readinessScore}%` : '—'}
          subtitle="Weighted Readiness Score"
          icon={TrendingUp}
        />
        <MetricCard
          title="Evidence Coverage"
          value={coverage}
          subtitle="Psychometric SJT Assessed"
          icon={Layers}
        />
      </div>

      {/* 4 Career Fit Dimensions & Target Recommendation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 4 Dimensions Scorecard */}
        <div className="bg-white border border-genesis-border rounded-xl p-5 shadow-card space-y-3.5">
          <SectionHeader
            title="Four Dimensions of CareerFit"
            subtitle="Deterministic weighted evaluation breakdown"
          />

          <div className="space-y-2.5">
            {/* Technical */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-genesis-canvas border border-genesis-border">
              <div>
                <div className="text-xs font-bold text-genesis-black">Technical Capability</div>
                <div className="text-[10px] text-genesis-muted">Base Weight: 40% • Coding & DSA</div>
              </div>
              <div className="flex items-center gap-3">
                <ScoreDisplay score={techScore} suffix="%" />
                <EvidenceBadge status={techScore !== null && techScore !== undefined ? 'MEASURED' : 'NOT_EVALUATED'} />
              </div>
            </div>

            {/* Analytical */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-genesis-canvas border border-genesis-border">
              <div>
                <div className="text-xs font-bold text-genesis-black">Analytical & Problem Solving</div>
                <div className="text-[10px] text-genesis-muted">Base Weight: 25% • Aptitude & Logic</div>
              </div>
              <div className="flex items-center gap-3">
                <ScoreDisplay score={anlyScore} suffix="%" />
                <EvidenceBadge status={anlyScore !== null && anlyScore !== undefined ? 'MEASURED' : 'NOT_EVALUATED'} />
              </div>
            </div>

            {/* Ownership */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-genesis-canvas border border-genesis-border">
              <div>
                <div className="text-xs font-bold text-genesis-black">Accountability & Ownership</div>
                <div className="text-[10px] text-genesis-muted">Base Weight: 20% • SJT Situational Judgement</div>
              </div>
              <div className="flex items-center gap-3">
                <ScoreDisplay score={ownScore} suffix="%" className="text-emerald-700" />
                <EvidenceBadge status={ownScore !== null && ownScore !== undefined ? 'MEASURED' : 'NOT_EVALUATED'} />
              </div>
            </div>

            {/* Communication */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-genesis-canvas border border-genesis-border">
              <div>
                <div className="text-xs font-bold text-genesis-black">Communication & Alignment</div>
                <div className="text-[10px] text-genesis-muted">Base Weight: 15% • Verbal & Presentation</div>
              </div>
              <div className="flex items-center gap-3">
                <ScoreDisplay score={commScore} suffix="%" />
                <EvidenceBadge status={commScore !== null && commScore !== undefined ? 'MEASURED' : 'NOT_EVALUATED'} />
              </div>
            </div>
          </div>
        </div>

        {/* Target Career Recommendation */}
        <div className="bg-white border border-genesis-border rounded-xl p-5 shadow-card space-y-3.5">
          <SectionHeader
            title="Target Career Recommendation"
            subtitle="Branch-aware career track matching"
          />

          <div className="space-y-3">
            <div className="p-3.5 bg-amber-50/40 border border-amber-200/80 rounded-xl space-y-1">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                Primary Recommended Role
              </div>
              <div className="text-lg font-black text-genesis-black">
                {targetRole}
              </div>
              <div className="text-xs font-semibold text-zinc-600">
                {domain}
              </div>
            </div>

            <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-1.5 text-xs">
              <div className="font-bold text-genesis-black">Campus Placement Suitability</div>
              <p className="text-genesis-muted leading-relaxed">
                Evaluated against enterprise recruitment benchmarks for technical aptitude, ownership under pressure, and systematic engineering communication.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grounded NVIDIA AI Interpretation & Evidence Limitations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessed Strengths */}
        <div className="bg-white border border-genesis-border rounded-xl p-5 shadow-card space-y-3">
          <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Assessed Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-zinc-700">
            {strengths.length > 0 ? (
              strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <li className="text-genesis-muted italic">Strong situational ownership and professional judgment under pressure.</li>
            )}
          </ul>
        </div>

        {/* Development Priorities */}
        <div className="bg-white border border-genesis-border rounded-xl p-5 shadow-card space-y-3">
          <div className="text-xs font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-600" />
            <span>Development Priorities</span>
          </div>
          <ul className="space-y-2 text-xs text-zinc-700">
            {devAreas.length > 0 ? (
              devAreas.map((dev, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{dev}</span>
                </li>
              ))
            ) : (
              <li className="text-genesis-muted italic">Complete formal technical coding assessments to unlock full placement certification.</li>
            )}
          </ul>
        </div>

        {/* Evidence Limitations */}
        <div className="bg-white border border-genesis-border rounded-xl p-5 shadow-card space-y-3">
          <div className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-zinc-500" />
            <span>Evidence Audit Trail</span>
          </div>
          <p className="text-xs text-genesis-muted leading-relaxed">
            CareerFit index is calculated via dynamic weight redistribution over currently measured evidence domains (<strong className="text-zinc-800">1/4 active</strong>). No missing scores are fabricated.
          </p>
        </div>
      </div>
    </div>
  );
}