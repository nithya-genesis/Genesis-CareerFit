import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  Inbox
} from 'lucide-react';
import {
  getAssessmentQuestions,
  submitStudentAssessment,
  getStudentAssessmentStatus
} from '../services/api';
import {
  PageHeader,
  Button,
  LoadingState
} from '../components/ui';
import { formatErrorMessage } from '../utils/errorFormatter';

export default function StudentAssessment() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('genesis_student_assessment_answers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [assessmentStatus, setAssessmentStatus] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAssessmentQuestions();
      const qList = res?.questions || (Array.isArray(res) ? res : []);
      setQuestions(qList);
      setAssessmentStatus(res?.status || (qList.length > 0 ? 'ASSIGNED' : 'NOT_ASSIGNED'));
    } catch (err) {
      console.error("Failed to load questions:", err);
      setError(formatErrorMessage(err, "Failed to load assessment questionnaire."));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionKey) => {
    setAnswers(prev => {
      const updated = {
        ...prev,
        [questionId]: optionKey
      };
      try {
        localStorage.setItem('genesis_student_assessment_answers', JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not persist answers to localStorage:", e);
      }
      return updated;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      setError(`Please answer all questions before submitting (${unanswered.length} remaining).`);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await submitStudentAssessment({ responses: answers });
      try {
        localStorage.removeItem('genesis_student_assessment_answers');
      } catch {}
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      console.error("Submission failed:", err);
      setError(formatErrorMessage(err, "Failed to submit assessment responses."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading CareerFit Assessment..." />;
  }

  // Not Assigned / Empty State
  if (!questions || questions.length === 0) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 fade-in">
        <PageHeader
          category="STUDENT ASSIGNMENT PORTAL"
          title="Career Readiness Assessment"
          subtitle="Real-time situational judgment and technical aptitude evaluations assigned by your institution."
        />

        <div className="bg-white border border-genesis-border rounded-2xl p-10 text-center shadow-card space-y-6">
          <div className="w-16 h-16 bg-amber-50 border border-genesis-gold/40 rounded-2xl flex items-center justify-center mx-auto text-amber-700 shadow-subtle">
            <Inbox className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-genesis-black">
              No assessment has been assigned to you yet.
            </h2>
            <p className="text-xs text-genesis-muted leading-relaxed">
              Your placement officer or department administrator has not scheduled an active assessment campaign for your profile. Once assigned, your assessment modules will appear here automatically.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-genesis-canvas border border-genesis-border rounded-full text-xs font-semibold text-genesis-muted font-mono">
            <span>Assessment status:</span>
            <span className="text-amber-700 uppercase font-bold">Not Assigned</span>
          </div>

          <div className="pt-4">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/student/dashboard')}
            >
              Return to Student Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex] || {};
  const isAnswered = Boolean(answers[currentQ.id]);
  const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);
  const totalAnswered = Object.keys(answers).length;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 fade-in">
      <PageHeader
        category="ASSESSMENT IN PROGRESS"
        title="CareerFit Situational Judgment & Competency Assessment"
        subtitle={`Question ${currentIndex + 1} of ${questions.length} • Real-time deterministic evidence evaluation`}
      />

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{formatErrorMessage(error)}</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-genesis-border shadow-card space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-genesis-black">
            Progress: {currentIndex + 1} of {questions.length} Questions
          </span>
          <span className="font-mono text-genesis-muted font-bold">
            {totalAnswered} of {questions.length} answered ({progressPct}%)
          </span>
        </div>
        <div className="h-2 w-full bg-genesis-border rounded-full overflow-hidden">
          <div
            className="h-full bg-genesis-goldHover transition-all duration-300 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-genesis-border rounded-xl p-6 md:p-8 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-genesis-border/60 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-md text-xs font-black font-mono">
              Q{currentIndex + 1}
            </span>
            <span className="text-xs font-bold text-genesis-muted">
              {currentQ.dimension || currentQ.domain || 'Situational Competency'}
            </span>
          </div>
          {isAnswered && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              Answered
            </span>
          )}
        </div>

        <div className="text-sm md:text-base font-semibold text-genesis-black leading-relaxed">
          {currentQ.scenario || currentQ.question_text || currentQ.text || 'Evaluate the following scenario and select your preferred course of action:'}
        </div>

        {/* Options */}
        <div className="space-y-3">
          {(currentQ.options || []).map((opt) => {
            const isSelected = answers[currentQ.id] === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleSelectOption(currentQ.id, opt.key)}
                className={`w-full text-left p-4 rounded-xl border transition-all text-xs md:text-sm flex items-start gap-3 ${
                  isSelected
                    ? 'border-genesis-goldHover bg-amber-50/40 text-genesis-black shadow-subtle'
                    : 'border-genesis-border bg-white text-zinc-700 hover:border-zinc-300 hover:bg-genesis-canvas/40'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                    isSelected
                      ? 'bg-genesis-goldHover text-white'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {opt.key}
                </span>
                <span className="leading-relaxed flex-1 pt-0.5">
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-genesis-border shadow-card">
        <Button
          variant="outline"
          size="md"
          icon={ArrowLeft}
          disabled={currentIndex === 0}
          onClick={handlePrev}
        >
          Previous
        </Button>

        {currentIndex === questions.length - 1 ? (
          <Button
            variant="primary"
            size="md"
            icon={CheckCircle2}
            loading={submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting & Evaluating...' : 'Submit Assessment'}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            icon={ArrowRight}
            iconPosition="right"
            onClick={handleNext}
          >
            Next Question
          </Button>
        )}
      </div>
    </div>
  );
}
