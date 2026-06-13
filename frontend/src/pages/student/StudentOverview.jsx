import { Link } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Award, BookOpen, ShieldCheck, TrendingDown, TrendingUp, Sparkles, Activity, FileText, ArrowRight, BrainCircuit, Target, ShieldAlert } from 'lucide-react';
import { Button, Glass, SectionTitle, StatusPill } from '../../components/ui';
import { api } from '../../services/api';
import { useApiResource } from '../../hooks/useApiResource';
import { useAuth } from '../../context/AuthContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950/90 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
        <p className="font-semibold text-slate-100 mb-1">{data.assessmentName}</p>
        <p className="text-xs text-slate-400 mb-3">{data.date}</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-400">Score</span>
            <span className="font-semibold text-teal-400">{data.score}%</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-400">Integrity</span>
            <span className="font-semibold text-sky-400">{data.integrity}%</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-400">Risk Score</span>
            <span className={data.riskScore > 30 ? "font-semibold text-rose-400" : "font-semibold text-slate-200"}>{data.riskScore}%</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm border-t border-white/10 pt-1.5 mt-1.5">
            <span className="text-slate-400">Time Taken</span>
            <span className="font-semibold text-slate-200">{data.timeTaken} mins</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const TrendIndicator = ({ value, suffix = "%", invertColors = false }) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  let colorClass = isPositive ? "text-emerald-400" : isNeutral ? "text-slate-500" : "text-rose-400";
  if (invertColors) {
    colorClass = isPositive ? "text-rose-400" : isNeutral ? "text-slate-500" : "text-emerald-400";
  }
  
  return (
    <div className={`flex items-center text-xs font-semibold ${colorClass}`}>
      {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : isNeutral ? null : <TrendingDown className="w-3 h-3 mr-1" />}
      {Math.abs(value)}{suffix}
    </div>
  );
};

export default function StudentOverview() {
  const { user } = useAuth();
  
  const fallbackData = {
    stats: { totalExams: 0, averageScore: 0, integrityScore: null, highestScore: 0, lowestScore: 0, currentRank: null, trends: { score: 0, integrity: 0, rank: 0 } },
    recentAssessments: [],
    performanceChart: [],
    subjectPerformance: [],
    aiInsights: { strongestSubject: '-', weakestSubject: '-', averageImprovement: '0%', integrityRating: '-', riskBehaviour: '-' },
    riskHistory: []
  };

  const { data, loading } = useApiResource(async () => {
    const res = await api.get('/student/dashboard');
    return res.data;
  }, fallbackData, []);

  if (loading) return <div className="animate-pulse text-slate-400">Loading intelligence...</div>;

  const stats = data?.stats || fallbackData.stats;
  const recentAssessments = data?.recentAssessments || fallbackData.recentAssessments;
  const chartData = data?.performanceChart || fallbackData.performanceChart;
  const aiInsights = data?.aiInsights || fallbackData.aiInsights;
  const subjectPerformance = data?.subjectPerformance || fallbackData.subjectPerformance;
  const riskHistory = data?.riskHistory || fallbackData.riskHistory;

  return (
    <div className="space-y-8 pb-12">
      <SectionTitle 
        eyebrow={`Candidate ID: ${user?.candidateId || 'PX000'}`} 
        title={`Welcome Back, ${user?.name || 'Student'}`} 
        action={<div className="text-sm font-medium text-slate-400 bg-slate-900/50 px-4 py-2 rounded-full border border-white/5">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>} 
      />

      {/* 6 TOP ANALYTICS CARDS */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Glass className="p-4 relative overflow-hidden group hover:border-teal-500/30 transition-colors">
          <p className="text-xs text-slate-400 font-medium mb-1">Highest Score</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-white">{stats.highestScore}%</p>
            <Activity className="w-4 h-4 text-teal-500/50 mb-1" />
          </div>
        </Glass>
        <Glass className="p-4 relative overflow-hidden group hover:border-teal-500/30 transition-colors">
          <p className="text-xs text-slate-400 font-medium mb-1">Average Score</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-white">{stats.averageScore}%</p>
            <TrendIndicator value={stats.trends?.score || 0} />
          </div>
        </Glass>
        <Glass className="p-4 relative overflow-hidden group hover:border-teal-500/30 transition-colors">
          <p className="text-xs text-slate-400 font-medium mb-1">Lowest Score</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-white">{stats.lowestScore}%</p>
            <TrendingDown className="w-4 h-4 text-rose-500/50 mb-1" />
          </div>
        </Glass>
        <Glass className="p-4 relative overflow-hidden group hover:border-sky-500/30 transition-colors">
          <p className="text-xs text-slate-400 font-medium mb-1">Total Exams</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-white">{stats.totalExams}</p>
            <BookOpen className="w-4 h-4 text-sky-500/50 mb-1" />
          </div>
        </Glass>
        <Glass className="p-4 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <p className="text-xs text-slate-400 font-medium mb-1">Integrity Score</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-white">{stats.integrityScore !== null ? `${stats.integrityScore}%` : 'N/A'}</p>
            {stats.integrityScore !== null && <TrendIndicator value={stats.trends?.integrity || 0} />}
          </div>
        </Glass>
        <Glass className="p-4 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
          <p className="text-xs text-slate-400 font-medium mb-1">Current Rank</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-white">{stats.currentRank !== null ? `#${stats.currentRank}` : 'Unranked'}</p>
            {stats.currentRank !== null && <TrendIndicator value={stats.trends?.rank || 0} suffix=" places" invertColors={true} />}
          </div>
        </Glass>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {/* MAIN CHART */}
        <Glass className="lg:col-span-2 xl:col-span-3 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-400" /> Assessment Performance & Integrity
              </h3>
              <p className="text-sm text-slate-400 mt-1">Dual-metric analysis of your academic performance versus proctored integrity behavior.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>Score</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>Integrity</div>
            </div>
          </div>
          
          <div className="flex-1 min-h-[350px] relative">
            {chartData.length < 2 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-900/50 rounded-full border border-white/5 flex items-center justify-center mb-4">
                  <Target className="w-10 h-10 text-slate-500" />
                </div>
                <h4 className="text-lg font-medium text-slate-300">Not Enough Data</h4>
                <p className="text-slate-500 text-sm mt-2 max-w-sm">Complete more assessments to unlock rich performance analytics and AI-driven insights.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="integrityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis dataKey="assessmentName" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} minTickGap={30} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} tickMargin={10} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff1a', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="integrity" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#integrityGradient)" activeDot={{ r: 6, fill: '#38bdf8', stroke: '#0f172a', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="score" stroke="#2dd4bf" strokeWidth={3} fillOpacity={1} fill="url(#scoreGradient)" activeDot={{ r: 6, fill: '#2dd4bf', stroke: '#0f172a', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Glass>

        {/* AI INSIGHTS PANEL */}
        <Glass className="p-6 relative overflow-hidden bg-gradient-to-br from-slate-900/90 to-indigo-950/40">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <BrainCircuit className="w-32 h-32" />
          </div>
          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 text-indigo-300">
            <Sparkles className="w-5 h-5" /> Proctor Intelligence
          </h3>
          <div className="space-y-5 relative z-10">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Strongest Subject</p>
              <p className="text-lg font-medium text-white mt-1">{aiInsights.strongestSubject}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Weakest Subject</p>
              <p className="text-lg font-medium text-white mt-1">{aiInsights.weakestSubject}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Average Improvement</p>
              <p className="text-lg font-medium text-emerald-400 mt-1">{aiInsights.averageImprovement}</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Integrity Rating</p>
              <p className={`text-lg font-medium mt-1 ${aiInsights.integrityRating === 'Excellent' ? 'text-teal-400' : 'text-amber-400'}`}>{aiInsights.integrityRating}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Risk Behaviour</p>
              <p className={`text-lg font-medium mt-1 ${aiInsights.riskBehaviour === 'Low' ? 'text-emerald-400' : aiInsights.riskBehaviour === 'Moderate' ? 'text-amber-400' : 'text-rose-400'}`}>{aiInsights.riskBehaviour}</p>
            </div>
          </div>
        </Glass>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* SUBJECT PERFORMANCE */}
        <Glass className="p-6">
          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-400" /> Subject Mastery
          </h3>
          <div className="space-y-6">
            {subjectPerformance.length > 0 ? subjectPerformance.map((subject, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-slate-200">{subject.subject}</span>
                  <span className="text-slate-400">{subject.average}% Avg</span>
                </div>
                <div className="h-2 w-full bg-slate-900/50 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${subject.average >= 80 ? 'bg-emerald-400' : subject.average >= 60 ? 'bg-teal-400' : subject.average >= 40 ? 'bg-amber-400' : 'bg-rose-400'}`}
                    style={{ width: `${subject.average}%` }}
                  />
                </div>
              </div>
            )) : (
              <p className="text-slate-500 text-sm text-center py-4">No subject data available yet.</p>
            )}
          </div>
        </Glass>

        {/* RISK HISTORY */}
        <Glass className="p-6 flex flex-col">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> Risk Analytics
          </h3>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="pb-3 font-medium">Assessment</th>
                  <th className="pb-3 font-medium">Violations</th>
                  <th className="pb-3 font-medium text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {riskHistory.slice(0, 5).map((item, idx) => (
                  <tr key={item._id || idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                    <td className="py-3 font-medium text-slate-200">{item.assessmentName}</td>
                    <td className="py-3">
                      {item.violationsCount > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20">
                          {item.violationsCount} Flags
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">Clean</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`font-semibold ${item.riskScore > 30 ? 'text-rose-400' : item.riskScore > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {item.riskScore}%
                      </span>
                    </td>
                  </tr>
                ))}
                {riskHistory.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500">No risk history available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Glass>
      </div>

      {/* RECENT ASSESSMENTS */}
      <Glass className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-400" /> Recent Assessments
          </h3>
          <Link to="/student/results">
            <Button variant="ghost" className="text-xs h-8">View All <ArrowRight className="w-3 h-3 ml-2" /></Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="pb-3 font-medium">Assessment Name</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Score</th>
                <th className="pb-3 font-medium">Integrity Score</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAssessments.map((item, idx) => (
                <tr key={item._id || idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                  <td className="py-4 font-medium text-slate-100">{item.assessmentName}</td>
                  <td className="py-4">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="py-4">{item.score}%</td>
                  <td className="py-4">
                    <span className={item.integrityScore >= 90 ? 'text-teal-400' : 'text-amber-400'}>{item.integrityScore}%</span>
                  </td>
                  <td className="py-4">
                    <StatusPill tone={item.status === 'Passed' ? 'teal' : item.status === 'Disqualified' ? 'rose' : 'sky'}>
                      {item.status}
                    </StatusPill>
                  </td>
                </tr>
              ))}
              {recentAssessments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">No recent assessments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Glass>
    </div>
  );
}
