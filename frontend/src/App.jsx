import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoadingScreen } from './components/ui';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import Monitoring from './pages/admin/Monitoring';
import ExamManager from './pages/admin/ExamManager';
import AssessmentBuilder from './pages/admin/AssessmentBuilder';
import Students from './pages/admin/Students';
import AdminResults from './pages/admin/AdminResults';
import AdminResultDetail from './pages/admin/AdminResultDetail';
import AdminIntegrityReports from './pages/admin/AdminIntegrityReports';
import AdminIntegrityReportDetail from './pages/admin/AdminIntegrityReportDetail';
import AdminSettings from './pages/admin/AdminSettings';
import StudentExams from './pages/student/StudentExams';
import StudentOverview from './pages/student/StudentOverview';
import StudentResults from './pages/student/StudentResults';
import ResultDetail from './pages/student/ResultDetail';
import StudentIntegrity from './pages/student/StudentIntegrity';
import IntegrityDetail from './pages/student/IntegrityDetail';
import StudentProfile from './pages/student/StudentProfile';
import ExamRoom from './pages/student/ExamRoom';
import CodingLab from './pages/student/CodingLab';
import VerificationWizard from './pages/student/wizard/VerificationWizard';

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
  );
}
