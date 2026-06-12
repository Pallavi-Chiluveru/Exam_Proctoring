import { Link } from 'react-router-dom';
import { ArrowRight, Download, FileText } from 'lucide-react';
import { Button, Glass, SectionTitle, StatusPill } from '../../components/ui';
import { api } from '../../services/api';
import { useApiResource } from '../../hooks/useApiResource';

export default function StudentResults() {
  const { data, loading } = useApiResource(async () => {
    const res = await api.get('/student/results');
    return res.data.results;
  }, [], []);

  if (loading) return <div className="animate-pulse text-slate-400">Loading results...</div>;

  return (
    <div className="space-y-8">
      <SectionTitle eyebrow="Academic Performance" title="Your Exam Results" />

      <Glass className="overflow-x-auto p-6">
        <table className="w-full text-left text-sm text-slate-300">
          <thead>
            <tr className="border-b border-white/10 text-slate-400">
              <th className="pb-3 font-medium">Assessment Name</th>
              <th className="pb-3 font-medium">Subject</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Score</th>
              <th className="pb-3 font-medium">Percentage</th>
              <th className="pb-3 font-medium">Integrity Score</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                <td className="py-4 font-medium text-slate-100">{item.assessmentName}</td>
                <td className="py-4 text-slate-400">{item.subject}</td>
                <td className="py-4">{new Date(item.date).toLocaleDateString()}</td>
                <td className="py-4">{item.score} pts</td>
                <td className="py-4">{item.percentage}%</td>
                <td className="py-4">
                  <span className={item.integrityScore >= 90 ? 'text-teal-400' : 'text-amber-400'}>{item.integrityScore}%</span>
                </td>
                <td className="py-4">
                  <StatusPill tone={item.status === 'Passed' ? 'teal' : item.status === 'Disqualified' ? 'rose' : 'sky'}>
                    {item.status}
                  </StatusPill>
                </td>
                <td className="py-4">
                  <Link to={`/student/results/${item._id}`}>
                    <Button variant="ghost" className="h-8 px-3 text-xs">
                      View Report <ArrowRight className="ml-2 w-3 h-3" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">No results found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Glass>
    </div>
  );
}
