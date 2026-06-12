import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, BrainCircuit, Gauge, GraduationCap, PlusCircle, Video, Users, ChevronRight, ShieldAlert, FileText, Clock } from 'lucide-react';
import { Glass, MetricCard, SectionTitle, StatusPill, Skeleton, Button } from '../../components/ui';
import { api } from '../../services/api';
import { useApiResource } from '../../hooks/useApiResource';
import { getSocket } from '../../services/socket';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map(i => (
          <Glass key={i} className="p-5 h-32">
            <Skeleton className="h-full w-full" />
          </Glass>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Glass className="h-96"><Skeleton className="h-full w-full" /></Glass>
        <Glass className="h-96"><Skeleton className="h-full w-full" /></Glass>
        <Glass className="h-96"><Skeleton className="h-full w-full" /></Glass>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center h-full">
      <div className="rounded-full bg-white/5 p-4 mb-4 text-slate-500">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-sm font-medium text-slate-300">{message}</h3>
      {description && <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: analyticsData, loading: analyticsLoading, refetch: refetchAnalytics } = useApiResource(async () => (await api.get('/admin/analytics')).data, null);

  useEffect(() => {
    const socket = getSocket();
    
    function handleUpdate() {
      refetchAnalytics();
    }

    socket.on('session:started', handleUpdate);
    socket.on('session:submitted', handleUpdate);
    socket.on('violation:new', handleUpdate);

    return () => {
      socket.off('session:started', handleUpdate);
      socket.off('session:submitted', handleUpdate);
      socket.off('violation:new', handleUpdate);
    };
  }, [refetchAnalytics]);

  if (analyticsLoading) {
    return (
      <div>
        <SectionTitle eyebrow="Command center" title="AI exam operations dashboard" />
        <DashboardSkeleton />
      </div>
    );
  }

  const metrics = analyticsData?.metrics || { totalExams: 0, activeStudents: 0, suspiciousActivities: 0, liveSessions: 0, averageIntegrityScore: 100 };
  const activeAssessments = analyticsData?.activeAssessments || [];
  const highRiskStudents = analyticsData?.highRiskStudents || [];
  const recentAlerts = analyticsData?.recentAlerts || [];

  const formatViolationType = (type) => type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="space-y-6 pb-12">
      <SectionTitle eyebrow="Command center" title="Operations Dashboard" action={<StatusPill>Live sync enabled</StatusPill>} />
      
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/admin/exams">
          <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Create Exam</Button>
        </Link>
        <Link to="/admin/monitoring">
          <Button variant="outline"><Video className="mr-2 h-4 w-4" /> Monitor Live Exams</Button>
        </Link>
        <Link to="/admin/students">
          <Button variant="outline"><Users className="mr-2 h-4 w-4" /> View Students</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={GraduationCap} label="Total exams" value={metrics.totalExams} trend={metrics.totalExams > 0 ? 'Active' : '-'} />
        <MetricCard icon={Activity} label="Active students" value={metrics.activeStudents} trend={metrics.activeStudents > 0 ? 'Assigned' : '-'} />
        <MetricCard icon={AlertTriangle} label="Suspicious activities" value={metrics.suspiciousActivities} trend={metrics.suspiciousActivities > 0 ? 'Logged' : '-'} />
        <MetricCard icon={BrainCircuit} label="Live sessions" value={metrics.liveSessions} trend={metrics.liveSessions > 0 ? 'Realtime' : '-'} />
        <MetricCard icon={ShieldAlert} label="Average integrity" value={metrics.activeStudents > 0 ? `${metrics.averageIntegrityScore}%` : 'N/A'} trend={metrics.activeStudents > 0 ? 'Avg' : '-'} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Active Assessments Panel */}
        <Glass className="p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <h3 className="font-semibold text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" /> Active Assessments
            </h3>
            <Link to="/admin/exams" className="text-xs text-slate-500 hover:text-white flex items-center transition">View all <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeAssessments.length > 0 ? (
              <div className="space-y-3 pr-2">
                {activeAssessments.map(exam => (
                  <div key={exam._id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/20 hover:bg-white/5 transition">
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="text-sm font-medium text-slate-200 truncate">{exam.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{exam.studentCount} student(s) engaged</p>
                    </div>
                    <StatusPill tone={exam.status === 'live' ? 'teal' : exam.status === 'scheduled' ? 'amber' : 'slate'} className="shrink-0">
                      {exam.status}
                    </StatusPill>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={FileText} message="No assessments" description="Create an exam to get started." />
            )}
          </div>
        </Glass>

        {/* High Risk Students Panel */}
        <Glass className="p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <h3 className="font-semibold text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-400" /> High Risk Students
            </h3>
            <Link to="/admin/integrity" className="text-xs text-slate-500 hover:text-white flex items-center transition">View reports <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {highRiskStudents.length > 0 ? (
              <div className="space-y-3 pr-2">
                {highRiskStudents.map(studentSession => (
                  <Link to={`/admin/integrity/${studentSession._id}`} key={studentSession._id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/20 hover:bg-white/5 transition group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-white/10 grid place-items-center text-white font-bold text-xs shrink-0 overflow-hidden">
                        {studentSession.student?.avatar ? <img src={studentSession.student.avatar} alt="Avatar" className="w-full h-full object-cover"/> : studentSession.student?.name?.substring(0, 2).toUpperCase() || 'S'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate group-hover:text-teal-400 transition">{studentSession.student?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{studentSession.examTitle}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <StatusPill tone="rose" className="mb-1">{studentSession.integrityScore}%</StatusPill>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon={Users} message="No high risk students" description="Integrity scores are looking good." />
            )}
          </div>
        </Glass>

        {/* Recent Alerts Feed */}
        <Glass className="p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <h3 className="font-semibold text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> Recent Alerts Feed
            </h3>
            <Link to="/admin/monitoring" className="text-xs text-slate-500 hover:text-white flex items-center transition">Live monitor <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {recentAlerts.length > 0 ? (
              <div className="relative border-l border-white/10 ml-3 pl-4 space-y-5 pb-2">
                {recentAlerts.map((violation, idx) => (
                  <div key={violation._id || idx} className="relative group">
                    <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border border-slate-900 bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium text-slate-200">{formatViolationType(violation.type)}</p>
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 shrink-0">
                          <Clock className="h-3 w-3" />
                          {new Date(violation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mb-1">{violation.student?.name} • {violation.exam?.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={AlertTriangle} message="No recent alerts" description="Live proctoring feed is quiet." />
            )}
          </div>
        </Glass>
      </div>

    </div>
  );
}
