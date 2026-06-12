import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, GraduationCap, Award, ShieldAlert, Clock, FileText, Calendar } from 'lucide-react';
import { Page, SectionTitle, Glass, Button, StatusPill, Skeleton } from '../../components/ui';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminResultDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/results/${id}`);
      setData(response.data.result);
    } catch (error) {
      toast.error('Failed to load result details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <Page>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="px-2"><ArrowLeft className="h-5 w-5" /></Button>
          <SectionTitle eyebrow="Performance Report" title="Loading..." className="mb-0" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Glass className="h-64"><Skeleton className="h-full w-full" /></Glass>
          <Glass className="h-64"><Skeleton className="h-full w-full" /></Glass>
        </div>
      </Page>
    );
  }

  if (!data) {
    return (
      <Page>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="px-2"><ArrowLeft className="h-5 w-5" /></Button>
          <SectionTitle eyebrow="Performance Report" title="Not Found" className="mb-0" />
        </div>
        <Glass className="p-12 text-center text-slate-400">
          The requested result could not be found.
        </Glass>
      </Page>
    );
  }

  const { student, exam, score, marksObtained, totalMarks, percentage: dataPercentage, integrityScore, status, createdAt, updatedAt } = data;
  const finalMarks = marksObtained != null ? marksObtained : score;
  const maxMarks = totalMarks != null && totalMarks > 0 ? totalMarks : (exam?.totalMarks || 100);
  const percentage = dataPercentage != null ? dataPercentage : (maxMarks > 0 ? Math.round((finalMarks / maxMarks) * 100) : 0);
  const passingMarks = exam?.passingMarks || 0;
  const isPassing = data.result === 'Passed' || percentage >= passingMarks;

  return (
    <Page>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/results')} className="px-2 text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <SectionTitle eyebrow="Performance Report" title={`${student?.name}'s Result`} className="mb-0" />
        </div>
        <div className="flex items-center gap-3">
          <StatusPill tone={status === 'submitted' ? 'teal' : 'rose'} className="uppercase tracking-widest text-xs">
            {status}
          </StatusPill>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Main Score Card */}
        <Glass className="lg:col-span-3 p-8 flex flex-col md:flex-row items-center justify-between border-t-4 border-t-indigo-500 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Award className="h-48 w-48" />
          </div>
          
          <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-sm font-bold tracking-widest text-indigo-400 uppercase mb-2">Final Score</h2>
            <div className="flex items-baseline justify-center md:justify-start gap-2">
              <span className="text-6xl font-black text-white">{finalMarks || 0}</span>
              <span className="text-2xl text-slate-500 font-medium">/ {maxMarks}</span>
            </div>
            <p className="mt-2 text-slate-400 font-medium">
              Achieved <span className="text-white font-bold">{percentage}%</span> • {isPassing ? <span className="text-emerald-400">Passed</span> : <span className="text-rose-400">Failed</span>}
            </p>
          </div>

          <div className="relative z-10 flex gap-8 text-center">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Integrity Score</p>
              <div className="flex items-center justify-center gap-2">
                <ShieldAlert className={`h-5 w-5 ${integrityScore >= 85 ? 'text-emerald-400' : integrityScore >= 65 ? 'text-amber-400' : 'text-rose-400'}`} />
                <span className="text-2xl font-bold text-white">{integrityScore}%</span>
              </div>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Passing Marks</p>
              <div className="flex items-center justify-center gap-2">
                <Award className="h-5 w-5 text-slate-400" />
                <span className="text-2xl font-bold text-white">{passingMarks}</span>
              </div>
            </div>
          </div>
        </Glass>

        {/* Student Information */}
        <Glass className="p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
            <User className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold text-slate-200 uppercase tracking-widest text-sm">Student Profile</h3>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-white/10 border-2 border-white/5 flex items-center justify-center text-xl font-bold overflow-hidden shadow-inner shrink-0">
              {student?.avatar ? (
                <img src={student.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                student?.name?.substring(0, 2).toUpperCase() || 'S'
              )}
            </div>
            <div>
              <p className="font-bold text-lg text-white">{student?.name || 'Unknown'}</p>
              <p className="text-sm text-blue-400 font-mono">{student?.candidateId || 'No ID'}</p>
            </div>
          </div>
          
          <div className="space-y-4 flex-1">
            <div>
              <p className="text-xs text-slate-500 mb-1">Email Address</p>
              <p className="text-sm font-medium text-slate-300">{student?.email || 'N/A'}</p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/5">
            <Button variant="outline" className="w-full" onClick={() => navigate(`/admin/integrity/${id}`)}>
              <ShieldAlert className="mr-2 h-4 w-4" /> View Full Integrity Report
            </Button>
          </div>
        </Glass>

        {/* Assessment Information */}
        <Glass className="p-6 flex flex-col lg:col-span-2">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
            <FileText className="h-5 w-5 text-indigo-400" />
            <h3 className="font-semibold text-slate-200 uppercase tracking-widest text-sm">Assessment Details</h3>
          </div>
          
          <div className="mb-6">
            <h4 className="text-xl font-bold text-white mb-2">{exam?.title || 'Unknown Assessment'}</h4>
            <StatusPill tone="indigo" className="text-xs">
              {exam?.durationMinutes} Minutes Total Duration
            </StatusPill>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 bg-black/20 p-5 rounded-xl border border-white/5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/5 rounded-lg shrink-0">
                <Calendar className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Attempt Started</p>
                <p className="text-sm font-medium text-white">{new Date(createdAt).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/5 rounded-lg shrink-0">
                <Clock className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Final Submission</p>
                <p className="text-sm font-medium text-white">{new Date(updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Glass>
      </div>

      {/* Question-wise Evaluation Details */}
      <Glass className="p-6">
        <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 border-b border-white/10 pb-3">
          <FileText className="w-5 h-5 text-teal-400" /> Question-wise Evaluation Details
        </h3>
        <div className="space-y-6">
          {exam?.questions?.map((q, idx) => {
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
                      <StatusPill tone="sky">{q.type.toUpperCase()}</StatusPill>
                      <StatusPill tone={isCorrect ? 'emerald' : 'rose'}>
                        {marksAwarded} / {q.points || 10} Marks
                      </StatusPill>
                    </div>
                    <p className="text-sm text-white mt-2 font-medium">{q.prompt}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
                  <div className="p-3 bg-white/5 rounded border border-white/5">
                    <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Student's Answer</p>
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
                    <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Expected/Correct Answer</p>
                    {q.type === 'mcq' || q.type === 'msq' ? (
                      <p className="text-emerald-400 font-medium">
                        {(q.correctAnswers || []).join(', ') || q.answer || 'Not specified'}
                      </p>
                    ) : q.type === 'descriptive' ? (
                      <div className="text-slate-300">
                        <p className="mb-2"><span className="text-emerald-400 font-medium">Model Answer:</span> {q.expectedAnswer || 'Not specified'}</p>
                        {q.keywords && q.keywords.length > 0 && (
                          <p><span className="text-teal-400 font-medium">Keywords:</span> {q.keywords.join(', ')}</p>
                        )}
                      </div>
                    ) : q.type === 'coding' ? (
                       <p className="text-emerald-400 font-medium">Evaluate via test cases.</p>
                    ) : null}
                  </div>
                </div>

                {/* Evaluation Metadata block */}
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
                        {evaluation.executionError && (
                           <div className="text-rose-400 font-mono ml-4">Error: {evaluation.executionError}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {(!exam?.questions || exam.questions.length === 0) && (
            <p className="text-slate-400 text-sm">No question details available.</p>
          )}
        </div>
      </Glass>

    </Page>
  );
}
