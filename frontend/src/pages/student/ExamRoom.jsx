import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle2, Clock, Eye, Maximize2, Mic, MonitorUp, Send, Video } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Glass, Page, StatusPill } from '../../components/ui';
import { api, demo } from '../../services/api';
import { getSocket } from '../../services/socket';
import { useProctoring } from '../../hooks/useProctoring';

export default function ExamRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(demo.exams[0]);
  const [session, setSession] = useState({ _id: 'demo-session', proctor: { suspicionScore: 12 } });
  const [active, setActive] = useState(0);
  const [answers, setAnswers] = useState({});
  const [seconds, setSeconds] = useState(120 * 60);
  const [violations, setViolations] = useState([]);

  const reportViolation = useCallback(
    async (type, metadata) => {
      const item = { _id: crypto.randomUUID(), type, severity: Math.round((metadata?.confidence || 0.75) * 10), message: type.replaceAll('_', ' '), createdAt: new Date().toISOString() };
      setViolations((current) => [item, ...current].slice(0, 8));
      await api.post(`/sessions/${session._id}/violations`, { type, metadata }).catch(() => null);
      toast.error(`Violation detected: ${item.message}`);
    },
    [session._id],
  );

  const { videoRef, signals } = useProctoring(reportViolation);
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
    return () => {
      socket.off('warning:manual');
      socket.off('exam:submitted');
    };
  }, [session._id, navigate]);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const save = window.setTimeout(() => {
      if (!question) return;
      api.patch(`/sessions/${session._id}/answer`, {
        questionId: question._id,
        value: answers[question._id],
        totalQuestions: exam.questions?.length,
        language: question.language,
      }).catch(() => null);
    }, 900);
    return () => window.clearTimeout(save);
  }, [answers, question, session._id, exam.questions?.length]);

  const time = useMemo(() => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const rest = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${rest}`;
  }, [seconds]);

  async function submit(force = false) {
    await api.post(`/sessions/${session._id}/submit`, { force }).catch(() => null);
    toast.success(force ? 'Exam force-submitted by integrity policy' : 'Exam submitted');
    navigate('/student');
  }

  function requestFullscreen() {
    document.documentElement.requestFullscreen?.();
  }

  return (
    <Page className="overflow-hidden">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 px-4 py-3 backdrop-blur-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-teal-200/80">Secure exam mode</p>
            <h1 className="text-lg font-semibold sm:text-xl">{exam.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill tone={signals.suspicionScore > 70 ? 'rose' : 'teal'}><Eye className="mr-1 inline h-3 w-3" /> {signals.suspicionScore}% risk</StatusPill>
            <StatusPill tone="sky"><Clock className="mr-1 inline h-3 w-3" /> {time}</StatusPill>
            <Button variant="ghost" onClick={requestFullscreen}><Maximize2 className="h-4 w-4" /> Fullscreen</Button>
            <Button onClick={() => submit(false)}><Send className="h-4 w-4" /> Submit</Button>
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
              {question?.type === 'coding' ? (
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <Editor height="560px" theme="vs-dark" language={question.language || 'javascript'} value={answers[question._id] || question.starterCode} onChange={(value) => setAnswers({ ...answers, [question._id]: value })} options={{ minimap: { enabled: false }, fontSize: 14, smoothScrolling: true }} />
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
                  <p className="text-xs text-slate-400">Severity {violation.severity}/10</p>
                </div>
              ))}
            </div>
          </Glass>
        </aside>
      </div>
    </Page>
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
