import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoadingScreen } from './components/ui';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import Monitoring from './pages/admin/Monitoring';
import ExamManager from './pages/admin/ExamManager';
import Students from './pages/admin/Students';
import StudentDashboard from './pages/student/StudentDashboard';
import ExamRoom from './pages/student/ExamRoom';
import CodingLab from './pages/student/CodingLab';

function Protected({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace /> : <Login />} />
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
        <Route path="students" element={<Students />} />
      </Route>
      <Route
        path="/student"
        element={
          <Protected role="student">
            <Layout />
          </Protected>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="code" element={<CodingLab />} />
      </Route>
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
