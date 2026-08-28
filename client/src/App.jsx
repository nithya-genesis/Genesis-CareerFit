import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import OperationsLogin from './pages/OperationsLogin';
import PlacementLogin from './pages/PlacementLogin';
import StudentLogin from './pages/StudentLogin';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentAssessment from './pages/StudentAssessment';
import CampaignManagement from './pages/CampaignManagement';
import AssessmentUpload from './pages/AssessmentUpload';
import CandidateDirectory from './pages/CandidateDirectory';
import CandidateProfile from './pages/CandidateProfile';
import CandidateComparison from './pages/CandidateComparison';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import CareerExplorer from './pages/CareerExplorer';
import CareerRoadmaps from './pages/CareerRoadmaps';
import DepartmentAnalysis from './pages/DepartmentAnalysis';
import PlacementReadiness from './pages/PlacementReadiness';
import ReportsHub from './pages/ReportsHub';
import DevHub from './pages/DevHub';
import DevVerification from './pages/DevVerification';

// Admin Control Center Pages
import CollegeManagement from './pages/admin/CollegeManagement';
import CollegeCommandCenter from './pages/admin/CollegeCommandCenter';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStudents from './pages/admin/AdminStudents';
import AdminInstitutions from './pages/admin/AdminInstitutions';
import AdminCampaigns from './pages/admin/AdminCampaigns';
import AdminAudit from './pages/admin/AdminAudit';
import AdminSystem from './pages/admin/AdminSystem';

import { isAuthenticated, isStudent, isPlacementOfficer, isPlacementAdmin } from './services/api';

// Route Guard for Platform Admin Pages
function AdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  if (isStudent()) {
    return <Navigate to="/student/dashboard" replace />;
  }
  if (isPlacementOfficer()) {
    return <Navigate to="/placement/dashboard" replace />;
  }
  return children;
}

// Route Guard for Placement Officer Pages
function OfficerRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/placement/login" replace />;
  }
  if (isStudent()) {
    return <Navigate to="/student/dashboard" replace />;
  }
  return children;
}

// Route Guard for Student Pages
function StudentRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/student/login" replace />;
  }
  if (isPlacementAdmin()) {
    return <Navigate to="/admin" replace />;
  }
  if (isPlacementOfficer()) {
    return <Navigate to="/placement/dashboard" replace />;
  }
  return children;
}

// Main App Layout for Authenticated Pages
function AppLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#F7F7F5] text-genesis-black overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#F7F7F5]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public SaaS Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Dedicated Role-Based Login Entry Points */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/operations/login" element={<OperationsLogin />} />
      <Route path="/placement/login" element={<PlacementLogin />} />
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<StudentLogin />} />

      {/* Student Portal Routes */}
      <Route
        path="/student/dashboard"
        element={
          <StudentRoute>
            <AppLayout>
              <StudentDashboard />
            </AppLayout>
          </StudentRoute>
        }
      />
      <Route
        path="/student/assessment"
        element={
          <StudentRoute>
            <AppLayout>
              <StudentAssessment />
            </AppLayout>
          </StudentRoute>
        }
      />

      {/* Placement Officer Institutional Routes */}
      <Route
        path="/dashboard"
        element={
          <OfficerRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </OfficerRoute>
        }
      />
      <Route
        path="/campaigns"
        element={
          <OfficerRoute>
            <AppLayout>
              <CampaignManagement />
            </AppLayout>
          </OfficerRoute>
        }
      />
      <Route
        path="/assessment/upload"
        element={
          <OfficerRoute>
            <AppLayout>
              <AssessmentUpload />
            </AppLayout>
          </OfficerRoute>
        }
      />
      <Route
        path="/candidates"
        element={
          <OfficerRoute>
            <AppLayout>
              <CandidateDirectory />
            </AppLayout>
          </OfficerRoute>
        }
      />
      <Route
        path="/candidates/:id"
        element={
          <OfficerRoute>
            <AppLayout>
              <CandidateProfile />
            </AppLayout>
          </OfficerRoute>
        }
      />
      <Route
        path="/candidates/comparison"
        element={
          <OfficerRoute>
            <AppLayout>
              <CandidateComparison />
            </AppLayout>
          </OfficerRoute>
        }
      />
      <Route
        path="/careers/explorer"
        element={
          <OfficerRoute>
            <AppLayout>
              <CareerExplorer />
            </AppLayout>
          </OfficerRoute>
        }
      />
      <Route
        path="/careers/matching"
        element={
          <OfficerRoute>
            <AppLayout>
              <CareerExplorer />
            </AppLayout>
          </OfficerRoute>
        }
      />
      <Route
        path="/careers/skill-gaps"
        element={
          <OfficerRoute>
            <AppLayout>
              <SkillGapAnalysis />
            </AppLayout>
          </OfficerRoute>
        }
      />
      <Route
        path="/careers/roadmaps"
        element={
          <OfficerRoute>
            <AppLayout>
              <CareerRoadmaps />
            </AppLayout>
          </OfficerRoute>
        }
      />
      <Route
        path="/placement/dashboard"
        element={
          <OfficerRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </OfficerRoute>
        }
      />
      <Route
        path="/placement/departments"
        element={
          <OfficerRoute>
            <AppLayout>
              <DepartmentAnalysis />
            </AppLayout>
          </OfficerRoute>
        }
      />
      <Route
        path="/placement/readiness"
        element={
          <OfficerRoute>
            <AppLayout>
              <PlacementReadiness />
            </AppLayout>
          </OfficerRoute>
        }
      />
      <Route
        path="/reports/individual"
        element={
          <OfficerRoute>
            <AppLayout>
              <ReportsHub />
            </AppLayout>
          </OfficerRoute>
        }
      />
      <Route
        path="/reports/batch"
        element={
          <OfficerRoute>
            <AppLayout>
              <ReportsHub />
            </AppLayout>
          </OfficerRoute>
        }
      />

      {/* Development & Verification Testing Routes */}
      <Route
        path="/dev"
        element={
          <AppLayout>
            <DevHub />
          </AppLayout>
        }
      />
      <Route
        path="/development"
        element={
          <AppLayout>
            <DevHub />
          </AppLayout>
        }
      />
      <Route
        path="/dev/verification"
        element={
          <AppLayout>
            <DevVerification />
          </AppLayout>
        }
      />

      {/* Platform Administration Routes (Strictly AdminRoute) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AppLayout>
              <CollegeManagement />
            </AppLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/colleges"
        element={
          <AdminRoute>
            <AppLayout>
              <CollegeManagement />
            </AppLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/colleges/:institutionId"
        element={
          <AdminRoute>
            <AppLayout>
              <CollegeCommandCenter />
            </AppLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/institutions"
        element={
          <AdminRoute>
            <AppLayout>
              <CollegeManagement />
            </AppLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AppLayout>
              <AdminUsers />
            </AppLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <AdminRoute>
            <AppLayout>
              <AdminStudents />
            </AppLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/audit"
        element={
          <AdminRoute>
            <AppLayout>
              <AdminAudit />
            </AppLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/system"
        element={
          <AdminRoute>
            <AppLayout>
              <AdminSystem />
            </AppLayout>
          </AdminRoute>
        }
      />

      {/* Fallback */}
      <Route
        path="*"
        element={
          !isAuthenticated() ? (
            <Navigate to="/login" replace />
          ) : isPlacementAdmin() ? (
            <Navigate to="/admin" replace />
          ) : isStudent() ? (
            <Navigate to="/student/dashboard" replace />
          ) : (
            <Navigate to="/placement/dashboard" replace />
          )
        }
      />
    </Routes>
  );
}
