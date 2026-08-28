import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  FileText,
  ArrowUpRight,
  Download,
  GraduationCap,
  Layers,
  Edit,
  X,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import {
  getLatestCandidates,
  downloadReportPdfBlob,
  downloadPlacementSummaryPdfBlob,
  downloadPlacementExcelBlob,
  updateStudentPlacementProfile,
  getActiveRunId
} from '../services/api';
import RunSelector from '../components/RunSelector';
import {
  PageHeader,
  StatusBadge,
  ScoreDisplay,
  DataTable,
  Button
} from '../components/ui';

export default function CandidateDirectory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [placementFilter, setPlacementFilter] = useState('ALL');
  const [minCgpaFilter, setMinCgpaFilter] = useState('');
  const [minCareerFitFilter, setMinCareerFitFilter] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState({});
  const [downloadingSummary, setDownloadingSummary] = useState({});
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Profile Edit Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [profileForm, setProfileForm] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const currentRunId = searchParams.get('run_id') || getActiveRunId();

  useEffect(() => {
    loadCandidates(currentRunId);
  }, [currentRunId]);

  const loadCandidates = async (targetRunId = null) => {
    setLoading(true);
    try {
      const runId = targetRunId || searchParams.get('run_id') || getActiveRunId();
      if (!runId) {
        setCandidates([]);
        return;
      }
      const data = await getLatestCandidates(runId);
      setCandidates(Array.isArray(data) ? data : (data?.candidates || []));
    } catch (err) {
      console.error("Failed to load directory:", err);
    } finally {
      setLoading(false);
    }
  };

  const departments = ['ALL', ...new Set(candidates.map(c => c.department || c.branch).filter(Boolean))];

  const filteredCandidates = candidates.filter(c => {
    const matchesDept = deptFilter === 'ALL' || (c.department || c.branch) === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || (c.readiness_status || c.readiness_tier || c.fit_tier || '').toUpperCase().includes(statusFilter);
    const matchesPlacement = placementFilter === 'ALL' || (c.placement_status || 'NOT_PLACED').toUpperCase() === placementFilter;
    
    const cgpaVal = typeof c.cgpa === 'number' ? c.cgpa : parseFloat(c.cgpa);
    const matchesMinCgpa = !minCgpaFilter || (!isNaN(cgpaVal) && cgpaVal >= parseFloat(minCgpaFilter));

    const cfVal = c.overall_index || c.careerfit_index || Math.round(200 + ((c.fit_score || 0) / 100) * 600);
    const matchesMinCf = !minCareerFitFilter || (cfVal >= parseInt(minCareerFitFilter, 10));

    const matchesSearch = !searchQuery || 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.usn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.top_recommended_role || c.target_role || c.primary_role)?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesStatus && matchesPlacement && matchesMinCgpa && matchesMinCf && matchesSearch;
  });

  const handleDownloadPdf = async (e, candidate) => {
    e.stopPropagation();
    const cleanId = candidate.usn || candidate.candidate_id || candidate.id;
    const safeName = (candidate.name || candidate.full_name || 'Candidate').replace(/\s+/g, '_');
    const safeUsn = (candidate.usn || 'USN').trim();
    const filename = `CareerFit_Report_${safeName}_${safeUsn}_MASTER.pdf`;

    setDownloadingPdf(prev => ({ ...prev, [cleanId]: true }));
    try {
      await downloadReportPdfBlob(cleanId, filename, candidate.assessment_run_id || candidate.run_id || null);
    } catch (err) {
      alert(err.message || 'Failed to download candidate dossier PDF.');
    } finally {
      setDownloadingPdf(prev => ({ ...prev, [cleanId]: false }));
    }
  };

  const handleDownloadSummary = async (e, candidate) => {
    e.stopPropagation();
    const cleanId = candidate.usn || candidate.candidate_id || candidate.id;
    const safeName = (candidate.name || candidate.full_name || 'Candidate').replace(/\s+/g, '_');
    const safeUsn = (candidate.usn || 'USN').trim();
    const filename = `CareerFit_Summary_${safeName}_${safeUsn}.pdf`;

    setDownloadingSummary(prev => ({ ...prev, [cleanId]: true }));
    try {
      await downloadPlacementSummaryPdfBlob(cleanId, filename, candidate.assessment_run_id || candidate.run_id || null);
    } catch (err) {
      alert(err.message || 'Failed to download Placement Summary PDF.');
    } finally {
      setDownloadingSummary(prev => ({ ...prev, [cleanId]: false }));
    }
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      await downloadPlacementExcelBlob({
        runId: currentRunId,
        minCgpa: minCgpaFilter,
        minCf: minCareerFitFilter,
        department: deptFilter,
        placementStatus: placementFilter,
        search: searchQuery
      });
    } catch (err) {
      alert(err.message || 'Failed to export candidate records to Excel.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const openEditModal = (e, candidate) => {
    e.stopPropagation();
    setEditingStudent(candidate);
    setProfileForm({
      full_name: candidate.full_name || candidate.name || '',
      email: candidate.email || '',
      phone: candidate.phone || '',
      department: candidate.department || candidate.branch || 'CSE',
      cgpa: candidate.cgpa || '',
      graduation_year: candidate.graduation_year || candidate.batch_year || '2026',
      skills: Array.isArray(candidate.skills) ? candidate.skills.join(', ') : (candidate.skills || ''),
      certifications: Array.isArray(candidate.certifications) ? candidate.certifications.join(', ') : (candidate.certifications || ''),
      placement_status: candidate.placement_status || 'NOT_PLACED',
      placed_company: candidate.placed_company || '',
      package_lpa: candidate.package_lpa || ''
    });
    setSaveMessage('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    setIsSavingProfile(true);
    setSaveMessage('');
    try {
      const studentId = editingStudent.id || editingStudent.student_id || editingStudent.usn;
      const payload = {
        ...profileForm,
        cgpa: profileForm.cgpa ? parseFloat(profileForm.cgpa) : null,
        package_lpa: profileForm.package_lpa ? parseFloat(profileForm.package_lpa) : null,
        skills: typeof profileForm.skills === 'string' ? profileForm.skills.split(',').map(s => s.trim()).filter(Boolean) : profileForm.skills,
        certifications: typeof profileForm.certifications === 'string' ? profileForm.certifications.split(',').map(s => s.trim()).filter(Boolean) : profileForm.certifications
      };
      await updateStudentPlacementProfile(studentId, payload);
      setSaveMessage('Profile updated successfully.');
      setTimeout(() => {
        setEditingStudent(null);
        loadCandidates(currentRunId);
      }, 800);
    } catch (err) {
      alert(err.message || 'Failed to update student profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const columns = [
    {
      header: 'Candidate Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-1.5 group">
          <div>
            <div className="font-bold text-genesis-black group-hover:text-amber-700 transition flex items-center gap-1">
              <span>{row.full_name || row.name}</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-400 group-hover:text-amber-700 opacity-0 group-hover:opacity-100 transition" />
            </div>
            <div className="text-[10px] text-genesis-muted">
              {row.department || row.branch} • Batch {row.graduation_year || row.batch_year || '2026'}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'USN',
      accessor: 'usn',
      render: (row) => <span className="font-mono font-bold text-zinc-700">{row.usn}</span>
    },
    {
      header: 'CGPA',
      align: 'center',
      render: (row) => (
        <span className="font-mono font-bold text-zinc-800">
          {row.cgpa ? (typeof row.cgpa === 'number' ? row.cgpa.toFixed(2) : row.cgpa) : '—'}
        </span>
      )
    },
    {
      header: 'Top Career Target',
      accessor: 'target_role',
      render: (row) => (
        <span className="font-medium text-zinc-800 text-xs">
          {row.top_recommended_role || row.target_role || row.primary_role || 'Career Fit Analysis Pending'}
        </span>
      )
    },
    {
      header: 'CareerFit Index',
      align: 'center',
      render: (row) => (
        <ScoreDisplay
          score={row.overall_index || row.careerfit_index || Math.round(200 + ((row.fit_score || row.career_fit_score || 0) / 100) * 600)}
          suffix=""
          scale="800"
          className="text-genesis-black font-extrabold"
        />
      )
    },
    {
      header: 'Career Match',
      align: 'center',
      render: (row) => (
        <ScoreDisplay
          score={row.match_score || row.fit_score || row.career_fit_score}
          suffix="%"
          className="text-amber-700 font-bold"
        />
      )
    },
    {
      header: 'Readiness',
      align: 'center',
      render: (row) => (
        <ScoreDisplay
          score={row.job_readiness_score || row.readiness_score}
          suffix="%"
          className="text-emerald-700 font-bold"
        />
      )
    },
    {
      header: 'Placement Status',
      align: 'center',
      render: (row) => (
        <div className="flex flex-col items-center gap-1">
          <StatusBadge status={row.readiness_tier || row.readiness_status || row.fit_tier} />
          {row.placement_status === 'PLACED' && (
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              PLACED ({row.placed_company || 'Company'})
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => {
        const cleanId = row.usn || row.candidate_id || row.id;
        const isDownloadingDossier = Boolean(downloadingPdf[cleanId]);
        const isDownloadingSumm = Boolean(downloadingSummary[cleanId]);

        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="xs"
              variant="outline"
              icon={Edit}
              onClick={(e) => openEditModal(e, row)}
              title="Edit Profile Fields"
              className="text-[10px] px-2 py-1"
            >
              Edit
            </Button>
            <Button
              size="xs"
              variant="secondary"
              icon={FileText}
              loading={isDownloadingSumm}
              onClick={(e) => handleDownloadSummary(e, row)}
              title="Download 6-Page Placement Summary PDF"
              className="text-[10px] px-2 py-1 bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100"
            >
              Summary
            </Button>
            <Button
              size="xs"
              variant="secondary"
              icon={Download}
              loading={isDownloadingDossier}
              onClick={(e) => handleDownloadPdf(e, row)}
              title="Download 12-Page Master Dossier PDF"
              className="text-[10px] px-2 py-1"
            >
              Dossier
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 fade-in">
      <PageHeader
        category="TALENT INTELLIGENCE"
        title="Candidate Talent Directory"
        subtitle="Institutional candidate roster with multi-attribute filtering, Excel export, profile management, and watermark-certified PDF dossiers."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <RunSelector onRunChange={(newRunId) => loadCandidates(newRunId)} />
            <Button
              variant="outline"
              icon={FileSpreadsheet}
              loading={isExportingExcel}
              onClick={handleExportExcel}
              className="border-emerald-600 text-emerald-800 hover:bg-emerald-50"
            >
              Export Excel
            </Button>
            <Button
              variant="primary"
              icon={FileText}
              onClick={() => navigate('/reports/individual')}
            >
              Reports Hub
            </Button>
          </div>
        }
      />

      {/* Filter Toolbar */}
      <div className="bg-white border border-genesis-border rounded-xl p-4 shadow-card space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-genesis-black">
              Active Roster
            </span>
            <span className="text-xs text-genesis-muted font-medium">
              ({filteredCandidates.length} of {candidates.length} candidates)
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-genesis-muted" />
            <input
              type="text"
              placeholder="Search candidate name, USN, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-genesis-canvas border border-genesis-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-genesis-black placeholder-genesis-muted focus:outline-none focus:border-genesis-gold w-72"
            />
          </div>
        </div>

        {/* Multi-attribute Filter Controls */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 pt-1 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full bg-white border border-genesis-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-genesis-black focus:outline-none focus:border-genesis-gold"
            >
              {departments.map((dept, i) => (
                <option key={i} value={dept}>
                  {dept === 'ALL' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Readiness Tier</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-genesis-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-genesis-black focus:outline-none focus:border-genesis-gold"
            >
              <option value="ALL">All Readiness</option>
              <option value="READY">Placement Ready</option>
              <option value="PROVISIONAL">Provisional</option>
              <option value="DEVELOPMENT">Needs Development</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Placement Status</label>
            <select
              value={placementFilter}
              onChange={(e) => setPlacementFilter(e.target.value)}
              className="w-full bg-white border border-genesis-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-genesis-black focus:outline-none focus:border-genesis-gold"
            >
              <option value="ALL">All Statuses</option>
              <option value="PLACED">Placed</option>
              <option value="NOT_PLACED">Not Placed</option>
              <option value="IN_PROGRESS">In Progress</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Min CGPA</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              placeholder="e.g. 7.5"
              value={minCgpaFilter}
              onChange={(e) => setMinCgpaFilter(e.target.value)}
              className="w-full bg-white border border-genesis-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-genesis-black focus:outline-none focus:border-genesis-gold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Min CareerFit Index</label>
            <input
              type="number"
              step="10"
              min="200"
              max="800"
              placeholder="e.g. 600"
              value={minCareerFitFilter}
              onChange={(e) => setMinCareerFitFilter(e.target.value)}
              className="w-full bg-white border border-genesis-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-genesis-black focus:outline-none focus:border-genesis-gold"
            />
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredCandidates}
        loading={loading}
        emptyMessage="No candidates found matching the selected search and filter criteria."
        onRowClick={(row) => navigate(`/candidates/${row.usn || row.id}`)}
      />

      {/* Profile Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-base font-black text-zinc-900">
                  Edit Candidate Profile • {editingStudent.usn}
                </h3>
                <p className="text-xs text-zinc-500">
                  Update candidate contact, skills, and placement records. Calculated scores remain protected.
                </p>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="w-full border border-zinc-300 rounded-lg p-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Department / Branch</label>
                  <input
                    type="text"
                    required
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    className="w-full border border-zinc-300 rounded-lg p-2 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full border border-zinc-300 rounded-lg p-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full border border-zinc-300 rounded-lg p-2 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Academic CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={profileForm.cgpa}
                    onChange={(e) => setProfileForm({ ...profileForm, cgpa: e.target.value })}
                    className="w-full border border-zinc-300 rounded-lg p-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Graduation Year</label>
                  <input
                    type="text"
                    value={profileForm.graduation_year}
                    onChange={(e) => setProfileForm({ ...profileForm, graduation_year: e.target.value })}
                    className="w-full border border-zinc-300 rounded-lg p-2 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Verified Technical Skills (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Python, React, PostgreSQL, Docker"
                  value={profileForm.skills}
                  onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                  className="w-full border border-zinc-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-zinc-100 pt-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Placement Status</label>
                  <select
                    value={profileForm.placement_status}
                    onChange={(e) => setProfileForm({ ...profileForm, placement_status: e.target.value })}
                    className="w-full border border-zinc-300 rounded-lg p-2 font-bold"
                  >
                    <option value="NOT_PLACED">NOT PLACED</option>
                    <option value="PLACED">PLACED</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="OPTED_OUT">OPTED OUT</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Placed Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Infosys, TCS"
                    value={profileForm.placed_company}
                    onChange={(e) => setProfileForm({ ...profileForm, placed_company: e.target.value })}
                    className="w-full border border-zinc-300 rounded-lg p-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Package (LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 12.5"
                    value={profileForm.package_lpa}
                    onChange={(e) => setProfileForm({ ...profileForm, package_lpa: e.target.value })}
                    className="w-full border border-zinc-300 rounded-lg p-2 font-medium"
                  />
                </div>
              </div>

              {saveMessage && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{saveMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingStudent(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSavingProfile}
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
