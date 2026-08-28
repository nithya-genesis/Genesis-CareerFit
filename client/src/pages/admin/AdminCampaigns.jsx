import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  RefreshCw,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { getAdminCampaigns } from '../../services/api';

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminCampaigns();
      setCampaigns(res.campaigns || []);
    } catch (err) {
      setError(err.message || 'Failed to load campaigns.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-[10px] font-bold uppercase tracking-wide mb-1.5">
            <Layers className="w-3 h-3 text-purple-600" />
            Operations Oversight
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-genesis-black tracking-tight">
            Assessment Campaigns Oversight
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Supervise institutional assessment campaigns, completion percentages, batch timelines, and participation rates.
          </p>
        </div>

        <button
          onClick={loadCampaigns}
          className="self-start md:self-auto inline-flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-all shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
          <span>Refresh Campaigns</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500 space-y-3">
          <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin mx-auto" />
          <p>Loading assessment campaigns...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-xs text-rose-700 space-y-2 bg-rose-50 border border-rose-200 rounded-2xl">
          <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
          <p>{error}</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center text-xs text-zinc-500 space-y-2">
          <Layers className="w-8 h-8 text-zinc-400 mx-auto" />
          <p className="font-bold text-zinc-700">No active campaigns found.</p>
          <p>Campaigns created by placement officers will appear here for administrative oversight.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((c) => {
            const completed = c.count_analysis_ready || c.count_completed || 0;
            const total = c.total_invited || c.total_attempts || 10;
            const pct = Math.min(100, Math.round((completed / Math.max(total, 1)) * 100));

            return (
              <div key={c.id} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase mb-1.5">
                      {c.department} · Batch {c.batch_year}
                    </span>
                    <h2 className="text-base font-black text-zinc-900">{c.name}</h2>
                    <div className="text-[11px] text-zinc-500 font-mono mt-0.5">Type: {c.assessment_type || 'COMPOSITE_SJT'}</div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-full">
                    {c.status || 'OPEN'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 border-t border-zinc-100 pt-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-zinc-600">Completion Progress</span>
                    <span className="text-zinc-900">{completed} / {total} Analyzed ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-genesis-gold transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 border-t border-zinc-100 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Created: {c.created_at ? c.created_at.split('T')[0] : '2026-08-25'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>In-Progress: {c.count_in_progress || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
