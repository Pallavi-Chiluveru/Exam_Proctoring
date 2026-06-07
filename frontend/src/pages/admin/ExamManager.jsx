import { useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarPlus, Pencil, Trash2 } from 'lucide-react';
import { Button, Glass, SectionTitle, StatusPill } from '../../components/ui';
import { api, demo } from '../../services/api';
import { useApiResource } from '../../hooks/useApiResource';

export default function ExamManager() {
  const examsResource = useApiResource(async () => (await api.get('/exams')).data.exams, demo.exams, []);
  const [draft, setDraft] = useState({ title: '', category: 'Coding Round', durationMinutes: 90 });

  async function createExam(event) {
    event.preventDefault();
    const payload = {
      ...draft,
      durationMinutes: Number(draft.durationMinutes),
      description: 'New enterprise assessment generated from Aegis console.',
      status: 'scheduled',
      questions: demo.exams[0].questions,
    };
    try {
      const { data } = await api.post('/exams', payload);
      examsResource.setData((items) => [data.exam, ...items]);
      toast.success('Exam created');
    } catch {
      examsResource.setData((items) => [{ ...payload, _id: crypto.randomUUID(), startsAt: new Date().toISOString() }, ...items]);
      toast('Created locally in demo mode');
    }
    setDraft({ title: '', category: 'Coding Round', durationMinutes: 90 });
  }

  return (
    <div>
      <SectionTitle eyebrow="Assessment studio" title="Create and manage exams" />
      <div className="grid gap-4 xl:grid-cols-[.85fr_1.4fr]">
        <Glass className="p-5">
          <form onSubmit={createExam} className="space-y-4">
            <label className="field"><span>Exam title</span><div><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Cloud Systems Final" required /></div></label>
            <label className="field"><span>Category</span><div><input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} /></div></label>
            <label className="field"><span>Duration</span><div><input type="number" value={draft.durationMinutes} onChange={(event) => setDraft({ ...draft, durationMinutes: event.target.value })} /></div></label>
            <Button className="w-full"><CalendarPlus className="h-4 w-4" /> Create exam</Button>
          </form>
        </Glass>
        <Glass className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr><th className="p-4">Exam</th><th>Status</th><th>Duration</th><th>Questions</th><th className="text-right pr-4">Actions</th></tr>
              </thead>
              <tbody>
                {(examsResource.data || []).map((exam) => (
                  <tr key={exam._id} className="border-b border-white/6">
                    <td className="p-4"><p className="font-semibold">{exam.title}</p><p className="text-xs text-slate-400">{exam.category}</p></td>
                    <td><StatusPill tone={exam.status === 'live' ? 'teal' : 'sky'}>{exam.status || 'scheduled'}</StatusPill></td>
                    <td>{exam.durationMinutes} min</td>
                    <td>{exam.questions?.length || 0}</td>
                    <td className="pr-4 text-right">
                      <Button variant="ghost" className="mr-2 h-9 w-9 px-0"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" className="h-9 w-9 px-0"><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Glass>
      </div>
    </div>
  );
}
