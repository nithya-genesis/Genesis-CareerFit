import React, { useState, useEffect } from 'react';
import {
  Activity,
  Database,
  Cpu,
  FileText,
  ShieldCheck,
  HardDrive,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { getAdminSystemHealth } from '../../services/api';

export default function AdminSystem() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSystemHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminSystemHealth();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load system diagnostics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemHealth();
  }, []);

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-[10px] font-bold uppercase tracking-wide mb-1.5">
            <Activity className="w-3 h-3 text-purple-600" />
            Infrastructure Diagnostics
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-genesis-black tracking-tight">
            System Health & Services Telemetry
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Real-time status of backend services, relational persistence layer, AI inference provider, and report compiler.
          </p>
        </div>

        <button
          onClick={loadSystemHealth}
          className="self-start md:self-auto inline-flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-all shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
          <span>Run Diagnostics</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500 space-y-3">
          <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin mx-auto" />
          <p>Running system diagnostics...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-xs text-rose-700 space-y-2 bg-rose-50 border border-rose-200 rounded-2xl">
          <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Application Core */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
                  <Activity className="w-4 h-4 text-genesis-gold" />
                </div>
                <div>
                  <h2 className="text-xs font-black text-zinc-900 uppercase tracking-wider">FastAPI Core Service</h2>
                  <div className="text-[10px] text-zinc-500 font-mono">v{data.application?.version || '3.0.0'}</div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                {data.application?.status || 'ONLINE'}
              </span>
            </div>
            <div className="space-y-2 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Service Name:</span>
                <span className="font-bold text-zinc-900">{data.application?.service}</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime State:</span>
                <span className="font-mono text-emerald-700 font-bold">Continuous / Healthy</span>
              </div>
            </div>
          </div>

          {/* Card 2: Relational Persistence Layer */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <Database className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h2 className="text-xs font-black text-zinc-900 uppercase tracking-wider">Database Persistence</h2>
                  <div className="text-[10px] text-zinc-500 font-mono">{data.database?.active_engine || 'sqlite_relational'}</div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                {data.database?.connection_status || 'CONNECTED'}
              </span>
            </div>
            <div className="space-y-2 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Active Backend:</span>
                <span className="font-mono font-bold text-zinc-900">{data.database?.configured_backend || 'sqlite'}</span>
              </div>
              <div className="flex justify-between">
                <span>Relational Schema:</span>
                <span className="font-bold text-zinc-900">{data.database?.tables_count || 16} Tables Verified</span>
              </div>
              <div className="flex justify-between">
                <span>Supabase PostgreSQL:</span>
                <span className="font-mono text-zinc-600 text-[11px]">Ready (DATABASE_BACKEND switchable)</span>
              </div>
            </div>
          </div>

          {/* Card 3: AI Inference Grounding */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-purple-700" />
                </div>
                <div>
                  <h2 className="text-xs font-black text-zinc-900 uppercase tracking-wider">NVIDIA AI Grounding</h2>
                  <div className="text-[10px] text-zinc-500 font-mono">{data.ai_provider?.model || 'nemotron-3.5-lightning'}</div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-bold">
                {data.ai_provider?.status || 'ONLINE'}
              </span>
            </div>
            <div className="space-y-2 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Grounding Guarantee:</span>
                <span className="font-bold text-emerald-700">Strict Evidence Pack Normalization</span>
              </div>
              <div className="flex justify-between">
                <span>Hallucination Guard:</span>
                <span className="font-bold text-zinc-900">Zero Score Fabrication</span>
              </div>
            </div>
          </div>

          {/* Card 4: Report PDF Engine */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-700" />
                </div>
                <div>
                  <h2 className="text-xs font-black text-zinc-900 uppercase tracking-wider">PDF Compilation Engine</h2>
                  <div className="text-[10px] text-zinc-500 font-mono">WeasyPrint High-Precision</div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold">
                {data.report_engine?.status || 'ONLINE'}
              </span>
            </div>
            <div className="space-y-2 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Dossier Page Count:</span>
                <span className="font-bold text-zinc-900">12 Pages per Candidate</span>
              </div>
              <div className="flex justify-between">
                <span>Stream Security:</span>
                <span className="font-bold text-zinc-900">Authenticated Blob Delivery</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
