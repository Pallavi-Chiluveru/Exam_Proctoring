import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle2, Clock, Eye, Maximize2, Mic, MonitorUp, Send, Video } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Glass, Page, StatusPill } from '../../components/ui';
import { api, demo } from '../../services/api';
import { getSocket } from '../../services/socket';
import { useProctoring } from '../../hooks/useProctoring';
import { ExamLockdownService } from '../../components/exam/ExamLockdownService';

export default function ExamRoom() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Enforce verification completion
  useEffect(() => {
    if (!location.state?.verified) {
      toast.error('You must complete the pre-exam verification first.');
      navigate(`/verification/${id}`, { replace: true });
    }
  }, [location, navigate, id]);
  const [exam, setExam] = useState(demo.exams[0]);
  const [session, setSession] = useState({ _id: 'demo-session', proctor: { suspicionScore: 12 } });
  const [active, setActive] = useState(0);
  const [answers, setAnswers] = useState({});
  const [seconds, setSeconds] = useState(120 * 60);
  const [violations, setViolations] = useState([]);
  const [locked, setLocked] = useState(false);
  const [codeRunResults, setCodeRunResults] = useState({});
  const [runningCode, setRunningCode] = useState(false);

  const reportViolation = useCallback(
    async (type, metadata) => {
      if (!session._id || session._id === 'demo-session' || locked) return;
      const { webcamEvidence, ...details } = metadata || {};
      const item = { _id: crypto.randomUUID(), type, riskAdded: 0, message: type.replaceAll('_', ' '), createdAt: new Date().toISOString() };
      setViolations((current) => [item, ...current].slice(0, 8));
      const response = await api.post(`/sessions/${session._id}/violations`, {
        type,
        metadata: details,
        webcamEvidence,
      }).catch((error) => error.response);
      if (!response?.data) return;
      if (response.data.violation) {
        setViolations((current) => [response.data.violation, ...current.filter((entry) => entry._id !== item._id)].slice(0, 8));
      }
      if (typeof response.data.riskScore === 'number') {
        setSession((current) => ({
          ...current,
          finalRiskScore: response.data.riskScore,
          proctor: { ...(current.proctor || {}), suspicionScore: response.data.riskScore, riskScore: response.data.riskScore },
        }));
      }
      if (response.data.disqualified) {
        setLocked(true);
        toast.error(`Disqualified: ${response.data.disqualificationReason}`);
        navigate('/student', { replace: true });
        return;
      }
      toast.error(`Violation detected: ${response.data.violation?.message || item.message}`);
    },
    [locked, navigate, session._id],
  );

  const monitoringEnabled = Boolean(session._id && session._id !== 'demo-session' && !locked);
  const { videoRef, signals, requestScreenShare } = useProctoring(reportViolation, { enabled: monitoringEnabled });
  const question = exam.questions?.[active];

  useEffect(() => {
    let alive = true;
    api.get(`/exams/${id}`).then(({ data }) => alive && setExam(data.exam)).catch(() => null);
    api.post(`/sessions/start/${id}`, { fingerprint: navigator.userAgent }).then(({ data }) => alive && setSession(data.session)).catch(() => null);
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    const socket = getSocket();
    socket.connect();
    socket.emit('session:join', session._id);
    socket.on('warning:manual', (payload) => toast(payload.message));
    socket.on('exam:submitted', () => navigate('/student'));
    socket.on('exam:disqualified', (payload) => {
      setLocked(true);
      toast.error(`Disqualified: ${payload.disqualificationReason || 'Integrity policy violation'}`);
      navigate('/student', { replace: true });
    });
    return () => {
      socket.off('warning:manual');
      socket.off('exam:submitted');
      socket.off('exam:disqualified');
    };
  }, [session._id, navigate]);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!monitoringEnabled) return undefined;
    const sync = window.setInterval(() => {
      api.patch(`/sessions/${session._id}/signals`, signals).catch(() => null);
    }, 3000);
    
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.clearInterval(sync);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [monitoringEnabled, session._id, signals]);

  useEffect(() => {
    const save = window.setTimeout(() => {
      if (!question || locked) return;
      api.patch(`/sessions/${session._id}/answer`, {
        questionId: question._id,
        value: answers[question._id],
        totalQuestions: exam.questions?.length,
        language: question.language,
      }).catch(() => null);
    }, 900);
    return () => window.clearTimeout(save);
  }, [answers, question, session._id, exam.questions?.length, locked]);

  const time = useMemo(() => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const rest = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${rest}`;
  }, [seconds]);

  async function submit(force = false) {
    if (locked) return;
    await api.post(`/sessions/${session._id}/submit`, { force }).catch(() => null);
    toast.success(force ? 'Exam force-submitted by integrity policy' : 'Exam submitted');
    navigate('/student');
  }

  async function runCode() {
    if (!question || locked) return;
    setRunningCode(true);
    try {
      const response = await api.post('/code/run', {
        language: question.language || 'javascript',
        code: answers[question._id] || question.starterCode || '',
        testCases: question.testCases || []
      });
      setCodeRunResults({ ...codeRunResults, [question._id]: response.data });
      toast.success(response.data.status === 'accepted' ? 'All tests passed!' : 'Some tests failed.');
    } catch (err) {
      toast.error('Failed to run code');
    } finally {
      setRunningCode(false);
    }
  }

  function requestFullscreen() {
    document.documentElement.requestFullscreen?.().catch(() => null);
  }

  return (
    <ExamLockdownService 
      signals={signals} 
      locked={locked} 
      requestScreenShare={requestScreenShare} 
      monitoringEnabled={monitoringEnabled}
    >
      <Page className="overflow-hidden">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 px-4 py-3 backdrop-blur-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-teal-200/80">Secure exam mode</p>
            <h1 className="text-lg font-semibold sm:text-xl">{exam.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill tone={(session.finalRiskScore || signals.riskScore || signals.suspicionScore) >= 70 ? 'rose' : 'teal'}><Eye className="mr-1 inline h-3 w-3" /> {session.finalRiskScore || signals.riskScore || signals.suspicionScore}% risk</StatusPill>
            <StatusPill tone="sky"><Clock className="mr-1 inline h-3 w-3" /> {time}</StatusPill>
            <Button variant="ghost" onClick={requestFullscreen}><Maximize2 className="h-4 w-4" /> Fullscreen</Button>
            <Button onClick={() => submit(false)} disabled={locked}><Send className="h-4 w-4" /> Submit</Button>
          </div>
        </div>
      </header>
      <div className="grid gap-4 p-4 xl:grid-cols-[280px_1fr_320px]">
        <Glass className="p-4">
          <p className="mb-3 text-sm font-semibold text-slate-300">Questions</p>
          <div className="space-y-2">
            {exam.questions?.map((item, index) => (
              <button key={item._id} onClick={() => setActive(index)} className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition ${active === index ? 'border-teal-200/40 bg-teal-200/10 text-white' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/8'}`}>
                <span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-white/10 text-xs">{index + 1}</span>
                {item.title}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/6 p-4 text-sm text-slate-300">
            Autosave is active. Copy, paste, right-click, tab switching, and fullscreen exit are monitored.
          </div>
        </Glass>
        <Glass className="min-h-[72vh] overflow-hidden p-5">
          <AnimatePresence mode="wait">
            <motion.div key={question?._id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div><StatusPill tone="sky">{question?.type}</StatusPill><h2 className="mt-3 text-2xl font-semibold">{question?.title}</h2><p className="mt-3 max-w-3xl text-slate-300">{question?.prompt}</p></div>
              </div>
              {question?.type === 'mcq' ? (
                <div className="grid gap-3">
                  {question.options.map((option) => (
                    <label key={option} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/6 p-4 transition hover:bg-white/10">
                      <input type="radio" name={question._id} checked={answers[question._id] === option} onChange={() => setAnswers({ ...answers, [question._id]: option })} />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              ) : null}
              {question?.type === 'msq' ? (
                <div className="grid gap-3">
                  {question.options.map((option) => {
                    const selected = Array.isArray(answers[question._id]) ? answers[question._id] : [];
                    const isChecked = selected.includes(option);
                    return (
                      <label key={option} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/6 p-4 transition hover:bg-white/10">
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={(e) => {
                            const newSelected = e.target.checked 
                              ? [...selected, option] 
                              : selected.filter(v => v !== option);
                            setAnswers({ ...answers, [question._id]: newSelected });
                          }} 
                          className="w-4 h-4 accent-teal-500 rounded border-white/20 bg-slate-900"
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              ) : null}
              {question?.type === 'coding' ? (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    <Editor height="400px" theme="vs-dark" language={question.language || 'javascript'} value={answers[question._id] || question.starterCode} onChange={(value) => setAnswers({ ...answers, [question._id]: value })} options={{ minimap: { enabled: false }, fontSize: 14, smoothScrolling: true }} />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={runCode} disabled={runningCode || locked} variant="secondary">
                      {runningCode ? 'Running...' : 'Run Code'}
                    </Button>
                  </div>
                  {codeRunResults[question._id] && (
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                      <h3 className="text-sm font-semibold mb-3 flex justify-between items-center">
                        <span>Execution Results</span>
                        <StatusPill tone={codeRunResults[question._id].status === 'accepted' ? 'teal' : 'rose'}>
                          {codeRunResults[question._id].status === 'accepted' ? 'All Passed' : 'Partial/Failed'} ({codeRunResults[question._id].runtimeMs}ms)
                        </StatusPill>
                      </h3>
                      <div className="space-y-3">
                        {codeRunResults[question._id].tests.map((test, i) => (
                          <div key={i} className={`p-3 rounded-lg border ${test.passed ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-rose-500/20 bg-rose-500/10'}`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-sm">{test.name}</span>
                              <span className={`text-xs font-bold ${test.passed ? 'text-emerald-400' : 'text-rose-400'}`}>{test.passed ? 'Passed' : 'Failed'}</span>
                            </div>
                            {!test.hidden && !test.passed && (
                               <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-2">
                                 <div>
                                   <div className="text-slate-500 mb-1">Expected Output:</div>
                                   <div className="bg-black/50 p-2 rounded text-slate-300">{test.expectedOutput || ' '}</div>
                                 </div>
                                 <div>
                                   <div className="text-slate-500 mb-1">Your Output:</div>
                                   <div className="bg-black/50 p-2 rounded text-slate-300">{test.actualOutput || test.errorMsg || ' '}</div>
                                 </div>
                               </div>
                            )}
                            {test.errorOutput && (
                               <div className="mt-2 text-xs font-mono">
                                 <div className="text-slate-500 mb-1">Error:</div>
                                 <div className="bg-black/50 p-2 rounded text-rose-400">{test.errorOutput}</div>
                               </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
              {question?.type === 'descriptive' ? (
                <textarea className="min-h-[420px] w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-slate-100 outline-none ring-0 focus:border-teal-200/40" value={answers[question._id] || ''} onChange={(event) => setAnswers({ ...answers, [question._id]: event.target.value })} placeholder="Write your answer..." />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </Glass>
        <aside className="space-y-4">
          <Glass className="overflow-hidden">
            <div className="relative aspect-video bg-black">
              <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-teal-200/20" />
              <div className="absolute left-3 top-3 rounded-full bg-black/55 px-2 py-1 text-xs"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-300" /> AI scanning</div>
            </div>
            <div className="grid grid-cols-2 gap-2 p-3">
              <Probe icon={Video} label="Cam" value={signals.camera} />
              <Probe icon={Mic} label="Mic" value={signals.microphone} />
              <Probe icon={MonitorUp} label="Screen" value={signals.screen} />
              <Probe icon={Eye} label="Gaze" value={signals.gaze} />
            </div>
          </Glass>
          <Glass className="p-4">
            <p className="mb-3 text-sm font-semibold">Violation timeline</p>
            <div className="space-y-2">
              {violations.length === 0 ? <div className="rounded-2xl border border-white/10 bg-white/6 p-4 text-sm text-slate-400"><CheckCircle2 className="mb-2 h-5 w-5 text-emerald-200" /> No live violations</div> : null}
              {violations.map((violation) => (
                <div key={violation._id} className="rounded-2xl border border-amber-200/20 bg-amber-200/10 p-3 text-sm">
                  <AlertTriangle className="mb-2 h-4 w-4 text-amber-100" />
                  <p className="font-semibold capitalize">{violation.type.replaceAll('_', ' ')}</p>
                  <p className="text-xs text-slate-400">{new Date(violation.createdAt).toLocaleTimeString()} · +{violation.riskAdded || 0} risk</p>
                </div>
              ))}
            </div>
          </Glass>
        </aside>
      </div>
    </Page>
    </ExamLockdownService>
  );
}

function Probe({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/6 p-2">
      <Icon className="h-4 w-4 text-teal-200" />
      <p className="mt-2 text-[11px] text-slate-500">{label}</p>
      <p className="truncate text-xs font-semibold capitalize">{value}</p>
    </div>
  );
}
