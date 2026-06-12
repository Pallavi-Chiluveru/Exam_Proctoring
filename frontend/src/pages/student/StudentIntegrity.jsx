import { Link } from 'react-router-dom';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import { Button, Glass, SectionTitle, StatusPill } from '../../components/ui';
import { api } from '../../services/api';
import { useApiResource } from '../../hooks/useApiResource';

export default function StudentIntegrity() {
  const { data, loading } = useApiResource(async () => {
    const res = await api.get('/student/integrity');
    return res.data.reports;
  }, [], []);

  if (loading) return <div className="animate-pulse text-slate-400">Loading reports...</div>;

  return (
    <div className="space-y-8">
      <SectionTitle eyebrow="Behavioral Analysis" title="Integrity Reports" action={
        <div className="flex items-center gap-2 text-sm text-teal-400 bg-teal-400/10 px-3 py-1.5 rounded-full">
          <ShieldAlert className="w-4 h-4" /> AI Proctoring Active
        </div>
      } />

      <Glass className="overflow-x-auto p-6">
        <table className="w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-white/10 text-slate-400">
              <th className="pb-3 font-medium">Assessment Name</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Risk Score</th>
              <th className="pb-3 font-medium">Integrity Score</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                <td className="py-4 font-medium text-slate-100">{item.assessmentName}</td>
                <td className="py-4">{new Date(item.date).toLocaleDateString()}</td>
                <td className="py-4 text-rose-400">{item.riskScore}%</td>
                <td className="py-4">
                  <span className={item.integrityScore >= 90 ? 'text-teal-400' : 'text-amber-400'}>{item.integrityScore}%</span>
                </td>
                <td className="py-4">
                  <StatusPill tone={item.status === 'Passed' ? 'teal' : item.status === 'Disqualified' ? 'rose' : 'sky'}>
                    {item.status}
                  </StatusPill>
                </td>
                <td className="py-4">
                  <Link to={`/student/integrity/${item._id}`}>
                    <Button variant="ghost" className="h-8 px-3 text-xs">
                      View Details <ArrowRight className="ml-2 w-3 h-3" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">No integrity reports found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Glass>
    </div>
  );
}
