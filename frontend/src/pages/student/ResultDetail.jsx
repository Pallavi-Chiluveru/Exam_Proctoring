import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Button, Glass, SectionTitle } from '../../components/ui';
import { api } from '../../services/api';
import { useApiResource } from '../../hooks/useApiResource';

export default function ResultDetail() {
  const { id } = useParams();
  
  const { data, loading } = useApiResource(async () => {
    const res = await api.get(`/student/results/${id}`);
    return res.data;
  }, null, [id]);

  if (loading) return <div className="animate-pulse text-slate-400">Loading report details...</div>;
  if (!data) return <div className="text-rose-400">Result not found.</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/student/results">
            <Button variant="ghost" className="h-10 w-10 p-0 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <SectionTitle eyebrow="Detailed Report" title={data.assessmentName} />
        </div>
        <Button onClick={() => window.print()}>
          <Download className="mr-2 h-4 w-4" /> Download PDF Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Glass className="p-5">
          <p className="text-sm text-slate-400">Attempt Date</p>
          <p className="mt-1 font-semibold">{new Date(data.attemptDate).toLocaleDateString()}</p>
        </Glass>
        <Glass className="p-5">
          <p className="text-sm text-slate-400">Duration</p>
          <p className="mt-1 font-semibold">{data.duration} mins</p>
        </Glass>
        <Glass className="p-5">
          <p className="text-sm text-slate-400">Time Taken</p>
          <p className="mt-1 font-semibold">{data.timeTaken} mins</p>
        </Glass>
        <Glass className="p-5 border-teal-500/30">
          <p className="text-sm text-teal-400">Final Score</p>
          <p className="mt-1 font-bold text-2xl text-teal-100">{data.analysis.finalScore}%</p>
        </Glass>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Glass className="p-6">
          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" /> Question Analysis
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Total Questions</span>
              <span className="font-medium">{data.analysis.totalQuestions}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-emerald-400">Correct Answers</span>
              <span className="font-medium">{data.analysis.correctAnswers}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-rose-400">Wrong Answers</span>
              <span className="font-medium">{data.analysis.wrongAnswers}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-amber-400">Skipped Questions</span>
              <span className="font-medium">{data.analysis.skippedQuestions}</span>
            </div>
            <div className="flex justify-between py-2 text-lg font-semibold mt-4">
              <span>Final Percentage</span>
              <span className="text-teal-400">{data.analysis.percentage}%</span>
            </div>
          </div>
        </Glass>

        <Glass className="p-6">
          <h3 className="font-semibold text-lg mb-6">Subject Performance</h3>
          <div className="space-y-5">
            {data.topics && data.topics.length > 0 ? (
              data.topics.map((topic, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">{topic.name}</span>
                    <span className="font-medium">{topic.score}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-400 to-sky-400 rounded-full" 
                      style={{ width: `${topic.score}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No subject breakdown available for this assessment.</p>
            )}
          </div>
        </Glass>
      </div>
    </div>
  );
}
