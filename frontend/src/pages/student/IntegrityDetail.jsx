import { useParams, Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Clock, EyeOff, MonitorOff, ShieldAlert, Smartphone, VolumeX } from 'lucide-react';
import { Button, Glass, SectionTitle, StatusPill } from '../../components/ui';
import { api } from '../../services/api';
import { useApiResource } from '../../hooks/useApiResource';

const iconMap = {
  tab_switch: MonitorOff,
  audio_anomaly: VolumeX,
  eye_movement: EyeOff,
  phone_detected: Smartphone,
  default: AlertCircle,
};

function formatLabel(type) {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function IntegrityDetail() {
  const { id } = useParams();

  const { data, loading } = useApiResource(async () => {
    const res = await api.get(`/student/integrity/${id}`);
    return res.data;
  }, null, [id]);

  if (loading) return <div className="animate-pulse text-slate-400">Loading details...</div>;
  if (!data) return <div className="text-rose-400">Report not found.</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/student/integrity">
          <Button variant="ghost" className="h-10 w-10 p-0 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <SectionTitle eyebrow="Detailed Proctoring Report" title={data.summary.assessmentName} />
      </div>

      {data.disqualificationReport && (
        <Glass className="p-6 border-rose-500/50 bg-rose-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldAlert className="w-24 h-24 text-rose-500" />
          </div>
          <h3 className="text-xl font-bold text-rose-400 flex items-center gap-2 mb-2">
            <AlertCircle className="w-6 h-6" /> Disqualification Notice
          </h3>
          <p className="text-slate-300 mb-4">{data.disqualificationReport.reason}</p>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-slate-400 block">Final Risk Score</span>
              <span className="font-bold text-rose-400">{data.disqualificationReport.finalRiskScore}%</span>
            </div>
            <div>
              <span className="text-slate-400 block">Timestamp</span>
              <span className="font-semibold">{new Date(data.disqualificationReport.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </Glass>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Glass className="p-6 border-rose-500/20">
          <p className="text-sm text-slate-400">Overall Risk Score</p>
          <p className="mt-2 text-4xl font-bold text-rose-400">{data.summary.riskScore}%</p>
        </Glass>
        <Glass className="p-6 border-teal-500/20">
          <p className="text-sm text-slate-400">Integrity Score</p>
          <p className="mt-2 text-4xl font-bold text-teal-400">{data.summary.integrityScore}%</p>
        </Glass>
        <Glass className="p-6">
          <p className="text-sm text-slate-400 mb-2">Assessment Status</p>
          <StatusPill tone={data.summary.status === 'Passed' ? 'teal' : data.summary.status === 'Disqualified' ? 'rose' : 'sky'}>
            {data.summary.status}
          </StatusPill>
        </Glass>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Glass className="p-6">
          <h3 className="font-semibold text-lg mb-6">Violation Breakdown</h3>
          {Object.keys(data.violationCounts).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(data.violationCounts).map(([type, count]) => {
                const Icon = iconMap[type] || iconMap.default;
                return (
                  <div key={type} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg text-rose-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-slate-300 font-medium">{formatLabel(type)}</span>
                    </div>
                    <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-semibold">{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No violations detected during this assessment.</p>
          )}
        </Glass>

        <Glass className="p-6">
          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" /> Violation Timeline
          </h3>
          {data.timeline && data.timeline.length > 0 ? (
            <div className="relative border-l border-white/10 ml-3 space-y-6">
              {data.timeline.map((event, i) => (
                <div key={i} className="relative pl-6">
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-slate-950" />
                  <div className="text-xs text-slate-400 mb-1">{new Date(event.time).toLocaleTimeString()}</div>
                  <div className="text-sm font-medium text-slate-200">{event.violation}</div>
                  <div className="text-xs font-semibold text-rose-400 mt-1">+{event.riskAdded} Risk</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">Timeline is clear.</p>
          )}
        </Glass>
      </div>
    </div>
  );
}
