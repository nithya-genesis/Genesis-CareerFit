import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  GraduationCap,
  FileText,
  Layers,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Database,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { getAdminColleges, createCollege } from '../../services/api';
import { formatErrorMessage } from '../../utils/errorFormatter';

export default function CollegeManagement() {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [branches, setBranches] = useState('CSE, ISE, AIML, ECE, EEE, MECH');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const loadColleges = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminColleges();
      setColleges(res.colleges || []);
    } catch (err) {
      setError(formatErrorMessage(err, 'Failed to load colleges catalog.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColleges();
  }, []);

  const handleCreateCollege = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setCreateError('College Name and Code are required.');
      return;
    }
    setCreating(true);
    setCreateError('');
    try {
      const branchList = branches.split(',').map((b) => b.trim().toUpperCase()).filter(Boolean);
      await createCollege({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        slug: slug.trim() || code.trim().toLowerCase(),
        contact_email: email.trim() || null,
        contact_phone: phone.trim() || null,
        academic_year: academicYear,
        branches: branchList
      });
      setShowCreateModal(false);
      setName('');
      setCode('');
      setSlug('');
      setEmail('');
      setPhone('');
      await loadColleges();
    } catch (err) {
      setCreateError(formatErrorMessage(err, 'Failed to create college.'));
    } finally {
      setCreating(false);
    }
  };

  const filteredColleges = colleges.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 border border-yellow-300 text-yellow-950 text-[11px] font-extrabold tracking-widest uppercase mb-2">
            <Building2 className="w-3.5 h-3.5 text-yellow-700" />
            <span>Platform Owner • College Catalog</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-zinc-900 tracking-tight">
            College &amp; Institutional Management
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage multi-tenant higher education institutions, student cohorts, placement officers, and dataset operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadColleges}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-all shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-black text-yellow-400 font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New College</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search college by name, code, or branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-zinc-50 focus:bg-white transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold border border-zinc-300 rounded-xl bg-zinc-50 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Colleges</option>
            <option value="INACTIVE">Inactive Colleges</option>
          </select>

          <div className="text-xs font-bold text-zinc-500">
            Total: <span className="text-zinc-900">{filteredColleges.length}</span>
          </div>
        </div>
      </div>

      {/* College Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500 text-xs space-y-3">
          <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin mx-auto" />
          <p>Loading college portfolios...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-xs text-red-700 bg-red-50 border border-red-200 rounded-2xl">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      ) : filteredColleges.length === 0 ? (
        <div className="p-12 text-center bg-white border border-zinc-200 rounded-2xl space-y-3 shadow-xs">
          <Building2 className="w-10 h-10 text-zinc-300 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-900">No matching colleges found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try adjusting your search criteria or onboard a new client institution.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColleges.map((col) => {
            const studentCount = col.student_count || 0;
            const officerCount = col.officer_count || 0;
            const reportsCount = col.reports_count || 0;
            const avgScore = col.avg_careerfit_score;
            const latestRun = col.latest_run_id;

            return (
              <div
                key={col.id}
                className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-yellow-400 transition-all duration-200 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-zinc-900 text-yellow-400 flex items-center justify-center font-black text-sm shrink-0 border border-zinc-800 shadow-2xs">
                        {col.code?.substring(0, 3) || 'COL'}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-zinc-900 group-hover:text-black line-clamp-1">
                          {col.name}
                        </h3>
                        <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                          <span>Code: {col.code}</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-700">{col.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-zinc-100 text-xs">
                    <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                      <div className="text-[10px] uppercase font-bold text-zinc-400">Students</div>
                      <div className="text-sm font-black text-zinc-900 mt-0.5">
                        {studentCount > 0 ? `${studentCount} Enrolled` : '0 Students'}
                      </div>
                    </div>

                    <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                      <div className="text-[10px] uppercase font-bold text-zinc-400">Officers</div>
                      <div className="text-sm font-black text-zinc-900 mt-0.5">
                        {officerCount > 0 ? `${officerCount} Assigned` : '0 Officers'}
                      </div>
                    </div>

                    <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                      <div className="text-[10px] uppercase font-bold text-zinc-400">Latest Dataset</div>
                      <div className="text-[11px] font-mono font-bold text-zinc-800 truncate mt-0.5">
                        {latestRun ? latestRun.substring(0, 14) + '...' : 'Pending'}
                      </div>
                    </div>

                    <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                      <div className="text-[10px] uppercase font-bold text-zinc-400">Reports</div>
                      <div className="text-sm font-black text-zinc-900 mt-0.5">
                        {reportsCount > 0 ? `${reportsCount} Dossiers` : 'None'}
                      </div>
                    </div>
                  </div>

                  {avgScore && (
                    <div className="px-3 py-2 bg-yellow-50/80 border border-yellow-200/60 rounded-xl text-xs flex items-center justify-between">
                      <span className="font-bold text-yellow-900 text-[11px]">Avg CareerFit Index:</span>
                      <span className="font-mono font-black text-yellow-950">{avgScore} / 800</span>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="pt-2">
                  <button
                    onClick={() => navigate(`/admin/colleges/${col.id}`)}
                    className="w-full py-2.5 px-3.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 group-hover:bg-yellow-400 group-hover:text-black shadow-2xs"
                  >
                    <span>Open College Command Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Onboard New College Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-yellow-100 rounded-xl text-yellow-800">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Onboard New Client College</h3>
                  <p className="text-xs text-zinc-500">Provision a multi-tenant institutional workspace</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateCollege} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">College Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Institute of Technology"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Institution Code</label>
                  <input
                    type="text"
                    placeholder="e.g. AIT-BLR"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                    className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">URL Identifier (Slug)</label>
                  <input
                    type="text"
                    placeholder="e.g. ait"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="e.g. tpo@ait.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Authorized Branches / Departments</label>
                <input
                  type="text"
                  placeholder="e.g. CSE, ISE, AIML, ECE, EEE"
                  value={branches}
                  onChange={(e) => setBranches(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
                />
                <p className="text-[10px] text-zinc-400 mt-1">Comma-separated list of academic disciplines</p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-zinc-600 font-bold hover:bg-zinc-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-yellow-400 font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {creating ? 'Onboarding...' : 'Create College Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
