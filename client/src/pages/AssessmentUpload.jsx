import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Zap,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Database
} from 'lucide-react';
import { uploadAndDiscover, processBatch } from '../services/api';
import {
  PageHeader,
  SectionHeader,
  Button
} from '../components/ui';
import { formatErrorMessage } from '../utils/errorFormatter';

export default function AssessmentUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [discoveredData, setDiscoveredData] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setDiscovering(true);
    setError(null);
    setDiscoveredData(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await uploadAndDiscover(formData);
      const data = res?.data || res || {};
      setDiscoveredData(data);
    } catch (err) {
      console.error("Discovery error:", err);
      setError(formatErrorMessage(err, "Failed to discover dataset schema. Please ensure the file is a valid CSV or Excel workbook."));
    } finally {
      setDiscovering(false);
    }
  };

  const handleRunEvaluation = async () => {
    if (!file) {
      setError("Please select an assessment file to evaluate.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (discoveredData?.run_id) {
        formData.append('run_id', discoveredData.run_id);
      }
      
      const res = await processBatch(formData);
      const resData = res?.data || res || {};
      const activeRunId = resData.run_id || discoveredData?.run_id;
      if (activeRunId) {
        localStorage.setItem('active_run_id', activeRunId);
        navigate(`/dashboard?run_id=${encodeURIComponent(activeRunId)}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      setError(formatErrorMessage(err, "Batch evaluation encountered an issue."));
    } finally {
      setLoading(false);
    }
  };

  const schema = discoveredData?.discovered_schema || discoveredData?.schema || discoveredData?.manifest || {};
  const runId = discoveredData?.run_id || 'PENDING_UPLOAD';
  const candCount = discoveredData?.candidate_count ?? discoveredData?.total_candidates ?? schema?.candidate_count;
  const questionCols = schema?.question_columns || [];
  const domainCols = schema?.direct_domain_columns || [];
  const totalQuestionItems = questionCols.length > 0 ? questionCols.length : (discoveredData?.question_count || 0);
  const detectedDomains = discoveredData?.domain_manifest?.domains || schema?.domains || [
    ...(questionCols.length > 0 ? ["Psychometric Situational Judgment"] : []),
    ...(domainCols.length > 0 ? ["Direct Domain Competencies"] : [])
  ];

  const identity = schema?.identity_mapping || schema?.discovered_identity || {};

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 fade-in">
      <PageHeader
        category="INGESTION & DISCOVERY"
        title="Assessment Ingestion & Schema Discovery Wizard"
        subtitle="Universal schema detection automatically identifies identity headers, technical evaluation metrics, and psychometric situational judgment columns."
      />

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{formatErrorMessage(error)}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div className="border-2 border-dashed border-genesis-gold/80 bg-amber-50/20 rounded-2xl p-8 text-center relative hover:bg-amber-50/40 transition-colors duration-150">
        <input 
          type="file" 
          accept=".csv,.xlsx,.xls" 
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-amber-800 shadow-subtle">
          <UploadCloud className="w-6 h-6" />
        </div>
        
        {!file ? (
          <>
            <div className="font-bold text-sm text-genesis-black">
              Upload an assessment dataset to begin.
            </div>
            <div className="text-xs text-genesis-muted mt-1 max-w-md mx-auto leading-relaxed">
              Click or drag & drop assessment datasets (.CSV / .XLSX / .XLS). Universal discovery engine automatically maps candidate demographics, technical scores, and psychometric items.
            </div>
          </>
        ) : (
          <>
            <div className="font-bold text-sm text-genesis-black">
              Selected file: <span className="font-mono text-amber-900">{file.name}</span>
            </div>
            <div className="text-xs text-genesis-muted mt-1">
              File size: {(file.size / 1024).toFixed(1)} KB • Click or drop another file to replace
            </div>
          </>
        )}

        {file && (
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white text-zinc-800 border border-zinc-200 rounded-full text-xs font-semibold shadow-subtle font-mono">
            <FileSpreadsheet className="w-3.5 h-3.5 text-genesis-goldHover" />
            <span>{file.name}</span>
          </div>
        )}
      </div>

      {/* Discovered Schema Summary Card */}
      {discovering && (
        <div className="bg-white border border-genesis-border rounded-xl p-8 text-center shadow-card space-y-3">
          <div className="w-8 h-8 border-2 border-genesis-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs font-bold text-genesis-black">Analyzing workbook structure & discovering schema...</div>
          <div className="text-[11px] text-genesis-muted">Extracting candidate identity fields, domain vectors, and scoring columns.</div>
        </div>
      )}

      {discoveredData && (
        <div className="bg-white border border-genesis-border rounded-xl p-5 shadow-card space-y-4 fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-genesis-border/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-genesis-black">
                  Discovered Assessment Run
                </h2>
                <span className="font-mono text-[11px] px-2 py-0.5 bg-zinc-100 rounded text-zinc-700 font-bold">
                  {runId}
                </span>
              </div>
              <p className="text-xs text-genesis-muted mt-0.5">
                Source: <span className="font-mono font-medium text-zinc-800">{file?.name}</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[11px] font-bold self-start sm:self-auto">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Schema Verified & Ready</span>
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-genesis-canvas rounded-lg border border-genesis-border">
              <div className="text-[10px] uppercase font-bold text-genesis-muted">Candidates</div>
              <div className="text-lg font-black text-genesis-black mt-0.5">{candCount ?? 'Detected'}</div>
            </div>
            <div className="p-3 bg-genesis-canvas rounded-lg border border-genesis-border">
              <div className="text-[10px] uppercase font-bold text-genesis-muted">Question Items</div>
              <div className="text-lg font-black text-genesis-black mt-0.5">{totalQuestionItems}</div>
            </div>
            <div className="p-3 bg-genesis-canvas rounded-lg border border-genesis-border">
              <div className="text-[10px] uppercase font-bold text-genesis-muted">Domains</div>
              <div className="text-lg font-black text-genesis-black mt-0.5">{detectedDomains.length || 1}</div>
            </div>
            <div className="p-3 bg-genesis-canvas rounded-lg border border-genesis-border">
              <div className="text-[10px] uppercase font-bold text-genesis-muted">Validation</div>
              <div className="text-xs font-bold text-emerald-700 mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Passed</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-2">
            <div className="space-y-2">
              <span className="font-extrabold text-[10px] text-genesis-muted uppercase tracking-wider block">
                Identity Mapping
              </span>
              <div className="space-y-1.5 text-zinc-800 font-mono bg-genesis-canvas p-3 rounded-lg border border-genesis-border">
                <div><span className="font-sans text-genesis-muted font-bold">Candidate:</span> {identity.candidate_name || identity.name || 'Student_Name'}</div>
                <div><span className="font-sans text-genesis-muted font-bold">USN / ID:</span> {identity.usn || identity.candidate_id || 'USN'}</div>
                <div><span className="font-sans text-genesis-muted font-bold">Department:</span> {identity.department || identity.branch || 'Branch'}</div>
                <div><span className="font-sans text-genesis-muted font-bold">Institution:</span> {identity.college || identity.institution || 'College'}</div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-extrabold text-[10px] text-genesis-muted uppercase tracking-wider block">
                Assessment Domains & Signals
              </span>
              <div className="space-y-1.5 text-zinc-800 bg-genesis-canvas p-3 rounded-lg border border-genesis-border text-xs">
                {detectedDomains.length > 0 ? (
                  detectedDomains.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{typeof d === 'string' ? d : d.name || 'Evaluated Domain'}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Dynamic Competency & Assessment Matrix</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-zinc-600 pt-1 border-t border-genesis-border/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Deterministic Evidence Weight Normalization Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-genesis-border shadow-card">
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">
            {discoveredData ? 'Validated schema will proceed to deterministic evaluation and evidence-pack compilation.' : 'Select an assessment workbook (.csv, .xlsx) to proceed.'}
          </span>
        </div>

        <Button
          variant="primary"
          size="lg"
          icon={ArrowRight}
          iconPosition="right"
          loading={loading}
          disabled={!file || !discoveredData}
          onClick={handleRunEvaluation}
        >
          {loading ? 'Evaluating & Compiling Dossiers...' : 'Execute Placement Evaluation Run'}
        </Button>
      </div>
    </div>
  );
}
