import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  ShieldCheck,
  Search,
  RefreshCw,
  AlertCircle,
  Clock,
  User,
  KeyRound,
  FileText,
  Activity,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { getAdminAuditLogs } from '../../services/api';

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminAuditLogs(100);
      setLogs(res.logs || []);
    } catch (err) {
      setError(err.message || 'Failed to load security audit trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const getActionBadge = (action) => {
    if (action.includes('SUCCESS') || action.includes('CREATED') || action.includes('ACTIVATED')) {
      return 'bg-emerald-50 text-emerald-900 border-emerald-200';
    }
    if (action.includes('FAILURE') || action.includes('DEACTIVATED') || action.includes('DENIED')) {
      return 'bg-rose-50 text-rose-900 border-rose-200';
    }
    return 'bg-zinc-100 text-zinc-800 border-zinc-200';
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-[10px] font-bold uppercase tracking-wide mb-1.5">
            <ClipboardList className="w-3 h-3 text-purple-600" />
            Append-Only Security Audit
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-genesis-black tracking-tight">
            Security & Access Audit Trail
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Immutable log of all authentication events, user provisioning, assessment completions, and dossier downloads.
          </p>
        </div>

        <button
          onClick={loadAuditLogs}
          className="self-start md:self-auto inline-flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-all shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-500 space-y-3">
            <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin mx-auto" />
            <p>Loading security audit logs...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-700 space-y-2 bg-rose-50 border border-rose-200 rounded-2xl">
            <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
            <p>{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 space-y-2">
            <ClipboardList className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="font-bold text-zinc-700">No security audit events recorded yet.</p>
            <p>Authentication and operational actions will be recorded here in real time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-extrabold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Timestamp (UTC)</th>
                  <th className="py-3.5 px-4">User / Principal</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Resource Type</th>
                  <th className="py-3.5 px-4">Details / Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                      {log.created_at ? log.created_at.replace('T', ' ').substring(0, 19) : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-zinc-900 font-sans">{log.username || log.user_id || 'System'}</div>
                      <div className="text-[10px] text-zinc-500">{log.role || 'GUEST'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-zinc-700 text-[11px]">
                      {log.resource_type || 'SYSTEM'}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 text-[11px] font-sans truncate max-w-sm">
                      {log.payload ? JSON.stringify(log.payload) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
