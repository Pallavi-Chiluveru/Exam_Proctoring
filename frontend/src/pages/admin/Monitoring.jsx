import { useEffect, useState } from 'react';
import { AlertTriangle, Eye, Mic, MonitorUp, Send, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { Glass, Button, SectionTitle, StatusPill } from '../../components/ui';
import { api, demo } from '../../services/api';
import { getSocket } from '../../services/socket';
import { useApiResource } from '../../hooks/useApiResource';

export default function Monitoring() {
  const sessionsResource = useApiResource(async () => (await api.get('/admin/live-sessions')).data.sessions, demo.sessions, []);
  const violationsResource = useApiResource(async () => (await api.get('/admin/violations')).data.violations, demo.violations, []);
  const [selected, setSelected] = useState(null);

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
    return () => {
      socket.off('violation:new');
      socket.off('session:signals');
    };
  }, []);

  async function warn(sessionId) {
    await api.post('/admin/warning', { sessionId, message: 'Please remain centered and focused on the exam screen.' }).catch(() => null);
    toast.success('Warning sent to candidate');
  }

  const sessions = sessionsResource.data || [];
  const active = selected || sessions[0];

  return (
    <div>
      <SectionTitle eyebrow="Live proctoring" title="Monitoring wall" action={<StatusPill tone="sky">WebRTC ready</StatusPill>} />
      <div className="grid gap-4 xl:grid-cols-[1.35fr_.8fr]">
        <Glass className="overflow-hidden">
          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {sessions.map((session) => (
              <button key={session._id} onClick={() => setSelected(session)} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/6 text-left transition hover:border-teal-200/40">
                <div className="relative aspect-video bg-slate-950">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(45,212,191,.22),transparent_35%),linear-gradient(135deg,#0f172a,#030712)]" />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="grid h-16 w-16 place-items-center rounded-full border border-white/10 bg-white/8 text-xl font-bold">{session.student?.name?.slice(0, 2)}</div>
                  </div>
                  <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/45 px-2 py-1 text-xs"><span className="h-2 w-2 rounded-full bg-emerald-300" /> LIVE</div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{session.student?.name}</p>
                      <p className="text-xs text-slate-400">{session.exam?.title}</p>
                    </div>
                    <StatusPill tone={(session.proctor?.suspicionScore || 0) > 55 ? 'rose' : 'teal'}>{session.proctor?.suspicionScore || 0}% risk</StatusPill>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-teal-300" style={{ width: `${session.progress || 0}%` }} /></div>
                </div>
              </button>
            ))}
          </div>
        </Glass>
        <div className="space-y-4">
          <Glass className="p-5">
            <SectionTitle eyebrow="Selected feed" title={active?.student?.name || 'No active sessions'} />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Signal icon={Video} label="Camera" value={active?.proctor?.camera || 'active'} />
              <Signal icon={Mic} label="Audio" value={`${active?.proctor?.audioLevel || 0} dB`} />
              <Signal icon={MonitorUp} label="Screen" value={active?.proctor?.screen || 'shared'} />
              <Signal icon={Eye} label="Gaze" value={active?.proctor?.gaze || 'center'} />
            </div>
            <Button className="mt-4 w-full" onClick={() => warn(active?._id)}><Send className="h-4 w-4" /> Send warning</Button>
          </Glass>
          <Glass className="p-5">
            <SectionTitle eyebrow="Timeline" title="Suspicious activity feed" />
            <div className="space-y-3">
              {(violationsResource.data || []).map((violation) => (
                <div key={violation._id} className="rounded-2xl border border-white/10 bg-white/6 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold"><AlertTriangle className="h-4 w-4 text-amber-200" /> {violation.type?.replaceAll('_', ' ')}</div>
                  <p className="mt-1 text-sm text-slate-300">{violation.message}</p>
                  <p className="mt-2 text-xs text-slate-500">{violation.student?.name} · severity {violation.severity}/10</p>
                </div>
              ))}
            </div>
          </Glass>
        </div>
      </div>
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
