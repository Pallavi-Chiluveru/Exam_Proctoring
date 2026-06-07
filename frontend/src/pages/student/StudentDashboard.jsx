import { Link } from 'react-router-dom';
import { Clock, Play, ShieldCheck } from 'lucide-react';
import { Button, Glass, SectionTitle, StatusPill } from '../../components/ui';
import { api, demo } from '../../services/api';
import { useApiResource } from '../../hooks/useApiResource';

export default function StudentDashboard() {
  const { data } = useApiResource(async () => (await api.get('/exams')).data.exams, demo.exams, []);
  return (
    <div>
      <SectionTitle eyebrow="Student portal" title="Your secure exam workspace" action={<StatusPill><ShieldCheck className="mr-1 inline h-3 w-3" /> Device trusted</StatusPill>} />
      <div className="grid gap-4 lg:grid-cols-3">
        {(data || []).map((exam) => (
          <Glass key={exam._id} className="overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-teal-300 via-sky-400 to-indigo-400" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-sm text-slate-400">{exam.category}</p><h3 className="mt-2 text-xl font-semibold">{exam.title}</h3></div>
                <StatusPill tone={exam.status === 'live' ? 'teal' : 'sky'}>{exam.status || 'scheduled'}</StatusPill>
              </div>
              <p className="mt-4 min-h-12 text-sm leading-6 text-slate-300">{exam.description}</p>
              <div className="mt-5 flex items-center gap-2 text-sm text-slate-400"><Clock className="h-4 w-4" /> {exam.durationMinutes} minutes · {exam.questions?.length || 0} questions</div>
              <Link to={`/exam/${exam._id}`}><Button className="mt-5 w-full"><Play className="h-4 w-4" /> Start secure exam</Button></Link>
            </div>
          </Glass>
        ))}
      </div>
    </div>
  );
}
