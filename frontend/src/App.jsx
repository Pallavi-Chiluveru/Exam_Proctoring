import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoadingScreen } from './components/ui';
import { Layout } from './components/Layout';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Monitoring = lazy(() => import('./pages/admin/Monitoring'));
const ExamManager = lazy(() => import('./pages/admin/ExamManager'));
const AssessmentBuilder = lazy(() => import('./pages/admin/AssessmentBuilder'));
const Students = lazy(() => import('./pages/admin/Students'));
const AdminResults = lazy(() => import('./pages/admin/AdminResults'));
const AdminResultDetail = lazy(() => import('./pages/admin/AdminResultDetail'));
const AdminIntegrityReports = lazy(() => import('./pages/admin/AdminIntegrityReports'));
const AdminIntegrityReportDetail = lazy(() => import('./pages/admin/AdminIntegrityReportDetail'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const StudentExams = lazy(() => import('./pages/student/StudentExams'));
const StudentOverview = lazy(() => import('./pages/student/StudentOverview'));
const StudentResults = lazy(() => import('./pages/student/StudentResults'));
const ResultDetail = lazy(() => import('./pages/student/ResultDetail'));
const StudentIntegrity = lazy(() => import('./pages/student/StudentIntegrity'));
const IntegrityDetail = lazy(() => import('./pages/student/IntegrityDetail'));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'));
const ExamRoom = lazy(() => import('./pages/student/ExamRoom'));
const CodingLab = lazy(() => import('./pages/student/CodingLab'));
const VerificationWizard = lazy(() => import('./pages/student/wizard/VerificationWizard'));

function Protected({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/student/dashboard'} replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/student/dashboard'} replace /> : <Login />} />
        <Route
          path="/admin"
          element={
            <Protected role="admin">
              <Layout />
            </Protected>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="exams" element={<ExamManager />} />
          <Route path="exams/builder" element={<AssessmentBuilder />} />
          <Route path="exams/builder/:id" element={<AssessmentBuilder />} />
          <Route path="students" element={<Students />} />
          <Route path="results" element={<AdminResults />} />
          <Route path="results/:id" element={<AdminResultDetail />} />
          <Route path="integrity" element={<AdminIntegrityReports />} />
          <Route path="integrity/:id" element={<AdminIntegrityReportDetail />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route
          path="/student"
          element={
            <Protected role="student">
              <Layout />
            </Protected>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentOverview />} />
          <Route path="exams" element={<StudentExams />} />
          <Route path="results" element={<StudentResults />} />
          <Route path="results/:id" element={<ResultDetail />} />
          <Route path="integrity" element={<StudentIntegrity />} />
          <Route path="integrity/:id" element={<IntegrityDetail />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="code" element={<CodingLab />} />
        </Route>
        <Route
          path="/verification/:id"
          element={
            <Protected role="student">
              <VerificationWizard />
            </Protected>
          }
        />
        <Route
          path="/exam/:id"
          element={
            <Protected role="student">
              <ExamRoom />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to={user?.role === 'admin' ? '/admin' : user ? '/student' : '/login'} replace />} />
      </Routes>
    </Suspense>
  );
}
