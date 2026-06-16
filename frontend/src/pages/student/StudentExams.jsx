import { Link } from 'react-router-dom';
import { Clock, Play, ShieldCheck } from 'lucide-react';
import { Button, Glass, SectionTitle, StatusPill } from '../../components/ui';
import { api } from '../../services/api';
import { useApiResource } from '../../hooks/useApiResource';
import ExamsSkeleton from '../../components/ui/ExamsSkeleton';

export default function StudentDashboard() {
  const { data, loading, refetch } = useApiResource(
    async () => (await api.get('/exams')).data.exams,
    [], // fallback empty array
    [],
    'examsCache'
  );

  // Show skeleton while loading
  if (loading) {
    return (
      <div>
        <SectionTitle
          eyebrow="Student portal"
          title="Your secure exam workspace"
          action={<StatusPill><ShieldCheck className="mr-1 inline h-3 w-3" /> Device trusted</StatusPill>}
        />
        <ExamsSkeleton />
      </div>
    );
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Student portal"
        title="Your secure exam workspace"
        action={<StatusPill><ShieldCheck className="mr-1 inline h-3 w-3" /> Device trusted</StatusPill>}
      />
      {(!data || data.length === 0) ? (
        <div className="mt-8 text-center text-slate-400">No published exams available.</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {data.map((exam) => (
            <Glass key={exam._id} className="overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-teal-300 via-sky-400 to-indigo-400" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">{exam.category}</p>
                    <h3 className="mt-2 text-xl font-semibold">{exam.title}</h3>
                  </div>
                  <StatusPill tone={exam.status === 'live' ? 'teal' : 'sky'}>{exam.status || 'scheduled'}</StatusPill>
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm text-slate-400"><Clock className="h-4 w-4" /> {exam.durationMinutes} minutes · {exam.totalQuestions || exam.questions?.length || 0} questions</div>
                <Link to={`/verification/${exam._id}`}><Button className="mt-5 w-full"><Play className="h-4 w-4" /> Start secure exam</Button></Link>
              </div>
            </Glass>
          ))}
        </div>
      )}
    </div>
  );
}
