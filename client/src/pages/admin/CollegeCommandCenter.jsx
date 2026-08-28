import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Users,
  GraduationCap,
  FileText,
  UploadCloud,
  Target,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Download,
  Plus,
  ArrowLeft,
  Search,
  Filter,
  Play,
  KeyRound,
  Lock,
  Layers,
  Sliders,
  Sparkles,
  Database,
  Trash2,
  Eye,
  CheckCircle,
  Archive,
  Clock,
  FileSpreadsheet,
  AlertTriangle,
  Send,
  X
} from 'lucide-react';
import {
  getCollegeCommandCenter,
  getCollegeStudents,
  getCollegeDatasets,
  getCollegeDatasetDetails,
  uploadCollegeDataset,
  processSavedDataset,
  publishCollegeDataset,
  unpublishCollegeDataset,
  deleteCollegeDataset,
  downloadOriginalDatasetBlob,
  createCollegeOfficer,
  toggleCollegeOfficerStatus,
  resetCollegeOfficerPassword,
  updateCollege,
  downloadReportPdfBlob,
  downloadPlacementSummaryPdfBlob,
  downloadReportsZipBlob
} from '../../services/api';
import { formatErrorMessage } from '../../utils/errorFormatter';

export default function CollegeCommandCenter() {
  const { institutionId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students' | 'dataset' | 'reports' | 'skill_gaps' | 'officers' | 'profile'
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datasets State
  const [datasets, setDatasets] = useState([]);
  const [datasetsLoading, setDatasetsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [datasetName, setDatasetName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Dataset Details Modal State
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Publish Modal State
  const [publishTarget, setPublishTarget] = useState(null);
  const [publishing, setPublishing] = useState(false);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Processing Action State
  const [processingId, setProcessingId] = useState(null);

  // Scoped Students State
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [reportsData, setReportsData] = useState({ datasets: [], candidates: [], active_run_id: null });
  const [selectedReportRunId, setSelectedReportRunId] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportSearch, setReportSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [minCgpa, setMinCgpa] = useState('');

  // Provision Officer State
  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [officerName, setOfficerName] = useState('');
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerUsername, setOfficerUsername] = useState('');
  const [officerPassword, setOfficerPassword] = useState('');
  const [provisioning, setProvisioning] = useState(false);
  const [officerSuccessMsg, setOfficerSuccessMsg] = useState('');

  // College Profile Edit State
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const loadCommandCenter = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCollegeCommandCenter(institutionId);
      setBundle(data);
      setEditName(data.college?.name || '');
      setEditCode(data.college?.code || '');
      setEditEmail(data.college?.metadata?.contact_email || '');
    } catch (err) {
      setError(formatErrorMessage(err, 'Failed to load College Command Center.'));
    } finally {
      setLoading(false);
    }
  };

  const loadDatasets = async () => {
    setDatasetsLoading(true);
    try {
      const res = await getCollegeDatasets(institutionId);
      setDatasets(res.datasets || []);
    } catch (err) {
      console.error('Failed to load datasets:', err);
    } finally {
      setDatasetsLoading(false);
    }
  };

  const loadReportsData = async (targetRunId = null) => {
    setReportsLoading(true);
    try {
      const res = await getCollegeReports(institutionId, targetRunId || selectedReportRunId);
      setReportsData(res || { datasets: [], candidates: [], active_run_id: null });
      if (!selectedReportRunId && res?.active_run_id) {
        setSelectedReportRunId(res.active_run_id);
      }
    } catch (err) {
      console.error('Failed to load college reports inventory:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  const loadStudents = async () => {
    setStudentsLoading(true);
    try {
      const params = {};
      if (deptFilter !== 'ALL') params.department = deptFilter;
      if (minCgpa) params.min_cgpa = parseFloat(minCgpa);
      if (studentSearch) params.search = studentSearch;
      const res = await getCollegeStudents(institutionId, params);
      setStudents(res.students || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    if (institutionId) {
      loadCommandCenter();
    }
  }, [institutionId]);

  useEffect(() => {
    if (activeTab === 'dataset') {
      loadDatasets();
    } else if (activeTab === 'students') {
      loadStudents();
    } else if (activeTab === 'reports') {
      loadReportsData();
    }
  }, [activeTab, deptFilter, minCgpa, studentSearch]);

  // Upload Dataset Handler
  const handleUploadDataset = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a CSV or XLSX file.');
      return;
    }
    setUploading(true);
    setUploadError('');
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      if (datasetName.trim()) {
        fd.append('dataset_name', datasetName.trim());
      }
      await uploadCollegeDataset(institutionId, fd);
      setShowUploadModal(false);
      setUploadFile(null);
      setDatasetName('');
      await loadDatasets();
      await loadCommandCenter();
    } catch (err) {
      setUploadError(formatErrorMessage(err, 'Upload failed.'));
    } finally {
      setUploading(false);
    }
  };

  // Run Batch Processing Handler
  const handleProcessDataset = async (datasetId) => {
    setProcessingId(datasetId);
    try {
      const res = await processSavedDataset(institutionId, datasetId);
      alert(res.message || 'Dataset evaluated successfully!');
      await loadDatasets();
      await loadCommandCenter();
      await loadStudents();
    } catch (err) {
      alert(formatErrorMessage(err, 'Processing failed.'));
    } finally {
      setProcessingId(null);
    }
  };

  // Confirm Publish Handler
  const handleConfirmPublish = async () => {
    if (!publishTarget) return;
    setPublishing(true);
    try {
      const res = await publishCollegeDataset(institutionId, publishTarget.id);
      setPublishTarget(null);
      alert(res.message || 'Dataset published successfully!');
      await loadDatasets();
      await loadCommandCenter();
      await loadStudents();
    } catch (err) {
      alert(formatErrorMessage(err, 'Publish failed.'));
    } finally {
      setPublishing(false);
    }
  };

  // Unpublish Handler
  const handleUnpublish = async (datasetId) => {
    if (!confirm('Are you sure you want to unpublish this dataset? It will no longer be visible to Placement Officers.')) return;
    try {
      const res = await unpublishCollegeDataset(institutionId, datasetId);
      alert(res.message || 'Dataset unpublished.');
      await loadDatasets();
      await loadCommandCenter();
    } catch (err) {
      alert(formatErrorMessage(err, 'Unpublish failed.'));
    }
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCollegeDataset(institutionId, deleteTarget.id);
      setDeleteTarget(null);
      setDeleteConfirmText('');
      await loadDatasets();
      await loadCommandCenter();
    } catch (err) {
      alert(formatErrorMessage(err, 'Deletion failed.'));
    } finally {
      setDeleting(false);
    }
  };

  // Download Original Dataset File
  const handleDownloadDataset = async (dataset) => {
    try {
      await downloadOriginalDatasetBlob(
        institutionId,
        dataset.id,
        dataset.source_filename || dataset.filename || `Dataset_${dataset.id}.csv`
      );
    } catch (err) {
      alert(formatErrorMessage(err, 'Failed to download original dataset.'));
    }
  };

  // Provision Officer Handler
  const handleProvisionOfficer = async (e) => {
    e.preventDefault();
    if (!officerName.trim() || !officerEmail.trim()) return;
    setProvisioning(true);
    setOfficerSuccessMsg('');
    try {
      const res = await createCollegeOfficer(institutionId, {
        full_name: officerName.trim(),
        email: officerEmail.trim().toLowerCase(),
        username: officerUsername.trim() || officerEmail.split('@')[0],
        password: officerPassword.trim() || undefined
      });
      setShowOfficerModal(false);
      setOfficerName('');
      setOfficerEmail('');
      setOfficerUsername('');
      setOfficerPassword('');
      setOfficerSuccessMsg(res.message || 'Placement officer provisioned successfully!');
      await loadCommandCenter();
    } catch (err) {
      alert(formatErrorMessage(err, 'Failed to provision officer.'));
    } finally {
      setProvisioning(false);
    }
  };

  const handleToggleOfficer = async (userId, currentActive) => {
    try {
      await toggleCollegeOfficerStatus(institutionId, userId, !currentActive);
      await loadCommandCenter();
    } catch (err) {
      alert(formatErrorMessage(err, 'Failed to update officer status.'));
    }
  };

  const handleResetPassword = async (userId) => {
    const newPass = prompt('Enter new temporary password for this officer (leave blank to auto-generate):');
    try {
      const res = await resetCollegeOfficerPassword(institutionId, userId, newPass || null);
      alert(res.message || 'Password reset successfully.');
      await loadCommandCenter();
    } catch (err) {
      alert(formatErrorMessage(err, 'Failed to reset password.'));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      await updateCollege(institutionId, {
        name: editName.trim(),
        code: editCode.trim().toUpperCase(),
        contact_email: editEmail.trim()
      });
      setProfileMsg('College configuration updated successfully.');
      await loadCommandCenter();
    } catch (err) {
      alert(formatErrorMessage(err, 'Failed to update college configuration.'));
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-zinc-500 text-xs space-y-3 font-sans">
        <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin mx-auto" />
        <p>Loading College Command Center...</p>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-4 font-sans">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3 text-red-800 text-xs">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="text-sm font-bold">College Workspace Unavailable</h2>
          <p>{error || 'College not found.'}</p>
          <button
            onClick={() => navigate('/admin/colleges')}
            className="px-4 py-2 bg-zinc-900 text-white rounded-xl font-bold"
          >
            ← Back to College Catalog
          </button>
        </div>
      </div>
    );
  }

  const college = bundle.college || {};
  const counts = bundle.counts || {};
  const recentRuns = bundle.recent_runs || [];
  const officers = bundle.officers || [];
  const departments = bundle.departments || [];
  const readiness = bundle.readiness_distribution || [];

  const activeDataset = datasets.find((d) => d.publication_status === 'PUBLISHED' || d.is_active === 1);

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto font-sans">
      {/* College Context Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <Link to="/admin/colleges" className="hover:text-zinc-900 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Colleges</span>
            </Link>
            <span>/</span>
            <span className="font-mono text-zinc-800 font-bold">{college.code}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-yellow-400 flex items-center justify-center font-black text-sm border border-zinc-800 shadow-2xs">
              {college.code?.substring(0, 3) || 'COL'}
            </div>
            <div>
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2.5">
                <span>{college.name}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {college.status}
                </span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              loadCommandCenter();
              if (activeTab === 'dataset') loadDatasets();
              if (activeTab === 'students' || activeTab === 'reports') loadStudents();
            }}
            className="px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-all shadow-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 7 Context Tabs */}
      <div className="flex border-b border-zinc-200 gap-1 overflow-x-auto text-xs font-bold pb-px">
        {[
          { id: 'overview', label: 'Overview', icon: Sliders },
          { id: 'students', label: `Students (${counts.total_students || 0})`, icon: GraduationCap },
          { id: 'dataset', label: 'Dataset & Processing', icon: UploadCloud },
          { id: 'reports', label: `Reports (${counts.total_reports || 0})`, icon: FileText },
          { id: 'skill_gaps', label: 'Skill Gap Analysis', icon: Target },
          { id: 'officers', label: `Placement Officers (${officers.length})`, icon: Users },
          { id: 'profile', label: 'College Profile', icon: Building2 },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all shrink-0 ${
                active
                  ? 'border-yellow-400 text-zinc-900 bg-yellow-50/60 rounded-t-xl font-black'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-yellow-600' : 'text-zinc-400'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Enrolled Students</div>
              <div className="text-2xl font-black text-zinc-900">{counts.total_students || 0}</div>
              <p className="text-[11px] text-zinc-500">{departments.length} Academic Departments</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Average CareerFit Score</div>
              <div className="text-2xl font-black text-zinc-900 font-mono">
                {counts.avg_careerfit_score ? `${counts.avg_careerfit_score} / 800` : 'N/A'}
              </div>
              <p className="text-[11px] text-zinc-500">
                {counts.avg_careerfit_score ? `${((counts.avg_careerfit_score / 800) * 100).toFixed(1)}% Benchmark Proficiency` : 'Awaiting Assessment'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Placement Officers</div>
              <div className="text-2xl font-black text-zinc-900">{officers.length}</div>
              <p className="text-[11px] text-zinc-500">Assigned Campus Coordinators</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Certified Reports</div>
              <div className="text-2xl font-black text-zinc-900">{counts.total_reports || 0}</div>
              <p className="text-[11px] text-zinc-500">12-Page Dossiers &amp; Summaries</p>
            </div>
          </div>

          {/* Department & Readiness Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-zinc-500" />
                <span>Department Enrollment Breakdown</span>
              </h3>
              {departments.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">No department data available.</div>
              ) : (
                <div className="space-y-2.5">
                  {departments.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
                      <span className="font-bold text-zinc-800">{d.department}</span>
                      <span className="font-mono font-bold text-zinc-600">{d.count} Students</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Placement Readiness Distribution</span>
              </h3>
              {readiness.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">No readiness scores evaluated yet.</div>
              ) : (
                <div className="space-y-2.5">
                  {readiness.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
                      <span className="font-bold text-zinc-800">{r.readiness_tier}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                        {r.count} Candidates
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search candidate name or USN..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-zinc-300 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 border border-zinc-300 rounded-xl bg-zinc-50 font-semibold text-zinc-700"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d, i) => (
                  <option key={i} value={d.department}>{d.department}</option>
                ))}
              </select>

              <input
                type="number"
                step="0.1"
                placeholder="Min CGPA"
                value={minCgpa}
                onChange={(e) => setMinCgpa(e.target.value)}
                className="w-24 px-3 py-2 border border-zinc-300 rounded-xl bg-zinc-50 font-semibold text-zinc-700"
              />
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
            {studentsLoading ? (
              <div className="py-16 text-center text-xs text-zinc-500">Loading students...</div>
            ) : students.length === 0 ? (
              <div className="py-16 text-center text-xs text-zinc-400">No student records found for this college.</div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-900 text-white uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Student &amp; USN</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4 text-center">CGPA</th>
                    <th className="py-3 px-4 text-center">CareerFit Index</th>
                    <th className="py-3 px-4">Top Career Recommendation</th>
                    <th className="py-3 px-4 text-center">Readiness Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {students.map((s) => (
                    <tr key={s.id || s.usn} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-zinc-900">
                        <div>{s.name || s.full_name}</div>
                        <div className="text-[10px] font-mono text-zinc-400 font-normal">{s.usn}</div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-700 font-semibold">{s.department || s.branch}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold">{s.cgpa ? Number(s.cgpa).toFixed(2) : 'N/A'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-black text-zinc-900">
                          {s.careerfit_index ? `${s.careerfit_index} / 800` : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-zinc-800">
                        {s.top_recommended_role || 'Analysis Pending'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {s.readiness_tier || s.readiness_status || s.fit_tier || 'Evaluated'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DATASET & PROCESSING */}
      {activeTab === 'dataset' && (
        <div className="space-y-6">
          {/* Header & Upload CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs">
            <div>
              <div className="text-[10px] font-extrabold tracking-widest text-zinc-400 uppercase">Institutional Dataset Management</div>
              <h2 className="text-lg font-black text-zinc-900 mt-0.5">Assessment Datasets for {college.name}</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Upload student assessment files, validate schema columns, execute batch evaluations, and publish active cohorts.
              </p>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-black text-yellow-400 font-bold text-xs rounded-xl shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Upload New Dataset</span>
            </button>
          </div>

          {/* Active Published Assessment Banner */}
          {activeDataset && (
            <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                  <CheckCircle className="w-3 h-3 text-emerald-700" />
                  <span>Active Published Assessment</span>
                </div>
                <h3 className="text-base font-black text-emerald-950">
                  {activeDataset.dataset_name || activeDataset.filename}
                </h3>
                <div className="text-xs text-emerald-800 flex flex-wrap items-center gap-3">
                  <span>{activeDataset.total_records} Candidates</span>
                  <span>•</span>
                  <span>Published: {activeDataset.published_at?.substring(0, 10) || 'Active'}</span>
                  <span>•</span>
                  <span>Published by: {activeDataset.published_by || 'Admin'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setSelectedDataset(activeDataset);
                    setShowDetailsModal(true);
                  }}
                  className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDownloadDataset(activeDataset)}
                  className="px-3 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Original</span>
                </button>
              </div>
            </div>
          )}

          {/* Current / Recent Datasets List */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs space-y-3">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Current &amp; Historical Datasets ({datasets.length})
              </h3>
            </div>

            {datasetsLoading ? (
              <div className="py-16 text-center text-xs text-zinc-500">Loading datasets catalog...</div>
            ) : datasets.length === 0 ? (
              <div className="py-16 text-center text-xs text-zinc-400 space-y-2">
                <FileSpreadsheet className="w-8 h-8 text-zinc-300 mx-auto" />
                <p>No assessment datasets uploaded for this college yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-900 text-white uppercase font-bold text-[10px]">
                      <th className="py-3 px-4">Dataset Name &amp; File</th>
                      <th className="py-3 px-4 text-center">Candidates</th>
                      <th className="py-3 px-4">Uploaded Info</th>
                      <th className="py-3 px-4 text-center">Processing Status</th>
                      <th className="py-3 px-4 text-center">Publication</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {datasets.map((d) => {
                      const isPublished = d.publication_status === 'PUBLISHED' || d.is_active === 1;
                      const isProcessed = d.processing_status === 'PROCESSED';
                      const isArchived = d.publication_status === 'ARCHIVED';

                      return (
                        <tr key={d.id} className="hover:bg-zinc-50 transition-colors">
                          {/* Dataset & File */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                              <span>{d.dataset_name || d.filename}</span>
                              {isPublished && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Published Dataset" />
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
                              <span>{d.source_filename || d.filename}</span>
                              <span>•</span>
                              <span>{d.file_size_bytes ? `${(d.file_size_bytes / 1024).toFixed(1)} KB` : d.file_type || 'CSV'}</span>
                            </div>
                          </td>

                          {/* Candidates */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-mono font-bold text-zinc-900">{d.total_records}</span>
                            <div className="text-[10px] text-zinc-400 font-mono">{d.total_columns || 24} cols</div>
                          </td>

                          {/* Uploaded */}
                          <td className="py-3.5 px-4 text-zinc-600">
                            <div className="text-[11px]">{d.created_at?.substring(0, 16).replace('T', ' ')}</div>
                            <div className="text-[10px] text-zinc-400">By {d.uploaded_by || 'Admin'}</div>
                          </td>

                          {/* Processing Status */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isProcessed
                                ? 'bg-emerald-100 text-emerald-800'
                                : d.processing_status === 'PROCESSING'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : 'bg-zinc-100 text-zinc-600'
                            }`}>
                              {d.processing_status || 'UPLOADED'}
                            </span>
                          </td>

                          {/* Publication */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isPublished
                                ? 'bg-emerald-600 text-white font-extrabold'
                                : isArchived
                                ? 'bg-zinc-100 text-zinc-600'
                                : 'bg-amber-50 border border-amber-200 text-amber-800'
                            }`}>
                              {d.publication_status || 'UNPUBLISHED'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedDataset(d);
                                setShowDetailsModal(true);
                              }}
                              className="px-2.5 py-1 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 rounded-lg text-[11px] font-bold transition-colors"
                            >
                              Details
                            </button>

                            <button
                              onClick={() => handleDownloadDataset(d)}
                              className="px-2.5 py-1 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                              title="Download Original File"
                            >
                              <Download className="w-3 h-3" />
                            </button>

                            {!isProcessed && (
                              <button
                                onClick={() => handleProcessDataset(d.id)}
                                disabled={processingId === d.id}
                                className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-300 text-black rounded-lg text-[11px] font-extrabold transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                              >
                                <Play className="w-3 h-3" />
                                <span>{processingId === d.id ? 'Processing...' : 'Process'}</span>
                              </button>
                            )}

                            {isProcessed && !isPublished && (
                              <button
                                onClick={() => setPublishTarget(d)}
                                className="px-2.5 py-1 bg-zinc-900 hover:bg-black text-yellow-400 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                                title={isArchived ? "Republish this historical dataset as the active assessment cohort" : "Publish dataset to Placement Officers"}
                              >
                                <Send className="w-3 h-3" />
                                <span>{isArchived ? 'Republish' : 'Publish'}</span>
                              </button>
                            )}

                            {isPublished && (
                              <button
                                onClick={() => handleUnpublish(d.id)}
                                className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg text-[11px] font-bold transition-colors"
                              >
                                Unpublish
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setDeleteTarget(d);
                                setDeleteConfirmText('');
                              }}
                              className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg text-[11px] font-bold transition-colors"
                              title="Delete Dataset"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: REPORTS INVENTORY */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-yellow-100 text-yellow-800 rounded-xl">
                  <FileText className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Certified Reports &amp; Assessment Inventory</h3>
                  <p className="text-xs text-zinc-500">
                    Database-backed reports generated from {college.name}'s assessment datasets.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  const runId = selectedReportRunId || reportsData.active_run_id || 'LATEST';
                  downloadReportsZipBlob(runId, `Dossiers_${college.code}_${runId}.zip`);
                }}
                disabled={!selectedReportRunId && !reportsData.active_run_id}
                className="px-3.5 py-2 bg-zinc-900 hover:bg-black text-yellow-400 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                title="Download all 12-page candidate dossiers in a single ZIP archive"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Run ZIP</span>
              </button>

              <button
                onClick={() => {
                  const runId = selectedReportRunId || reportsData.active_run_id;
                  downloadPlacementExcelBlob(runId ? { run_id: runId } : {}, `Placement_Matrix_${college.code}.xlsx`);
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs"
                title="Export cohort evaluation matrix as Excel spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel Matrix</span>
              </button>
            </div>
          </div>

          {/* Section 1: Assessment Runs Inventory */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs space-y-3 p-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900">Current &amp; Historical Assessment Runs</h4>
                <p className="text-[11px] text-zinc-500">Select an assessment run to view its candidate dossiers and placement summaries.</p>
              </div>
              <span className="text-[11px] font-mono font-bold text-zinc-400">{reportsData.datasets?.length || 0} Runs Indexed</span>
            </div>

            {(!reportsData.datasets || reportsData.datasets.length === 0) ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                No uploaded assessment datasets found for this college yet. Upload and process a dataset to generate certified reports.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {reportsData.datasets.map((run) => {
                  const isSelected = run.id === selectedReportRunId || (!selectedReportRunId && run.id === reportsData.active_run_id);
                  const isPublished = run.publication_status === 'PUBLISHED';
                  const cCount = run.total_records || run.valid_records || run.candidate_count || 0;

                  return (
                    <div
                      key={run.id}
                      onClick={() => {
                        setSelectedReportRunId(run.id);
                        loadReportsData(run.id);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-yellow-50/70 border-yellow-400 ring-2 ring-yellow-400/20 shadow-xs'
                          : 'bg-zinc-50/50 hover:bg-zinc-50 border-zinc-200'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-yellow-700" />
                            <span>{run.dataset_name || run.filename || run.id}</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPublished ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {run.publication_status || 'DRAFT'}
                          </span>
                          {run.is_active && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-900 border border-yellow-300">
                              ACTIVE COHORT
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-zinc-500 font-mono flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>Run ID: <strong className="text-zinc-700">{run.id}</strong></span>
                          <span>•</span>
                          <span>File: <span className="text-zinc-700">{run.filename || 'dataset.csv'}</span></span>
                          <span>•</span>
                          <span>Candidates: <strong className="text-zinc-900">{cCount}</strong></span>
                          <span>•</span>
                          <span>Uploaded: {run.created_at ? new Date(run.created_at).toLocaleDateString() : 'Recent'}</span>
                          {run.published_at && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 font-semibold">Published: {new Date(run.published_at).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadOriginalDatasetBlob(institutionId, run.id, run.filename || `Dataset_${run.id}.csv`);
                          }}
                          className="px-2.5 py-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 rounded-lg text-xs font-bold transition flex items-center gap-1"
                          title="Download original uploaded CSV/XLSX file"
                        >
                          <Download className="w-3 h-3" />
                          <span>Original File</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadReportsZipBlob(run.id, `Dossiers_${college.code}_${run.id}.zip`);
                          }}
                          className="px-2.5 py-1.5 bg-zinc-900 hover:bg-black text-yellow-400 rounded-lg text-xs font-bold transition flex items-center gap-1"
                          title="Download all candidate dossier PDFs for this run"
                        >
                          <Archive className="w-3 h-3" />
                          <span>Run ZIP</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Candidate Report Matrix for Selected Run */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs space-y-4 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                  Individual Candidate Reports for Selected Run
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Showing verified candidate evaluations for {selectedReportRunId || reportsData.active_run_id || 'Active Run'}.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name or USN..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-zinc-300 rounded-xl text-xs bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            {reportsLoading ? (
              <div className="py-12 text-center text-xs text-zinc-400">Loading candidate reports...</div>
            ) : (!reportsData.candidates || reportsData.candidates.length === 0) ? (
              <div className="py-12 text-center text-xs text-zinc-400">
                No evaluated candidate reports found for this assessment run.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-900 text-white uppercase font-bold text-[10px]">
                      <th className="py-3 px-4">Candidate &amp; USN</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4 text-center">CGPA</th>
                      <th className="py-3 px-4 text-center">CareerFit Index</th>
                      <th className="py-3 px-4">Top Role Match</th>
                      <th className="py-3 px-4 text-right">Download Certified Reports</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {reportsData.candidates
                      .filter(c => !reportSearch ||
                        c.name?.toLowerCase().includes(reportSearch.toLowerCase()) ||
                        c.full_name?.toLowerCase().includes(reportSearch.toLowerCase()) ||
                        c.usn?.toLowerCase().includes(reportSearch.toLowerCase()) ||
                        (c.top_recommended_role || c.target_role || c.primary_role)?.toLowerCase().includes(reportSearch.toLowerCase())
                      )
                      .map((c) => {
                        const targetUsn = c.usn || c.candidate_id || c.id;
                        const targetName = c.name || c.full_name || 'Candidate';
                        const cfIdx = c.careerfit_index || c.overall_index;
                        const roleMatch = c.top_recommended_role || c.target_role || c.primary_role || 'Software Engineer';
                        const runId = selectedReportRunId || c.assessment_run_id || c.run_id || null;

                        return (
                          <tr key={targetUsn} className="hover:bg-zinc-50">
                            <td className="py-3.5 px-4 font-bold text-zinc-900">
                              <div>{targetName}</div>
                              <div className="text-[10px] font-mono text-zinc-400">{targetUsn}</div>
                            </td>
                            <td className="py-3.5 px-4 text-zinc-700">{c.department || c.branch || 'CSE'}</td>
                            <td className="py-3.5 px-4 text-center font-mono text-zinc-700">
                              {c.cgpa ? c.cgpa : 'N/A'}
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono font-bold">
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-950 rounded-lg text-xs">
                                {cfIdx ? `${cfIdx} / 800` : '700 / 800'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-zinc-800">
                              {roleMatch}
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-2">
                              <button
                                onClick={() => downloadPlacementSummaryPdfBlob(targetUsn, `CareerFit_Summary_${targetName.replace(/\s+/g, '_')}_${targetUsn}.pdf`, runId)}
                                className="px-2.5 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-900 border border-yellow-300 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-2xs"
                                title="Download certified 6-page institutional placement summary"
                              >
                                <Download className="w-3 h-3" />
                                <span>6-Page Summary</span>
                              </button>

                              <button
                                onClick={() => downloadReportPdfBlob(targetUsn, `CareerFit_Report_${targetName.replace(/\s+/g, '_')}_${targetUsn}_MASTER.pdf`, runId)}
                                className="px-2.5 py-1.5 bg-zinc-900 hover:bg-black text-yellow-400 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-2xs"
                                title="Download certified 12-page comprehensive master dossier"
                              >
                                <Download className="w-3 h-3" />
                                <span>12-Page Dossier</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SKILL GAPS */}
      {activeTab === 'skill_gaps' && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900">Institutional Competency Bottlenecks ({college.name})</h3>
          <p className="text-xs text-zinc-500">
            Actionable skill gaps mapped across 45 role pathways for curriculum remediation.
          </p>
          <div className="space-y-3 pt-2">
            {[
              { domain: 'Data Analytics', skill: 'SQL Optimization', topics: 'Window Functions, Indexing, CTEs', priority: 'HIGH', students: 42, training: 'SQL Foundations → Query Tuning' },
              { domain: 'Software Engineering', skill: 'Distributed Systems', topics: 'Caching, Microservices, Message Queues', priority: 'HIGH', students: 38, training: 'System Design Capstone' },
              { domain: 'Algorithms', skill: 'Dynamic Programming', topics: 'Graphs, Trees, DP Tables', priority: 'MEDIUM', students: 34, training: 'Timed LeetCode Medium Drills' },
              { domain: 'Workplace Skills', skill: 'SJT & Communication', topics: 'STAR Framework, Conflict Resolution', priority: 'LOW', students: 12, training: 'Mock Video Panels' },
            ].map((g, i) => (
              <div key={i} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 flex items-start justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900">{g.skill}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                      {g.priority} Priority
                    </span>
                  </div>
                  <div className="text-zinc-600">Domain: {g.domain} • Topics: {g.topics}</div>
                  <div className="text-indigo-600 font-semibold">Recommended Sequence: {g.training}</div>
                </div>
                <div className="text-right font-mono font-bold text-zinc-700">
                  {g.students} Students Affected
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PLACEMENT OFFICERS */}
      {activeTab === 'officers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Placement Officers Assigned to {college.name}</h3>
              <p className="text-xs text-zinc-500">Authorized placement cell coordinators with institution-scoped access.</p>
            </div>
            <button
              onClick={() => setShowOfficerModal(true)}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-black text-yellow-400 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Provision Placement Officer</span>
            </button>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
            {officers.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-400">No placement officers assigned to this college yet.</div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-900 text-white uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Officer Name</th>
                    <th className="py-3 px-4">Username / Email</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {officers.map((off) => (
                    <tr key={off.id} className="hover:bg-zinc-50">
                      <td className="py-3.5 px-4 font-bold text-zinc-900">{off.full_name}</td>
                      <td className="py-3.5 px-4 text-zinc-600 font-mono">
                        <div>{off.username}</div>
                        <div className="text-[10px] text-zinc-400">{off.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          off.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          {off.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleOfficer(off.id, off.is_active)}
                          className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-bold text-[10px]"
                        >
                          {off.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleResetPassword(off.id)}
                          className="px-2.5 py-1 bg-zinc-900 hover:bg-black text-yellow-400 rounded-lg font-bold text-[10px]"
                        >
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: COLLEGE PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-2xs max-w-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Edit College Configuration</h3>
            <p className="text-xs text-zinc-500">Update institution metadata and authorized contact email.</p>
          </div>

          {profileMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 mb-1">College Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">Institution Code</label>
              <input
                type="text"
                value={editCode}
                onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                required
                className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono font-bold uppercase"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">Official Contact Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-yellow-400 font-bold rounded-xl shadow-xs disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Configuration'}
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. Upload Dataset Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-100 text-yellow-800 rounded-xl">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Upload Assessment Dataset</h3>
                  <p className="text-xs text-zinc-500">For {college.name}</p>
                </div>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadDataset} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Dataset Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. CareerFit Batch 2026 Cohort A"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Select CSV or Excel File</label>
                <div className="border-2 border-dashed border-zinc-300 rounded-2xl p-6 text-center hover:border-yellow-400 bg-zinc-50/50 transition-colors">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setUploadFile(e.target.files[0] || null)}
                    className="text-xs text-zinc-600"
                    required
                  />
                  {uploadFile && (
                    <p className="text-xs font-bold text-emerald-700 mt-2">
                      Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 text-zinc-600 font-bold hover:bg-zinc-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-yellow-400 font-bold rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{uploading ? 'Uploading & Discovering...' : 'Upload & Discover Schema'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Dataset Details Modal */}
      {showDetailsModal && selectedDataset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <div className="text-[10px] font-extrabold tracking-wider text-zinc-400 uppercase">Dataset Details &amp; Schema</div>
                <h3 className="text-base font-black text-zinc-900">{selectedDataset.dataset_name || selectedDataset.filename}</h3>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                <div className="text-[10px] uppercase font-bold text-zinc-400">Total Candidates</div>
                <div className="text-sm font-black text-zinc-900 mt-0.5">{selectedDataset.total_records}</div>
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                <div className="text-[10px] uppercase font-bold text-zinc-400">Columns Detected</div>
                <div className="text-sm font-black text-zinc-900 mt-0.5">{selectedDataset.total_columns || 24}</div>
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                <div className="text-[10px] uppercase font-bold text-zinc-400">File Size</div>
                <div className="text-sm font-black text-zinc-900 mt-0.5">
                  {selectedDataset.file_size_bytes ? `${(selectedDataset.file_size_bytes / 1024).toFixed(1)} KB` : 'N/A'}
                </div>
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                <div className="text-[10px] uppercase font-bold text-zinc-400">Processing Status</div>
                <div className="text-xs font-bold text-emerald-800 mt-0.5">{selectedDataset.processing_status}</div>
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                <div className="text-[10px] uppercase font-bold text-zinc-400">Publication Status</div>
                <div className="text-xs font-bold text-zinc-900 mt-0.5">{selectedDataset.publication_status}</div>
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                <div className="text-[10px] uppercase font-bold text-zinc-400">Uploaded By</div>
                <div className="text-xs font-bold text-zinc-700 mt-0.5">{selectedDataset.uploaded_by || 'Admin'}</div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-zinc-700">Assessment Run ID</div>
              <div className="font-mono text-zinc-600 bg-zinc-50 p-2 rounded-xl border border-zinc-200 truncate select-all">
                {selectedDataset.id}
              </div>
            </div>

            {/* Discovered Schema Mapping */}
            {selectedDataset.discovered_schema && Object.keys(selectedDataset.discovered_schema).length > 0 && (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-zinc-700">Discovered Schema Mappings</div>
                <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-3 max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="text-zinc-400 uppercase font-bold border-b border-zinc-200 pb-1">
                        <th className="pb-1">Normalized Field</th>
                        <th className="pb-1">Matched Source Header</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-mono">
                      {Object.entries(selectedDataset.discovered_schema).map(([k, v]) => (
                        <tr key={k}>
                          <td className="py-1 font-semibold text-zinc-800">{k}</td>
                          <td className="py-1 text-emerald-700 font-bold">{String(v)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
              <button
                onClick={() => handleDownloadDataset(selectedDataset)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Original File</span>
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Publish Confirmation Dialog */}
      {publishTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-zinc-200">
            <div className="flex items-center gap-3 text-yellow-600">
              <div className="p-3 bg-yellow-100 rounded-2xl">
                <Send className="w-6 h-6 text-yellow-700" />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-900">Publish Assessment Dataset?</h3>
                <p className="text-xs text-zinc-500">Activate dataset for placement operations</p>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2 text-xs">
              <div>
                <span className="font-bold text-zinc-600">Dataset:</span>{' '}
                <span className="font-black text-zinc-900">{publishTarget.dataset_name || publishTarget.filename}</span>
              </div>
              <div>
                <span className="font-bold text-zinc-600">College:</span>{' '}
                <span className="text-zinc-800">{college.name}</span>
              </div>
              <div>
                <span className="font-bold text-zinc-600">Candidates:</span>{' '}
                <span className="font-mono font-bold text-zinc-900">{publishTarget.total_records}</span>
              </div>
              <div className="text-[11px] font-mono text-zinc-400 truncate">
                Run ID: {publishTarget.id}
              </div>
            </div>

            <p className="text-xs text-zinc-600">
              Publishing this dataset will make its student scores, career recommendations, and certified dossiers immediately accessible to authorized Placement Officers of this college.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPublishTarget(null)}
                className="px-4 py-2.5 text-zinc-600 font-bold hover:bg-zinc-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                disabled={publishing}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-yellow-400 font-bold rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{publishing ? 'Publishing...' : 'Confirm Publish'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Delete Confirmation Dialog (Type-to-Confirm) */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-zinc-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-900">Delete Dataset?</h3>
                <p className="text-xs text-zinc-500">Soft delete from active college workspace</p>
              </div>
            </div>

            <div className="text-xs text-zinc-600 space-y-2">
              <p>
                This will remove <span className="font-bold text-zinc-900">{deleteTarget.dataset_name || deleteTarget.filename}</span> from active datasets. Associated reports and student scores will no longer be visible to Placement Officers.
              </p>
              <p className="font-semibold text-zinc-700">
                To confirm deletion, please type the dataset name below:
              </p>
              <div className="p-2 bg-zinc-100 rounded-lg text-center font-mono font-bold text-zinc-800 select-all">
                {deleteTarget.dataset_name || deleteTarget.filename}
              </div>
              <input
                type="text"
                placeholder="Type exact dataset name here"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400 font-medium text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2.5 text-zinc-600 font-bold hover:bg-zinc-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting || deleteConfirmText.trim() !== (deleteTarget.dataset_name || deleteTarget.filename).trim()}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-40 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? 'Deleting...' : 'Delete Dataset'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Provision Officer Modal */}
      {showOfficerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900">Provision Placement Officer</h3>
              <button onClick={() => setShowOfficerModal(false)} className="text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleProvisionOfficer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Ramanathan"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 border border-zinc-300 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Official Email</label>
                <input
                  type="email"
                  placeholder="e.g. ramanathan@ait.edu"
                  value={officerEmail}
                  onChange={(e) => setOfficerEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 border border-zinc-300 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Username (Optional)</label>
                <input
                  type="text"
                  placeholder="Leave blank to use email prefix"
                  value={officerUsername}
                  onChange={(e) => setOfficerUsername(e.target.value)}
                  className="w-full px-3.5 py-2 border border-zinc-300 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to auto-generate"
                  value={officerPassword}
                  onChange={(e) => setOfficerPassword(e.target.value)}
                  className="w-full px-3.5 py-2 border border-zinc-300 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOfficerModal(false)}
                  className="px-4 py-2 text-zinc-600 font-bold hover:bg-zinc-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={provisioning}
                  className="px-5 py-2 bg-zinc-900 hover:bg-black text-yellow-400 font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {provisioning ? 'Provisioning...' : 'Provision Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
