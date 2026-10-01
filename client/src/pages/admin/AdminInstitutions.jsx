import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Layers,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Hash
} from 'lucide-react';
import { getAdminInstitutions } from '../../services/api';

export default function AdminInstitutions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInstitutions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminInstitutions();
      setData(res.institutions || []);
    } catch (err) {
      setError(err.message || 'Failed to load institutional profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-[10px] font-bold uppercase tracking-wide mb-1.5">
            <Building2 className="w-3 h-3 text-purple-600" />
            Institutional Architecture
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-genesis-black tracking-tight">
            Institution & Department Configuration
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Tenant configuration, department divisions, active student cohorts, and authorized placement departments.
          </p>
        </div>

        <button
          onClick={loadInstitutions}
          className="self-start md:self-auto inline-flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-all shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500 space-y-3">
          <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin mx-auto" />
          <p>Loading institution metadata...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-xs text-rose-700 space-y-2 bg-rose-50 border border-rose-200 rounded-2xl">
          <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((inst) => (
            <div key={inst.id} className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-genesis-black text-white flex items-center justify-center font-black text-lg">
                    {inst.code?.substring(0, 3) || 'INS'}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-zinc-900">{inst.name}</h2>
                    <div className="text-xs text-zinc-500 font-mono flex items-center gap-2 mt-0.5">
                      <span>Code: {inst.code}</span>
                      <span>•</span>
                      <span>Slug: {inst.slug}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {inst.status}
                  </span>
                </div>
              </div>

              {/* Institution Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Student Population</div>
                  <div className="text-xl font-black text-zinc-900 mt-1">{inst.total_students}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Active candidates enrolled</div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Assessment Programs</div>
                  <div className="text-xl font-black text-zinc-900 mt-1">{inst.active_campaigns}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Assigned campaigns</div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Placement Officers</div>
                  <div className="text-xl font-black text-zinc-900 mt-1">{inst.active_officers}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Authorized TPO coordinators</div>
                </div>
              </div>

              {/* Departments Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-700">
                  Authorized Engineering & Technology Departments
                </h3>
                <div className="flex flex-wrap gap-2">
                  {inst.departments?.map((d) => (
                    <span
                      key={d}
                      className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-800 shadow-2xs"
                    >
                      {d} Department
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
