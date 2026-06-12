import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, FileText, StatusPill } from 'lucide-react';
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

      <Glass className="p-6">
        <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 border-b border-white/10 pb-3">
          <FileText className="w-5 h-5 text-teal-400" /> Question-wise Evaluation Details
        </h3>
        <div className="space-y-6">
          {data.questions?.map((q, idx) => {
            const answer = data.answers?.find(a => String(a.questionId) === String(q._id));
            const evaluation = answer?.evaluation || {};
            const isCorrect = evaluation.isCorrect;
            const marksAwarded = evaluation.marks || 0;
            const studentValue = answer?.value;

            return (
              <div key={q._id} className="p-4 rounded-xl border border-white/10 bg-black/20">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-slate-200">Q{idx + 1}.</span>
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-sky-500/20 text-sky-400">
                        {q.type.toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {marksAwarded} / {q.points || 10} Marks
                      </span>
                    </div>
                    <p className="text-sm text-white mt-2 font-medium">{q.prompt}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
                  <div className="p-3 bg-white/5 rounded border border-white/5">
                    <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Your Answer</p>
                    {q.type === 'coding' ? (
                      <pre className="text-xs text-teal-300 font-mono overflow-auto max-h-32">
                        {studentValue || 'No code submitted'}
                      </pre>
                    ) : q.type === 'msq' ? (
                      <p className="text-slate-300 font-medium">
                        {Array.isArray(studentValue) ? studentValue.join(', ') : 'No answer'}
                      </p>
                    ) : (
                      <p className="text-slate-300 font-medium">{studentValue || 'No answer'}</p>
                    )}
                  </div>
                  <div className="p-3 bg-white/5 rounded border border-white/5">
                    <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Correct Answer / Model</p>
                    {q.type === 'mcq' || q.type === 'msq' ? (
                      <p className="text-emerald-400 font-medium">
                        {(q.correctAnswers || []).join(', ') || q.answer || 'Not specified'}
                      </p>
                    ) : q.type === 'descriptive' ? (
                      <div className="text-slate-300">
                        <p className="mb-2"><span className="text-emerald-400 font-medium">Model Answer:</span> {q.expectedAnswer || 'Not specified'}</p>
                      </div>
                    ) : q.type === 'coding' ? (
                       <p className="text-emerald-400 font-medium">Evaluated via automated test cases.</p>
                    ) : null}
                  </div>
                </div>

                {evaluation && (
                  <div className="mt-4 pt-4 border-t border-white/10 text-xs">
                    {q.type === 'descriptive' && (
                      <div className="flex gap-4">
                        <div>
                          <span className="text-slate-500">Matched Keywords: </span>
                          <span className="text-emerald-400 font-medium">{(evaluation.matchedKeywords || []).join(', ') || 'None'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Missing Keywords: </span>
                          <span className="text-rose-400 font-medium">{(evaluation.missingKeywords || []).join(', ') || 'None'}</span>
                        </div>
                      </div>
                    )}
                    {q.type === 'coding' && (
                      <div className="flex gap-4 items-center">
                        <div>
                          <span className="text-slate-500">Passed Cases: </span>
                          <span className="text-emerald-400 font-bold">{evaluation.passedCases || 0} / {evaluation.totalCases || 0}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Runtime: </span>
                          <span className="text-teal-400 font-medium">{evaluation.runtimeMs || 0}ms</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {q.explanation && (
                  <div className="mt-4 p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg text-sm text-teal-100">
                    <span className="font-bold text-teal-400 uppercase text-xs tracking-wider mr-2">Explanation:</span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
          {(!data.questions || data.questions.length === 0) && (
            <p className="text-slate-400 text-sm">No detailed questions available.</p>
          )}
        </div>
      </Glass>
    </div>
  );
}
