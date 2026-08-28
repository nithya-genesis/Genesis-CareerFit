// Safe API Base URL: Uses configured VITE_API_BASE_URL, or relative path '' to leverage Vite proxy / same-origin in development
import { formatErrorMessage } from '../utils/errorFormatter';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const getApiBaseUrl = () => API_BASE_URL;

// Tab-scoped Session Storage for complete cross-tab isolation (Admin vs Placement Officer)
const getSessionItem = (key) => sessionStorage.getItem(key) || null;
const setSessionItem = (key, val) => {
  if (val === null || val === undefined) {
    sessionStorage.removeItem(key);
  } else {
    sessionStorage.setItem(key, val);
  }
};
const removeSessionItem = (key) => sessionStorage.removeItem(key);

export const getAuthToken = () => {
  return getSessionItem('token') || getSessionItem('access_token') || null;
};

export const getAuthUser = () => {
  return {
    token: getAuthToken(),
    role: getSessionItem('user_role') || null,
    usn: getSessionItem('user_usn') || null,
    name: getSessionItem('user_name') || null,
    institution_id: getSessionItem('user_institution_id') || null
  };
};

export const isAuthenticated = () => {
  return Boolean(getAuthToken());
};

export const isPlacementAdmin = () => {
  const role = String(getSessionItem('user_role') || '').toUpperCase();
  return role === 'PLATFORM_ADMIN' || role === 'PLACEMENT_ADMIN' || role === 'ADMIN' || role === 'OPERATIONS';
};

export const isPlacementOfficer = () => {
  return String(getSessionItem('user_role') || '').toUpperCase() === 'PLACEMENT_OFFICER';
};

export const isStudent = () => {
  return String(getSessionItem('user_role') || '').toUpperCase() === 'STUDENT';
};

export const getActiveRunId = () => {
  return getSessionItem('active_run_id') || null;
};

export const setActiveRunId = (runId) => {
  if (runId) {
    setSessionItem('active_run_id', runId);
  } else {
    removeSessionItem('active_run_id');
  }
};

export const logout = (redirectUrl = '/login') => {
  removeSessionItem('token');
  removeSessionItem('access_token');
  removeSessionItem('user_role');
  removeSessionItem('user_usn');
  removeSessionItem('user_name');
  removeSessionItem('user_institution_id');
  removeSessionItem('active_run_id');
  
  localStorage.removeItem('token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_usn');
  localStorage.removeItem('user_name');
  localStorage.removeItem('user_institution_id');
  localStorage.removeItem('active_run_id');

  window.location.href = redirectUrl;
};

export const login = async (username, password, role, usn = null) => {
  const payload = {
    username,
    password,
    role: role.toUpperCase(),
    ...(usn ? { usn } : {})
  };

  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = formatErrorMessage(errData, 'Login failed. Please verify your credentials.');
    throw new Error(message);
  }

  const data = await response.json();
  
  setSessionItem('token', data.access_token);
  setSessionItem('access_token', data.access_token);
  setSessionItem('user_role', data.role);
  setSessionItem('user_name', data.name || username);
  if (data.institution_id) {
    setSessionItem('user_institution_id', data.institution_id);
  }
  if (data.usn) {
    setSessionItem('user_usn', data.usn);
  } else {
    removeSessionItem('user_usn');
  }

  return data;
};

export const registerStudent = async (studentData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register/student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentData)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(formatErrorMessage(errData, 'Registration failed. Please verify the information entered.'));
  }
  return await response.json();
};

export const registerOfficer = async (officerData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register/officer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(officerData)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(formatErrorMessage(errData, 'Registration failed. Please verify your institutional details.'));
  }
  return await response.json();
};

export const verifyOtp = async (email, otp) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(formatErrorMessage(errData, 'OTP verification failed.'));
  }
  return await response.json();
};

export const resendOtp = async (email) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(formatErrorMessage(errData, 'Failed to resend verification code.'));
  }
  return await response.json();
};

export const resetPassword = async (email, otp, newPassword) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, new_password: newPassword })
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(formatErrorMessage(errData, 'Password reset failed.'));
  }
  return await response.json();
};

export const request = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    removeSessionItem('token');
    removeSessionItem('access_token');
    removeSessionItem('user_role');
    const path = window.location.pathname;
    if (!path.includes('/login') && !path.includes('/register')) {
      window.location.href = path.startsWith('/admin') ? '/admin/login' : (path.startsWith('/placement') ? '/placement/login' : '/login');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = formatErrorMessage(errorData, `Request failed with status ${response.status}`);
    throw new Error(message);
  }

  return response.json();
};

// ============================================================================
// CANONICAL DOWNLOAD HELPER (Object URL, filename preservation, Auth Header)
// ============================================================================
export const downloadBlob = async (endpoint, defaultFilename = 'download.dat') => {
  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    let errorDetail = `Download failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  const blob = await response.blob();
  let filename = defaultFilename;
  const disposition = response.headers.get('content-disposition');
  if (disposition) {
    const filenameMatch = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\r\n]+)["']?/i);
    if (filenameMatch && filenameMatch[1]) {
      filename = decodeURIComponent(filenameMatch[1].trim());
    }
  }

  try {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (e) {
    console.warn("Browser auto-download trigger notice:", e);
  }
  return blob;
};

// ============================================================================
// REPORT & EXPORT DOWNLOAD HELPERS
// ============================================================================
export const downloadReportPdfBlob = async (candidateId, preferredFilename = null, runId = null) => {
  const activeRun = runId || getActiveRunId();
  const cleanId = String(candidateId).trim();
  const endpoint = activeRun
    ? `/api/runs/${encodeURIComponent(activeRun)}/candidate/${encodeURIComponent(cleanId)}/report`
    : `/api/reports/download/${encodeURIComponent(cleanId)}`;
  const defaultFn = preferredFilename || `Candidate_${cleanId}_CareerFit_Dossier.pdf`;
  return downloadBlob(endpoint, defaultFn);
};

export const downloadPlacementSummaryPdfBlob = async (candidateId, filename = null, runId = null) => {
  const targetRun = runId || getActiveRunId();
  const cleanId = String(candidateId).trim();
  const endpoint = targetRun
    ? `/api/runs/${encodeURIComponent(targetRun)}/candidate/${encodeURIComponent(cleanId)}/summary`
    : `/api/runs/default/candidate/${encodeURIComponent(candidateId)}/summary`;
  const defaultFn = filename || `Candidate_${cleanId}_Placement_Summary.pdf`;
  return downloadBlob(endpoint, defaultFn);
};

export const downloadPlacementExcelBlob = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.runId || getActiveRunId()) params.append('run_id', filters.runId || getActiveRunId());
  if (filters.minCgpa) params.append('min_cgpa', filters.minCgpa);
  if (filters.maxCgpa) params.append('max_cgpa', filters.maxCgpa);
  if (filters.minCf) params.append('min_cf', filters.minCf);
  if (filters.maxCf) params.append('max_cf', filters.maxCf);
  if (filters.minMatch) params.append('min_match', filters.minMatch);
  if (filters.department && filters.department !== 'ALL') params.append('department', filters.department);
  if (filters.placementStatus && filters.placementStatus !== 'ALL') params.append('placement_status', filters.placementStatus);
  if (filters.role && filters.role !== 'ALL') params.append('role', filters.role);
  if (filters.search) params.append('search', filters.search);
  
  const qs = params.toString() ? `?${params.toString()}` : '';
  const endpoint = `/api/placement/export-excel${qs}`;
  return downloadBlob(endpoint, `Genesis_Placement_Report_${Date.now()}.xlsx`);
};

export const downloadStudentReportBlob = async () => {
  return downloadBlob('/api/student/report', `My_Genesis_CareerFit_Dossier.pdf`);
};

export const downloadReportsZipBlob = async (runId = null, filename = null) => {
  const activeRun = runId || getActiveRunId();
  const qs = activeRun ? `?run_id=${encodeURIComponent(activeRun)}` : '';
  const defaultFn = filename || `Genesis_CareerFit_Batch_${activeRun || 'All'}.zip`;
  return downloadBlob(`/api/reports/download-all${qs}`, defaultFn);
};

export const downloadOriginalDatasetBlob = async (institutionId, datasetId, originalFilename = null) => {
  const endpoint = `/api/admin/colleges/${encodeURIComponent(institutionId)}/datasets/${encodeURIComponent(datasetId)}/download`;
  return downloadBlob(endpoint, originalFilename || `Dataset_${datasetId}.csv`);
};

// ============================================================================
// COLLEGE MANAGEMENT API
// ============================================================================
export const getAdminColleges = async (search = null, status = null) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return request(`/api/admin/colleges${qs}`);
};

export const getAdminInstitutions = getAdminColleges;

export const createCollege = async (collegeData) => {
  return request('/api/admin/colleges', {
    method: 'POST',
    body: collegeData
  });
};

export const createInstitution = createCollege;

export const getCollegeCommandCenter = async (institutionId) => {
  return request(`/api/admin/colleges/${encodeURIComponent(institutionId)}/command-center`);
};

export const updateCollege = async (institutionId, updateData) => {
  return request(`/api/admin/colleges/${encodeURIComponent(institutionId)}`, {
    method: 'PUT',
    body: updateData
  });
};


export const getCollegeReports = async (institutionId, runId = null) => {
  const qs = runId ? `?run_id=${encodeURIComponent(runId)}` : '';
  return request(`/api/admin/colleges/${encodeURIComponent(institutionId)}/reports${qs}`);
};

export const getCollegeStudents = async (institutionId) => {
  return request(`/api/admin/colleges/${encodeURIComponent(institutionId)}/students`);
};

export const getCollegeDatasets = async (institutionId) => {
  return request(`/api/admin/colleges/${encodeURIComponent(institutionId)}/datasets`);
};

export const getCollegeDatasetDetails = async (institutionId, datasetId) => {
  return request(`/api/admin/colleges/${encodeURIComponent(institutionId)}/datasets/${encodeURIComponent(datasetId)}`);
};

export const uploadCollegeDataset = async (institutionId, formData) => {
  return request(`/api/admin/colleges/${encodeURIComponent(institutionId)}/datasets/upload`, {
    method: 'POST',
    body: formData
  });
};

export const processSavedDataset = async (institutionId, datasetId) => {
  return request(`/api/admin/colleges/${encodeURIComponent(institutionId)}/datasets/${encodeURIComponent(datasetId)}/process`, {
    method: 'POST'
  });
};

export const publishCollegeDataset = async (institutionId, datasetId) => {
  return request(`/api/admin/colleges/${encodeURIComponent(institutionId)}/datasets/${encodeURIComponent(datasetId)}/publish`, {
    method: 'POST'
  });
};

export const unpublishCollegeDataset = async (institutionId, datasetId) => {
  return request(`/api/admin/colleges/${encodeURIComponent(institutionId)}/datasets/${encodeURIComponent(datasetId)}/unpublish`, {
    method: 'POST'
  });
};

export const deleteCollegeDataset = async (institutionId, datasetId) => {
  return request(`/api/admin/colleges/${encodeURIComponent(institutionId)}/datasets/${encodeURIComponent(datasetId)}`, {
    method: 'DELETE'
  });
};

export const provisionCollegeOfficer = async (institutionId, officerData) => {
  return request(`/api/admin/colleges/${encodeURIComponent(institutionId)}/officers`, {
    method: 'POST',
    body: officerData
  });
};

export const createCollegeOfficer = provisionCollegeOfficer;
export const provisionOfficer = provisionCollegeOfficer;

export const toggleCollegeOfficerStatus = async (institutionId, userId, isActive) => {
  return request(`/api/admin/colleges/${encodeURIComponent(institutionId)}/officers/${encodeURIComponent(userId)}/status`, {
    method: 'PATCH',
    body: { is_active: isActive }
  });
};

export const resetCollegeOfficerPassword = async (institutionId, userId, newPassword) => {
  return request(`/api/admin/colleges/${encodeURIComponent(institutionId)}/officers/${encodeURIComponent(userId)}/reset-password`, {
    method: 'POST',
    body: { new_password: newPassword }
  });
};

// ============================================================================
// DATASET UPLOAD & BATCH PROCESSING (Operations / Admin)
// ============================================================================
export const uploadAndDiscover = async (formData) => {
  return request('/api/upload-and-discover', {
    method: 'POST',
    body: formData
  });
};

export const processBatch = async (formData) => {
  return request('/api/process-batch', {
    method: 'POST',
    body: formData
  });
};

export const publishAssessmentRun = async (runId) => {
  return request(`/api/admin/runs/${encodeURIComponent(runId)}/publish`, {
    method: 'POST'
  });
};

// ============================================================================
// PLACEMENT & STUDENT SERVICES
// ============================================================================
export const getCandidates = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/api/placement/candidates${qs ? `?${qs}` : ''}`);
};

export const getLatestCandidates = async (runId = null) => {
  return getCandidates(runId ? { run_id: runId } : {});
};

export const getCandidateById = async (usn) => {
  return request(`/api/placement/candidates/${encodeURIComponent(usn)}`);
};

export const getStudentPlacementProfile = getCandidateById;

export const updateStudentPlacementProfile = async (studentId, profileData) => {
  return request(`/api/placement/students/${encodeURIComponent(studentId)}/profile`, {
    method: 'POST',
    body: profileData
  });
};

export const getPlacementDashboardStats = async (runId = null) => {
  const qs = runId ? `?run_id=${encodeURIComponent(runId)}` : '';
  return request(`/api/placement/dashboard-stats${qs}`);
};

export const getDashboardStats = getPlacementDashboardStats;

export const getDepartmentIntelligence = async (runId = null) => {
  const qs = runId ? `?run_id=${encodeURIComponent(runId)}` : '';
  return request(`/api/placement/department-intelligence${qs}`);
};

export const getDepartments = getDepartmentIntelligence;

export const getPlacementMatrix = async () => {
  return request('/api/placement/matrix');
};

export const getAssessmentRuns = async () => {
  try {
    const data = await request('/api/assessment-runs');
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.runs)) return data.runs;
    if (data && Array.isArray(data.datasets)) return data.datasets;
    return [];
  } catch (err) {
    console.warn('Failed to fetch assessment runs:', err);
    return [];
  }
};

export const getSkillGapIntelligence = async (runId = null) => {
  const qs = runId ? `?run_id=${encodeURIComponent(runId)}` : '';
  return request(`/api/skill-gaps${qs}`);
};

export const getCareerUniverse = async (category = null, search = null) => {
  const params = new URLSearchParams();
  if (category && category !== 'ALL') params.append('category', category);
  if (search && search.trim()) params.append('search', search.trim());
  const qs = params.toString() ? `?${params.toString()}` : '';
  return request(`/api/careers/universe${qs}`);
};

export const getAiHealth = async () => {
  return request('/api/health');
};

export const getAdminSystemHealth = getAiHealth;

// ============================================================================
// STUDENT ASSESSMENT FLOW
// ============================================================================
export const getAssessmentQuestions = async () => {
  return request('/api/assessment/questions');
};

export const submitStudentAssessment = async (answers) => {
  return request('/api/assessment/submit', {
    method: 'POST',
    body: { answers }
  });
};

export const getStudentAssessmentStatus = async () => {
  return request('/api/assessment/status');
};

export const getStudentProfile = async () => {
  return request('/api/student/profile');
};

// ============================================================================
// CAMPAIGNS & LIFECYCLE
// ============================================================================
export const getCampaigns = async () => {
  return request('/api/campaigns');
};

export const createCampaign = async (campaignData) => {
  return request('/api/campaigns', {
    method: 'POST',
    body: campaignData
  });
};

export const getAdminCampaigns = getCampaigns;

// ============================================================================
// ADMIN USER MANAGEMENT & AUDIT LOGS
// ============================================================================
export const getAdminOverview = async () => {
  return request('/api/admin/overview');
};

export const getAdminUsers = async (role = null, search = null) => {
  let query = '';
  const params = [];
  if (role) params.push(`role=${encodeURIComponent(role)}`);
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (params.length > 0) query = `?${params.join('&')}`;
  return request(`/api/admin/users${query}`);
};

export const createAdminUser = async (userData) => {
  return request('/api/admin/users', {
    method: 'POST',
    body: userData
  });
};

export const updateAdminUserStatus = async (userId, isActive) => {
  return request(`/api/admin/users/${encodeURIComponent(userId)}/status`, {
    method: 'PATCH',
    body: { is_active: isActive }
  });
};

export const updateUserStatus = updateAdminUserStatus;

export const resetAdminUserPassword = async (userId, newPassword) => {
  return request(`/api/admin/users/${encodeURIComponent(userId)}/reset-password`, {
    method: 'POST',
    body: { new_password: newPassword }
  });
};

export const getAdminStudents = async (search = null) => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return request(`/api/admin/students${query}`);
};

export const getAuditLogs = async (limit = 100, action = null) => {
  let query = `?limit=${limit}`;
  if (action) query += `&action=${encodeURIComponent(action)}`;
  return request(`/api/admin/audit-logs${query}`);
};

export const getAdminAuditLogs = getAuditLogs;

export const getDevSystemSummary = async () => {
  return request('/api/dev/summary');
};

export const resetStudentLifecycle = async () => {
  return request('/api/dev/reset-lifecycle', { method: 'POST' });
};
