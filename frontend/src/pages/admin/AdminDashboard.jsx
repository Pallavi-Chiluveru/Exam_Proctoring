import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from 'recharts';
import { Activity, AlertTriangle, BrainCircuit, Gauge, GraduationCap } from 'lucide-react';
import { Glass, MetricCard, SectionTitle, StatusPill } from '../../components/ui';
import { api, demo } from '../../services/api';
import { useApiResource } from '../../hooks/useApiResource';

export default function AdminDashboard() {
  const { data } = useApiResource(async () => (await api.get('/admin/analytics')).data, demo, []);
  const metrics = data.metrics || demo.metrics;

  return (
    <div>
      <SectionTitle eyebrow="Command center" title="AI exam operations dashboard" action={<StatusPill>Live sync enabled</StatusPill>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={GraduationCap} label="Total exams" value={metrics.totalExams} trend="+18%" />
        <MetricCard icon={Activity} label="Active students" value={metrics.activeStudents} trend="+42 live" />
        <MetricCard icon={AlertTriangle} label="Suspicious activities" value={metrics.suspiciousActivities} trend="-9%" />
        <MetricCard icon={BrainCircuit} label="Live sessions" value={metrics.liveSessions} trend="Realtime" />
        <MetricCard icon={Gauge} label="Average score" value={`${metrics.averageScore}%`} trend="+4.2%" />
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_.9fr]">
        <Glass className="p-5">
          <SectionTitle eyebrow="Performance" title="Score and integrity trend" />
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.performance || demo.performance}>
                <defs>
                  <linearGradient id="score" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.45} /><stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#07111f', border: '1px solid rgba(255,255,255,.12)', borderRadius: 16 }} />
                <Area dataKey="score" stroke="#2dd4bf" fill="url(#score)" strokeWidth={3} />
                <Area dataKey="integrity" stroke="#60a5fa" fill="transparent" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Glass>
        <Glass className="p-5">
          <SectionTitle eyebrow="AI heatmap" title="Hourly cheating risk" />
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.heatmap || demo.heatmap}>
                <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#07111f', border: '1px solid rgba(255,255,255,.12)', borderRadius: 16 }} />
                <Bar dataKey="risk" fill="#38bdf8" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Glass>
      </div>
    </div>
  );
}
