import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  BarChart3,
  Users,
  CheckCircle2,
  FileText,
  Compass,
  Zap,
  Target,
  Sparkles,
  Lock,
  Building,
  Building2,
  GraduationCap,
  TrendingUp,
  Cpu,
  ChevronRight,
  Database,
  ExternalLink,
  Mail,
  Check,
  Eye,
  Crosshair,
  BookOpen
} from 'lucide-react';
import Button from '../components/ui/Button';

export default function Landing() {
  const navigate = useNavigate();
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessSubmitted, setAccessSubmitted] = useState(false);
  const [instEmail, setInstEmail] = useState('');

  const handleAccessRequest = (e) => {
    e.preventDefault();
    if (!instEmail.trim()) return;
    setAccessSubmitted(true);
    setTimeout(() => {
      setShowAccessModal(false);
      setAccessSubmitted(false);
      setInstEmail('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-genesis-black font-sans selection:bg-genesis-gold selection:text-genesis-black">
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-genesis-border/80 px-6 lg:px-12 h-16 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-zinc-200/80 p-0.5 shrink-0 flex items-center justify-center shadow-subtle">
            <img
              src="/logo.jpg"
              alt="Genesis CareerFit Brand"
              className="w-full h-full object-contain rounded"
            />
          </div>
          <div>
            <div className="font-black text-sm tracking-tight text-genesis-black uppercase">
              Genesis CareerFit
            </div>
            <div className="text-[9px] font-bold text-amber-700 tracking-widest uppercase">
              Placement Intelligence
            </div>
          </div>
        </div>

        {/* Desktop Menu Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-zinc-600">
          <a href="#why-it-matters" className="hover:text-genesis-black transition">Why It Matters</a>
          <a href="#how-it-works" className="hover:text-genesis-black transition">How It Works</a>
          <a href="#what-it-reveals" className="hover:text-genesis-black transition">What It Reveals</a>
          <a href="#for-students" className="hover:text-genesis-black transition">For Students</a>
          <a href="#for-institutions" className="hover:text-genesis-black transition">For Institutions</a>
          <a href="#evidence-trust" className="hover:text-genesis-black transition">Evidence & Trust</a>
        </nav>

        {/* Auth CTAs */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/login?role=student')}
            className="text-xs font-bold text-zinc-600 hover:text-genesis-black transition px-2.5 py-1.5"
          >
            Student Sign In
          </button>
          <Button
            variant="primary"
            size="sm"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/login?role=institution')}
          >
            Sign In →
          </Button>
        </div>
      </header>

      {/* 2. SECTION 1 (WHITE): Editorial Hero */}
      <section className="relative px-6 lg:px-12 pt-16 pb-20 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Black Typography with Selective Gold */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white border border-genesis-border rounded-full text-[11px] font-extrabold uppercase tracking-wider text-zinc-800 shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-genesis-gold" />
              <span>Evidence-Backed Institutional Placement Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-genesis-black leading-[1.12]">
              Know Your Potential.<br />
              Find Your <span className="underline decoration-genesis-gold decoration-4 underline-offset-4">Direction</span>.<br />
              Build Your Career With <span className="underline decoration-genesis-gold decoration-4 underline-offset-4">Evidence</span>.
            </h1>

            <p className="text-sm sm:text-base text-genesis-muted leading-relaxed max-w-xl font-medium">
              Genesis CareerFit transforms multi-dimensional student assessment data into evidence-grounded career intelligence — giving students personalized clarity and institutions decision-ready placement insight.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/login?role=student')}
                className="text-xs font-black"
              >
                Explore CareerFit →
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/login?role=institution')}
                className="text-xs font-bold"
              >
                For Institutions →
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-6 border-t border-genesis-border/80 flex flex-wrap gap-4 text-xs font-semibold text-zinc-600">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Deterministic Grounding</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Role-Based Security</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Score Fabrication</span>
              </div>
            </div>
          </div>

          {/* Right Column: Anonymized Career Intelligence Preview */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-genesis-border rounded-2xl shadow-elevated p-6 space-y-4 relative">
              <div className="flex justify-between items-center pb-3 border-b border-genesis-border/60">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-widest">
                    CAREER INTELLIGENCE PREVIEW
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold rounded font-mono">
                  VERIFIED
                </span>
              </div>

              {/* Anonymized Candidate Dossier Pill */}
              <div className="p-4 bg-genesis-canvas border border-genesis-border rounded-xl space-y-2">
                <div className="text-[10px] font-mono uppercase text-genesis-muted">
                  Candidate Profile • CSE Department
                </div>
                <div className="text-base font-black text-genesis-black">
                  Career Direction: <span className="text-amber-800">Software Development</span>
                </div>
                <div className="text-xs text-genesis-muted">
                  Institutional Alignment: <strong className="text-zinc-800 font-bold">Tier-1 Placement Ready</strong>
                </div>
                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="font-mono text-amber-800 font-bold">CareerFit Index: 733 / 800</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-mono font-bold text-[10px]">
                    Evidence: Measured
                  </span>
                </div>
              </div>

              {/* Dimension Metrics */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <span className="font-bold text-zinc-700">Accountability & Ownership (SJT)</span>
                  <span className="font-mono font-bold text-emerald-700">88.9% (Measured)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <span className="font-bold text-zinc-700">Technical Coding Diagnostics</span>
                  <span className="font-mono text-[10px] text-zinc-500 font-bold">NOT EVALUATED</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <span className="font-bold text-zinc-700">Analytical & Systems Logic</span>
                  <span className="font-mono text-[10px] text-zinc-500 font-bold">NOT EVALUATED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION 2 (BLACK): WHY IT MATTERS */}
      <section id="why-it-matters" className="px-6 lg:px-12 py-20 bg-genesis-black text-white border-y border-zinc-900">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-genesis-gold font-mono">
              The Strategic Challenge
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              A Degree Tells You What You Studied.<br />
              It Doesn't Always Tell You Where You Belong.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl mx-auto font-medium">
              Academic transcripts and single-score tests fail to capture the multi-dimensional qualities that predict real career success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Student's Challenge */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-genesis-gold font-mono text-xs font-black uppercase">
                <GraduationCap className="w-4 h-4" />
                <span>The Student Challenge</span>
              </div>
              <h3 className="text-lg font-bold text-white">Uncertainty in an Overwhelming Job Market</h3>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-genesis-gold font-bold">•</span>
                  <span><strong>Uncertainty about career direction:</strong> Unclear how academic specialization connects to specific industry job roles.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-genesis-gold font-bold">•</span>
                  <span><strong>Fragmented assessment results:</strong> Scores from disparate coding and aptitude tests without unified guidance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-genesis-gold font-bold">•</span>
                  <span><strong>Unclear development priorities:</strong> Not knowing which specific skills to build in the next 90 days before recruitment drives.</span>
                </li>
              </ul>
            </div>

            {/* The Institution's Challenge */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-genesis-gold font-mono text-xs font-black uppercase">
                <Building2 className="w-4 h-4" />
                <span>The Institution Challenge</span>
              </div>
              <h3 className="text-lg font-bold text-white">Placement Operations at Enterprise Scale</h3>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-genesis-gold font-bold">•</span>
                  <span><strong>Limited visibility across large cohorts:</strong> Managing hundreds of students with isolated spreadsheets.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-genesis-gold font-bold">•</span>
                  <span><strong>Difficulty identifying genuine readiness:</strong> Relying on CGPA alone misses situational and behavioral competence.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-genesis-gold font-bold">•</span>
                  <span><strong>Difficulty targeting training:</strong> Generic workshops fail when different students have completely different skill gaps.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION 3 (WHITE): HOW IT WORKS (01-05 Flow) */}
      <section id="how-it-works" className="px-6 lg:px-12 py-20 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700 font-mono">
            Structured Diagnostic Pipeline
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-genesis-black tracking-tight">
            How Genesis CareerFit Works
          </h2>
          <p className="text-xs sm:text-sm text-genesis-muted leading-relaxed">
            Five precision stages transforming raw evaluation signals into decisive placement intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-white border border-genesis-border shadow-card space-y-3">
            <div className="font-mono text-xs font-black text-amber-700 uppercase">01 • DISCOVER</div>
            <div className="w-8 h-8 rounded-lg bg-amber-100/80 text-amber-900 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-genesis-black">Ingest & Map</h3>
            <p className="text-genesis-muted leading-relaxed text-[11px]">
              Ingest multi-source student records with automated universal schema detection.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-genesis-border shadow-card space-y-3">
            <div className="font-mono text-xs font-black text-amber-700 uppercase">02 • UNDERSTAND</div>
            <div className="w-8 h-8 rounded-lg bg-amber-100/80 text-amber-900 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-genesis-black">Assess Evidence</h3>
            <p className="text-genesis-muted leading-relaxed text-[11px]">
              Construct verifiable CandidateEvidencePack across 4 core dimensions with zero fabrication.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-genesis-border shadow-card space-y-3">
            <div className="font-mono text-xs font-black text-amber-700 uppercase">03 • MATCH</div>
            <div className="w-8 h-8 rounded-lg bg-amber-100/80 text-amber-900 flex items-center justify-center">
              <Crosshair className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-genesis-black">Align Roles</h3>
            <p className="text-genesis-muted leading-relaxed text-[11px]">
              Match demonstrated competencies to calibrated target career tracks and role profiles.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-genesis-border shadow-card space-y-3">
            <div className="font-mono text-xs font-black text-amber-700 uppercase">04 • PREPARE</div>
            <div className="w-8 h-8 rounded-lg bg-amber-100/80 text-amber-900 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-genesis-black">90-Day Action</h3>
            <p className="text-genesis-muted leading-relaxed text-[11px]">
              Generate targeted upskilling roadmaps addressing specific verified gap areas.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-genesis-border shadow-card space-y-3">
            <div className="font-mono text-xs font-black text-amber-700 uppercase">05 • ACT</div>
            <div className="w-8 h-8 rounded-lg bg-amber-100/80 text-amber-900 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-genesis-black">Drive Placement</h3>
            <p className="text-genesis-muted leading-relaxed text-[11px]">
              Deliver certified talent dossiers to students and recruiter-ready shortlists to TPOs.
            </p>
          </div>
        </div>
      </section>

      {/* 5. SECTION 4 (BLACK): WHAT CAREERFIT REVEALS */}
      <section id="what-it-reveals" className="px-6 lg:px-12 py-20 bg-genesis-black text-white border-y border-zinc-900">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-genesis-gold font-mono">
              Actionable Intelligence Framework
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              What Genesis CareerFit Reveals
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
              Every assessment yields multi-dimensional clarity designed for direct action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5">
              <div className="text-genesis-gold font-mono font-bold text-xs">01 • DEMONSTRATED STRENGTHS</div>
              <h3 className="text-base font-bold text-white">Verified Capabilities</h3>
              <p className="text-zinc-300 leading-relaxed">
                Clear identification of evaluated technical, behavioral, and analytical competencies with measured proof.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5">
              <div className="text-genesis-gold font-mono font-bold text-xs">02 • EVIDENCE COVERAGE</div>
              <h3 className="text-base font-bold text-white">Transparent Ratio</h3>
              <p className="text-zinc-300 leading-relaxed">
                Explicit tracking of evaluated vs unassessed dimensions (e.g. 1/4 coverage) with zero synthetic scores.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5">
              <div className="text-genesis-gold font-mono font-bold text-xs">03 • CAREER DIRECTION</div>
              <h3 className="text-base font-bold text-white">Calibrated Job Alignment</h3>
              <p className="text-zinc-300 leading-relaxed">
                Recommended career pathways (Software Engineer, Data Analyst, Cloud Practitioner) matched to verified traits.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5">
              <div className="text-genesis-gold font-mono font-bold text-xs">04 • DEVELOPMENT AREAS</div>
              <h3 className="text-base font-bold text-white">Targeted Skill Gaps</h3>
              <p className="text-zinc-300 leading-relaxed">
                Unambiguous gap identification showing exactly what needs work to reach candidate placement readiness.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5">
              <div className="text-genesis-gold font-mono font-bold text-xs">05 • PLACEMENT READINESS</div>
              <h3 className="text-base font-bold text-white">Tier Classification</h3>
              <p className="text-zinc-300 leading-relaxed">
                Placement tier mapping (Tier-1 Ready, Provisional Ready, Remediation) based on evidence integrity.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5">
              <div className="text-genesis-gold font-mono font-bold text-xs">06 • COHORT INTELLIGENCE</div>
              <h3 className="text-base font-bold text-white">Institutional Aggregation</h3>
              <p className="text-zinc-300 leading-relaxed">
                Department-level conversion rates, branch strengths, and recruiter candidate shortlisting matrix.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION 5 (WHITE): FOR STUDENTS */}
      <section id="for-students" className="px-6 lg:px-12 py-20 bg-white border-b border-genesis-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700 font-mono">
              Student Career Experience
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-genesis-black tracking-tight">
              Your Career Starts With Clarity.
            </h2>
            <p className="text-sm text-genesis-muted leading-relaxed font-medium">
              Discover your strengths, understand where you can grow, explore career directions aligned with your demonstrated abilities, and build a clearer path toward the opportunities you want.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-3 p-3 bg-genesis-canvas border border-genesis-border rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-genesis-black block">Know Yourself</strong>
                  <span className="text-genesis-muted">Understand your workplace tendencies, ownership, and problem-solving styles.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-genesis-canvas border border-genesis-border rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-genesis-black block">Know Your Direction</strong>
                  <span className="text-genesis-muted">See real engineering and technical roles mapped to your demonstrated capability.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-genesis-canvas border border-genesis-border rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-genesis-black block">Know Your Gaps & Next Steps</strong>
                  <span className="text-genesis-muted">Follow concrete 90-day development milestones to prepare for drive interviews.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button
                variant="primary"
                size="md"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/login?role=student')}
              >
                Start Your CareerFit Journey →
              </Button>
              <button
                type="button"
                onClick={() => navigate('/login?role=student')}
                className="text-xs font-bold text-zinc-600 hover:text-genesis-black transition"
              >
                Student Sign In
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 p-6 bg-genesis-canvas border border-genesis-border rounded-2xl shadow-card space-y-4">
            <div className="text-xs font-black uppercase text-genesis-black tracking-wider border-b border-genesis-border pb-2 flex justify-between items-center">
              <span>Personalized Talent Dossier</span>
              <span className="text-[10px] font-mono text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded font-bold">
                CONFIDENTIAL
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3.5 bg-white rounded-xl border border-genesis-border">
                <div className="text-[10px] text-genesis-muted font-mono uppercase">Primary Role Match</div>
                <div className="text-sm font-bold text-zinc-900 mt-0.5">
                  Software Development Engineer • High Directional Affinity
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Strong ownership & collaborative initiative verified in situational diagnostics.
                </div>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-genesis-border">
                <div className="text-[10px] text-genesis-muted font-mono uppercase">Placement Readiness Tier</div>
                <div className="text-sm font-bold text-emerald-700 mt-0.5">
                  Tier-1 Direct Qualified
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Ready for campus placement rounds and primary technical evaluations.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION 6 (BLACK): FOR INSTITUTIONS */}
      <section id="for-institutions" className="px-6 lg:px-12 py-20 bg-genesis-black text-white border-b border-zinc-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-genesis-gold font-mono">
              Institutional Intelligence
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Turn Student Potential Into Placement Intelligence.
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
              Give placement teams a clearer view of student readiness, capability gaps, career alignment, and cohort-level talent so training and placement decisions can be made with stronger evidence.
            </p>

            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex items-start gap-2.5 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-genesis-gold shrink-0 mt-0.5" />
                <span><strong>Understand cohorts:</strong> Real-time visibility across departments and batches.</span>
              </div>
              <div className="flex items-start gap-2.5 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-genesis-gold shrink-0 mt-0.5" />
                <span><strong>Identify placement readiness:</strong> Filter candidates by objective, multi-signal capability.</span>
              </div>
              <div className="flex items-start gap-2.5 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-genesis-gold shrink-0 mt-0.5" />
                <span><strong>Find development gaps:</strong> Direct remedial training budgets exactly where they matter.</span>
              </div>
              <div className="flex items-start gap-2.5 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-genesis-gold shrink-0 mt-0.5" />
                <span><strong>Strengthen placement outcomes:</strong> Present qualified talent pools to visiting corporate recruiters.</span>
              </div>
            </div>

            <div className="pt-3 flex items-center gap-3">
              <Button
                variant="primary"
                size="md"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/login?role=institution')}
              >
                Explore Institutional Career Intelligence →
              </Button>
              <button
                type="button"
                onClick={() => navigate('/login?role=institution')}
                className="text-xs font-bold text-zinc-400 hover:text-white transition"
              >
                Placement Officer Sign In
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
            <div className="text-xs font-mono font-bold text-genesis-gold uppercase border-b border-zinc-800 pb-2 flex justify-between items-center">
              <span>TPO Command Center Overview</span>
              <span className="text-emerald-400 text-[10px]">LIVE COHORT</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                <div className="text-zinc-500 font-mono text-[10px]">TIER-1 QUALIFIED</div>
                <div className="text-lg font-black text-emerald-400">30%</div>
                <div className="text-[10px] text-zinc-400">Direct Recruiter Track</div>
              </div>
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                <div className="text-zinc-500 font-mono text-[10px]">PROVISIONAL READY</div>
                <div className="text-lg font-black text-amber-400">40%</div>
                <div className="text-[10px] text-zinc-400">Developing Readiness</div>
              </div>
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                <div className="text-zinc-500 font-mono text-[10px]">REMEDIATION TRACK</div>
                <div className="text-lg font-black text-blue-400">30%</div>
                <div className="text-[10px] text-zinc-400">Targeted Skill Blitz</div>
              </div>
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                <div className="text-zinc-500 font-mono text-[10px]">BATCH INTEGRITY</div>
                <div className="text-lg font-black text-white">100%</div>
                <div className="text-[10px] text-zinc-400">Verified Evidence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECTION 7 (WHITE): PLACEMENT INTELLIGENCE 4-QUADRANT MODEL */}
      <section className="px-6 lg:px-12 py-20 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700 font-mono">
            Candidate Segmentation Matrix
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-genesis-black tracking-tight">
            Not Every Student Requires the Same Intervention.
          </h2>
          <p className="text-xs sm:text-sm text-genesis-muted leading-relaxed">
            The Genesis CareerFit 4-Quadrant Placement Matrix categorizes candidates by directional affinity and operational readiness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-card space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-black uppercase text-emerald-800 text-xs font-mono">
                Q1: Placement Ready
              </span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded text-[10px] border border-emerald-200">
                High Fit • High Readiness
              </span>
            </div>
            <p className="text-zinc-700 leading-relaxed font-medium">
              Candidates demonstrating strong alignment and high job readiness. Recommended for primary campus recruitment drives and product engineering roles.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-amber-200 shadow-card space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-black uppercase text-amber-800 text-xs font-mono">
                Q2: Develop & Align
              </span>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded text-[10px] border border-amber-200">
                High Fit • Developing Readiness
              </span>
            </div>
            <p className="text-zinc-700 leading-relaxed font-medium">
              Candidates with strong directional alignment requiring focused project sprint drills and technical mock rounds before drive scheduling.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-blue-200 shadow-card space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-black uppercase text-blue-800 text-xs font-mono">
                Q3: Explore Alternatives
              </span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-800 font-bold rounded text-[10px] border border-blue-200">
                Cross-Domain Potential
              </span>
            </div>
            <p className="text-zinc-700 leading-relaxed font-medium">
              Solid operational aptitude aligning effectively with adjacent technical consulting, business analyst, or systems tracks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-card space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-black uppercase text-zinc-800 text-xs font-mono">
                Q4: Guidance & Upskilling
              </span>
              <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 font-bold rounded text-[10px] border border-zinc-300">
                Remediation Track
              </span>
            </div>
            <p className="text-zinc-700 leading-relaxed font-medium">
              Candidates requiring foundational technical remediation and structured problem-solving training before placement allocation.
            </p>
          </div>
        </div>
      </section>

      {/* 9. SECTION 8 (BLACK): WHY THE CAREERFIT RESULT MATTERS */}
      <section className="px-6 lg:px-12 py-20 bg-genesis-black text-white border-y border-zinc-900">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-genesis-gold font-mono">
              Decision Support System
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              More Than a Report. A Career Decision Tool.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
              Designed not as a static document, but as an active career roadmap for students and a strategic talent instrument for institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="text-genesis-gold font-mono font-bold text-xs uppercase">For Students</div>
              <ul className="space-y-2 text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-genesis-gold shrink-0" />
                  <span>Understand your strongest demonstrated capabilities</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-genesis-gold shrink-0" />
                  <span>Explore aligned career directions backed by evidence</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-genesis-gold shrink-0" />
                  <span>Identify specific, high-priority development milestones</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-genesis-gold shrink-0" />
                  <span>Build a clearer, more confident career path</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="text-genesis-gold font-mono font-bold text-xs uppercase">For Institutions</div>
              <ul className="space-y-2 text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-genesis-gold shrink-0" />
                  <span>Understand aggregate cohort strengths and talent depth</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-genesis-gold shrink-0" />
                  <span>Identify candidate readiness across branches objectively</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-genesis-gold shrink-0" />
                  <span>Target institutional training budgets effectively</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-genesis-gold shrink-0" />
                  <span>Improve placement conversion and corporate satisfaction</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 10. SECTION 9 (WHITE): EVIDENCE & TRUST */}
      <section id="evidence-trust" className="px-6 lg:px-12 py-20 bg-white border-b border-genesis-border">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700 font-mono">
              Integrity Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-genesis-black tracking-tight">
              Built on Uncompromising Evidence & Trust
            </h2>
            <p className="text-xs sm:text-sm text-genesis-muted leading-relaxed font-medium">
              Institutions depend on authoritative truth. Genesis CareerFit operates on five core principles of data integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-genesis-canvas border border-genesis-border space-y-2">
              <div className="font-bold text-zinc-900">Evidence Grounding</div>
              <p className="text-genesis-muted text-[11px]">
                Every score and narrative point is traceable to recorded assessment items.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-genesis-canvas border border-genesis-border space-y-2">
              <div className="font-bold text-zinc-900">Zero Score Fabrication</div>
              <p className="text-genesis-muted text-[11px]">
                Missing data remains strictly NOT EVALUATED — never filled with fake defaults.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-genesis-canvas border border-genesis-border space-y-2">
              <div className="font-bold text-zinc-900">Role-Based Security</div>
              <p className="text-genesis-muted text-[11px]">
                Strict segregation between student candidate and institutional officer portals.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-genesis-canvas border border-genesis-border space-y-2">
              <div className="font-bold text-zinc-900">Institutional Isolation</div>
              <p className="text-genesis-muted text-[11px]">
                Multi-tenant isolation ensuring candidate and cohort data cannot cross boundaries.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-genesis-canvas border border-genesis-border space-y-2">
              <div className="font-bold text-zinc-900">Transparent Coverage</div>
              <p className="text-genesis-muted text-[11px]">
                Explicit ratio reporting so stakeholders know exactly what was measured.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. SECTION 10 (BLACK): FINAL CTA */}
      <section className="px-6 lg:px-12 py-24 bg-genesis-black text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-mono text-genesis-gold uppercase">
            <span>The Placement Intelligence Standard</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            Your Students Have Potential.<br />
            Let's Turn It Into Direction.
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed font-medium">
            Give students a clearer picture of where they can go — and institutions a clearer path to help them get there.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/login?role=student')}
              className="text-xs font-black"
            >
              Start Your CareerFit Journey →
            </Button>
            <button
              type="button"
              onClick={() => navigate('/login?role=institution')}
              className="px-5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition"
            >
              Talk to Your Institution
            </button>
          </div>
        </div>
      </section>

      {/* 12. Global Footer */}
      <footer className="bg-white border-t border-genesis-border px-6 lg:px-12 py-8 text-xs text-genesis-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded overflow-hidden bg-white border border-zinc-200 p-0.5 shrink-0 flex items-center justify-center">
              <img
                src="/logo.jpg"
                alt="Genesis CareerFit Brand"
                className="w-full h-full object-contain rounded"
              />
            </div>
            <span className="font-extrabold text-genesis-black uppercase">Genesis CareerFit</span>
            <span>• Enterprise Placement Intelligence Platform</span>
          </div>

          <div className="text-[11px] text-zinc-400">
            Strict RBAC & Student Isolation Active • Multi-Tenant Relational Architecture
          </div>
        </div>
      </footer>
    </div>
  );
}
