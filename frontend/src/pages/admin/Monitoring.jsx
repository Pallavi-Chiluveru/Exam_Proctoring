import { useEffect, useState } from 'react';
import { AlertTriangle, Eye, Mic, MonitorUp, Send, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { Glass, Button, SectionTitle, StatusPill } from '../../components/ui';
import { api, demo } from '../../services/api';
import { getSocket } from '../../services/socket';
import { useApiResource } from '../../hooks/useApiResource';

export default function Monitoring() {
  const sessionsResource = useApiResource(async () => {
    const res = await api.get('/admin/live-sessions');
    console.log(`[MONITORING AUDIT] Received ${res.data.sessions.length} sessions from backend.`);
    return res.data.sessions;
  }, demo.sessions, []);
  
  const violationsResource = useApiResource(async () => (await api.get('/admin/violations')).data.violations, demo.violations, []);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    console.log(`[MONITORING AUDIT] Rendered ${sessionsResource.data?.length || 0} candidate cards.`);
  }, [sessionsResource.data]);

  useEffect(() => {
    const socket = getSocket();
    socket.connect();
    socket.on('violation:new', (payload) => {
      violationsResource.setData((items) => [payload.violation, ...items].slice(0, 60));
      toast.error(payload.violation.message);
    });
    socket.on('session:signals', (payload) => {
      sessionsResource.setData((items) => items.map((item) => (item._id === payload.sessionId ? { ...item, proctor: payload.proctor } : item)));
    });
    socket.on('session:started', () => {
      console.log('[MONITORING AUDIT] New session started, refreshing list...');
      sessionsResource.execute(); // Re-fetch to get new student details
    });
    socket.on('session:submitted', (payload) => {
      sessionsResource.setData((items) => items.map((item) => (item._id === payload.sessionId ? { ...item, status: payload.status } : item)));
    });
    socket.on('session:disqualified', (payload) => {
      sessionsResource.setData((items) => items.map((item) => (item._id === payload.sessionId ? { ...item, status: payload.status } : item)));
    });

    return () => {
      socket.off('violation:new');
      socket.off('session:signals');
      socket.off('session:started');
      socket.off('session:submitted');
      socket.off('session:disqualified');
    };
  }, []);

  async function warn(sessionId) {
    await api.post('/admin/warning', { sessionId, message: 'Please remain centered and focused on the exam screen.' }).catch(() => null);
    toast.success('Warning sent to candidate');
  }

  const sessions = sessionsResource.data || [];
  const active = selected || sessions[0];

  const activeViolations = (violationsResource.data || []).filter(v => {
    const vSessionId = typeof v.session === 'object' ? v.session?._id : v.session;
    return vSessionId === active?._id;
  });

  return (
    <div>
      <SectionTitle eyebrow="Live proctoring" title="Monitoring wall" action={<StatusPill tone="sky">WebRTC ready</StatusPill>} />
      <div className="grid gap-4 xl:grid-cols-[1.35fr_.8fr]">
        <Glass className="overflow-hidden">
          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3 max-h-[600px] overflow-y-auto custom-scrollbar">
            {sessions.map((session) => (
              <button key={session._id} onClick={() => setSelected(session)} className={`group overflow-hidden rounded-2xl border bg-white/6 text-left transition hover:border-teal-200/40 ${active?._id === session._id ? 'border-teal-500 ring-2 ring-teal-500/30' : 'border-white/10'}`}>
                <div className="relative aspect-video bg-slate-950">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(45,212,191,.22),transparent_35%),linear-gradient(135deg,#0f172a,#030712)]" />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="grid h-16 w-16 place-items-center rounded-full border border-white/10 bg-white/8 text-xl font-bold">{session.student?.name?.slice(0, 2)}</div>
                  </div>
                  <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/45 px-2 py-1 text-xs">
                    {session.status === 'active' || session.status === 'waiting' ? (
                      <><span className="h-2 w-2 rounded-full bg-emerald-300" /> LIVE</>
                    ) : session.status === 'submitted' ? (
                      <><span className="h-2 w-2 rounded-full bg-blue-300" /> COMPLETED</>
                    ) : session.status === 'disqualified' ? (
                      <><span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> DISQUALIFIED</>
                    ) : (
                      <><span className="h-2 w-2 rounded-full bg-slate-400" /> {session.status?.toUpperCase()}</>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{session.student?.name}</p>
                      <p className="text-xs text-slate-400">{session.exam?.title}</p>
                    </div>
                    <StatusPill tone={(session.finalRiskScore || session.proctor?.riskScore || session.proctor?.suspicionScore || 0) >= 55 ? 'rose' : 'teal'}>{session.finalRiskScore || session.proctor?.riskScore || session.proctor?.suspicionScore || 0}% risk</StatusPill>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{session.student?.candidateId || session.student?.email}</p>
                  <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-teal-300" style={{ width: `${session.progress || 0}%` }} /></div>
                </div>
              </button>
            ))}
          </div>
        </Glass>
        <div className="space-y-4">
          <Glass className="p-5 h-full flex flex-col justify-center">
            <SectionTitle eyebrow="Selected feed" title={active?.student?.name || 'No active sessions'} />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Signal icon={Video} label="Camera" value={active?.proctor?.camera || 'active'} />
              <Signal icon={Mic} label="Audio" value={`${active?.proctor?.audioLevel || 0} dB`} />
              <Signal icon={MonitorUp} label="Screen" value={active?.proctor?.screen || 'shared'} />
              <Signal icon={Eye} label="Gaze" value={active?.proctor?.gaze || 'center'} />
            </div>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/6 p-3 text-sm">
              <p className="text-xs text-slate-400">Candidate ID</p>
              <p className="font-semibold">{active?.student?.candidateId || active?.student?.email || 'Unavailable'}</p>
              <p className="mt-2 text-xs text-slate-400">Final risk score</p>
              <p className="font-semibold">{active?.finalRiskScore || active?.proctor?.riskScore || active?.proctor?.suspicionScore || 0}/100</p>
            </div>
            <Button className="mt-4 w-full" onClick={() => warn(active?._id)}><Send className="h-4 w-4" /> Send warning</Button>
          </Glass>
        </div>
      </div>

      <Glass className="mt-4 flex flex-col border border-white/10 rounded-2xl overflow-hidden bg-slate-900/50">
        <div className="p-5 border-b border-white/10 shrink-0 flex items-center justify-between bg-black/20">
          <SectionTitle eyebrow="Timeline" title="Suspicious Activity Feed" action={null} />
        </div>
        
        <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
          <table className="w-full text-left text-sm table-fixed">
            <thead className="sticky top-0 bg-slate-950/90 backdrop-blur-md border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-slate-500 z-10 shadow-sm">
              <tr>
                <th className="p-4 w-[12%] font-medium">Timestamp</th>
                <th className="p-4 w-[20%] font-medium">Student</th>
                <th className="p-4 w-[15%] font-medium">User ID</th>
                <th className="p-4 w-[20%] font-medium">Assessment</th>
                <th className="p-4 w-[23%] font-medium">Violation Type</th>
                <th className="p-4 w-[10%] font-medium text-center">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activeViolations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                    No suspicious activities detected yet for this student.
                  </td>
                </tr>
              ) : (
                activeViolations.map((violation) => {
                  const sessionData = sessions.find(s => s._id === (typeof violation.session === 'object' ? violation.session?._id : violation.session));
                  const assessmentName = sessionData?.exam?.title || violation.session?.exam?.title || 'Unknown Assessment';
                  
                  const risk = violation.riskAdded || 0;
                  let indicatorColor = 'bg-amber-400';
                  if (risk > 10) indicatorColor = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
                  else if (risk > 5) indicatorColor = 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]';

                  const cleanMessage = (violation.message || '').replace(/\r?\n|\r/g, ' ').trim();

                  return (
                    <tr key={violation._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4 align-middle whitespace-nowrap">
                        <span className="text-xs font-mono text-slate-400">
                          {new Date(violation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </td>
                      <td className="p-4 align-middle truncate">
                        <span className="font-semibold text-slate-200 text-sm">{violation.student?.name || 'Unknown'}</span>
                      </td>
                      <td className="p-4 align-middle truncate">
                        <span className="text-[11px] font-mono text-slate-400">{violation.student?.candidateId || violation.student?.email || 'N/A'}</span>
                      </td>
                      <td className="p-4 align-middle truncate">
                        <span className="text-xs text-slate-300 truncate block" title={assessmentName}>{assessmentName}</span>
                      </td>
                      <td className="p-4 align-middle truncate">
                        <div className="flex items-center gap-2 truncate">
                          <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${risk > 10 ? 'text-rose-400' : risk > 5 ? 'text-orange-400' : 'text-amber-400'}`} />
                          <span className="text-[13px] text-slate-200 truncate" title={cleanMessage}>{cleanMessage}</span>
                        </div>
                        {violation.disqualifying && (
                          <p className="text-[10px] text-rose-400 mt-1 truncate">Disqualified: {violation.disqualificationReason}</p>
                        )}
                      </td>
                      <td className="p-4 align-middle text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${indicatorColor}`}></span>
                          <span className="text-[11px] font-bold text-slate-300">+{risk}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Glass>
    </div>
  );
}

function Signal({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-3">
      <Icon className="mb-3 h-4 w-4 text-teal-200" />
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold capitalize">{value}</p>
    </div>
  );
}
