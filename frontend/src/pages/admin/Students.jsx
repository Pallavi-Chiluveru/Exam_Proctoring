import { ShieldAlert, UserRoundCheck } from 'lucide-react';
import { Glass, SectionTitle, StatusPill } from '../../components/ui';
import { api } from '../../services/api';
import { useApiResource } from '../../hooks/useApiResource';

const fallback = [
  { _id: '1', name: 'Arjun Rao', email: 'student@aegis.ai', department: 'Computer Science', riskScore: 18 },
  { _id: '2', name: 'Maya Chen', email: 'maya@aegis.ai', department: 'Data Science', riskScore: 42 },
  { _id: '3', name: 'Ishan Mehta', email: 'ishan@aegis.ai', department: 'Software Engineering', riskScore: 27 },
];

export default function Students() {
  const { data } = useApiResource(async () => (await api.get('/admin/students')).data.students, fallback, []);
  return (
    <div>
      <SectionTitle eyebrow="Roster intelligence" title="Student management" />
      <Glass className="overflow-hidden">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-slate-500"><tr><th className="p-4">Student</th><th>Department</th><th>Device posture</th><th>Risk</th></tr></thead>
          <tbody>
            {data.map((student) => (
              <tr key={student._id} className="border-b border-white/6">
                <td className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-white/10 font-bold">{student.name.slice(0, 2)}</div><div><p className="font-semibold">{student.name}</p><p className="text-xs text-slate-400">{student.email}</p></div></div></td>
                <td>{student.department}</td>
                <td><div className="flex items-center gap-2 text-emerald-100"><UserRoundCheck className="h-4 w-4" /> Verified</div></td>
                <td><StatusPill tone={student.riskScore > 35 ? 'amber' : 'teal'}><ShieldAlert className="mr-1 inline h-3 w-3" /> {student.riskScore}%</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Glass>
    </div>
  );
}
