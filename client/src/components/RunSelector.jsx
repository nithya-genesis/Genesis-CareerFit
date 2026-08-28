import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layers, ChevronDown, UploadCloud, CheckCircle2, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { getAssessmentRuns, getActiveRunId, setActiveRunId, getAuthUser, isPlacementAdmin } from '../services/api';

export default function RunSelector({ onRunChange, className = '' }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [runs, setRuns] = useState([]);
  const [activeRun, setActiveRun] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const authUser = getAuthUser();
  const canUpload = isPlacementAdmin() || Boolean(authUser && ['PLATFORM_ADMIN', 'ADMIN', 'OPERATIONS'].includes(authUser.role));

  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const rawRuns = await getAssessmentRuns();
      // Canonical guarantee: runs is always a pure Array
      const runList = Array.isArray(rawRuns) ? rawRuns : (rawRuns?.runs || []);
      setRuns(runList);
      
      const urlRun = searchParams.get('run_id');
      const storedRun = getActiveRunId();
      const targetRunId = urlRun || storedRun;

      if (targetRunId && runList.some(r => r && r.id === targetRunId)) {
        setActiveRun(targetRunId);
        setActiveRunId(targetRunId);
        if (urlRun !== targetRunId) {
          const newParams = new URLSearchParams(searchParams);
          newParams.set('run_id', targetRunId);
          setSearchParams(newParams, { replace: true });
        }
        if (onRunChange) onRunChange(targetRunId);
      } else if (runList.length > 0) {
        if (urlRun && !runList.some(r => r && r.id === urlRun)) {
          setActiveRun(null);
          if (onRunChange) onRunChange(null);
        } else {
          const defaultRun = runList[0].id;
          setActiveRun(defaultRun);
          setActiveRunId(defaultRun);
          const newParams = new URLSearchParams(searchParams);
          newParams.set('run_id', defaultRun);
          setSearchParams(newParams, { replace: true });
          if (onRunChange) onRunChange(defaultRun);
        }
      } else {
        setActiveRun(null);
        setActiveRunId(null);
        if (onRunChange) onRunChange(null);
      }
    } catch (err) {
      console.warn('Failed to fetch assessment runs in RunSelector:', err);
      setRuns([]);
      setActiveRun(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRun = (runId) => {
    setActiveRun(runId);
    setActiveRunId(runId);
    setIsOpen(false);
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('run_id', runId);
    setSearchParams(newParams);
    
    if (onRunChange) {
      onRunChange(runId);
    }
  };

  const currentRunObj = Array.isArray(runs) ? runs.find(r => r && r.id === activeRun) : null;

  return (
    <div className={'relative inline-block text-left ' + className}>
      <div className='flex items-center gap-2 bg-white border border-genesis-border rounded-xl p-1.5 shadow-subtle'>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition border ' + (currentRunObj ? 'bg-genesis-canvas hover:bg-zinc-100/80 border-genesis-border/60' : 'bg-amber-50/50 hover:bg-amber-100/50 border-amber-300')}
        >
          <Layers className='w-3.5 h-3.5 text-genesis-goldHover shrink-0' />
          <div className='text-left font-mono'>
            <div className='text-[10px] uppercase font-bold text-genesis-muted leading-tight'>
              Active Assessment Run
            </div>
            <div className='text-xs font-bold text-genesis-black flex items-center gap-1.5'>
              {currentRunObj ? (
                <>
                  <span className='truncate max-w-[140px]'>{currentRunObj.name || currentRunObj.filename || currentRunObj.id}</span>
                  <span className='text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded font-sans font-semibold'>
                    {currentRunObj.total_records || currentRunObj.valid_records || currentRunObj.candidate_count || 0} cands
                  </span>
                </>
              ) : (
                <span className='text-amber-800 font-sans font-bold flex items-center gap-1'>
                  <AlertCircle className='w-3 h-3 text-amber-600' />
                  <span>No Run Selected</span>
                </span>
              )}
            </div>
          </div>
          <ChevronDown className='w-3.5 h-3.5 text-genesis-muted ml-1' />
        </button>

        {canUpload && (
          <button
            onClick={() => navigate('/assessment/upload')}
            className='px-2.5 py-1.5 bg-genesis-black hover:bg-zinc-800 text-genesis-gold rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs'
            title='Upload New Assessment Dataset'
          >
            <UploadCloud className='w-3.5 h-3.5' />
            <span className='hidden sm:inline'>New Upload</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className='origin-top-right absolute right-0 mt-2 w-80 rounded-xl shadow-card bg-white border border-genesis-border ring-1 ring-black ring-opacity-5 z-50 p-2 space-y-1 fade-in'>
          <div className='px-2 py-1.5 border-b border-genesis-border/60 text-[10px] font-bold text-genesis-muted uppercase tracking-wider flex items-center justify-between'>
            <span>Select Assessment Dataset</span>
            <span className='font-mono text-zinc-500'>{(Array.isArray(runs) ? runs.length : 0)} Runs Available</span>
          </div>

          <div className='max-h-60 overflow-y-auto space-y-1 pt-1'>
            {(!Array.isArray(runs) || runs.length === 0) ? (
              <div className='p-4 text-center text-xs text-genesis-muted'>
                No uploaded assessment runs yet.
              </div>
            ) : (
              runs.map((r, idx) => {
                if (!r || !r.id) return null;
                const isSelected = r.id === activeRun;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRun(r.id)}
                    className={'w-full text-left p-2.5 rounded-lg text-xs transition flex items-start justify-between gap-2 ' + (isSelected ? 'bg-amber-50/80 border border-genesis-gold/50 text-genesis-black' : 'hover:bg-zinc-50 text-zinc-700')}
                  >
                    <div className='space-y-0.5 min-w-0'>
                      <div className='font-sans font-bold flex items-center gap-1.5'>
                        <span className='px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-mono uppercase'>
                          {r.batch_label || r.batch_number || `Batch ${String(runs.length - idx).padStart(3, '0')}`}
                        </span>
                        <span className='truncate text-xs'>{r.dataset_name || r.name || r.filename || r.id}</span>
                      </div>
                      <div className='text-[10px] text-genesis-muted font-mono flex items-center gap-2'>
                        <span>{r.id}</span>
                        <span>•</span>
                        <span>{r.total_records || r.valid_records || r.candidate_count || 0} candidates</span>
                        {r.published_at && (
                          <>
                            <span>•</span>
                            <span>{new Date(r.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className='w-4 h-4 text-amber-600 shrink-0 mt-0.5' />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {canUpload && (
            <div className='pt-2 border-t border-genesis-border/60'>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/assessment/upload');
                }}
                className='w-full py-1.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5'
              >
                <UploadCloud className='w-3.5 h-3.5 text-zinc-600' />
                <span>Upload New Dataset (Creates New Run)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
