import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldAlert, Activity, Users, AlertTriangle, ChevronRight, Filter, Info } from 'lucide-react';
import { Page, SectionTitle, Glass, StatusPill, Button } from '../../components/ui';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminIntegrityReports() {
  const navigate = useNavigate();
  const [data, setData] = useState({ summary: {}, reports: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/integrity-reports');
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load integrity reports');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = useMemo(() => {
    return data.reports.filter(r => {
      const s = search.toLowerCase();
      const matchesSearch = 
        r.student?.name?.toLowerCase().includes(s) || 
        r.student?.email?.toLowerCase().includes(s) || 
        r.student?.candidateId?.toLowerCase().includes(s) ||
        r.exam?.title?.toLowerCase().includes(s);
      
      const matchesRisk = riskFilter === 'All' || r.riskLevel === riskFilter;

      return matchesSearch && matchesRisk;
    });
  }, [data.reports, search, riskFilter]);

  const { summary } = data;

  return (
    <Page>
      <SectionTitle 
        eyebrow="Proctoring Analytics" 
        title={
          <div className="flex items-center gap-2 relative">
            <span>Integrity Reports</span>
            <div className="relative group flex items-center z-50">
              <button className="text-slate-500 hover:text-teal-400 transition-colors p-1 rounded-full hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-teal-500/50">
                <Info className="h-4 w-4" />
              </button>
              
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-64 p-4 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto origin-left transform group-hover:scale-100 scale-95 font-sans">
                {/* Arrow indicator */}
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 border-l border-b border-white/10 rotate-45 rounded-sm"></div>
                
                <h4 className="text-xs font-semibold text-white mb-2 pb-2 border-b border-white/10 flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-teal-400" /> Integrity Score Guide
                </h4>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span> <span className="font-mono text-white">100%</span> <span className="text-slate-500 mx-1">-</span> Clean Attempt</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 shadow-[0_0_8px_rgba(45,212,191,0.5)]"></span> <span className="font-mono text-white">80–99%</span> <span className="text-slate-500 mx-1">-</span> Minor Violations</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></span> <span className="font-mono text-white">60–79%</span> <span className="text-slate-500 mx-1">-</span> Moderate Suspicious Activity</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></span> <span className="font-mono text-white">40–59%</span> <span className="text-slate-500 mx-1">-</span> High-Risk Attempt</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span> <span className="font-mono text-white">Below 40%</span> <span className="text-slate-500 mx-1">-</span> Review Required</li>
                </ul>
                <div className="pt-2 mt-3 border-t border-white/10">
                  <p className="text-[10px] text-slate-500 leading-tight font-normal">
                    Integrity Score is calculated from proctoring events such as tab switches, fullscreen exits, face detection issues, camera interruptions, and other suspicious activities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        } 
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Glass className="p-6">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <h3 className="font-medium text-sm">Total Attempts</h3>
          </div>
          <p className="text-3xl font-semibold text-white">{loading ? '-' : summary.totalAttempts}</p>
        </Glass>
        <Glass className="p-6">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <ShieldAlert className="h-5 w-5 text-teal-400" />
            <h3 className="font-medium text-sm">Avg Integrity Score</h3>
          </div>
          <p className="text-3xl font-semibold text-white">
            {loading ? '-' : summary.totalAttempts > 0 ? `${summary.averageIntegrity}%` : 'N/A'}
          </p>
        </Glass>
        <Glass className="p-6">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            <h3 className="font-medium text-sm">High-Risk Attempts</h3>
          </div>
          <p className="text-3xl font-semibold text-white">{loading ? '-' : summary.highRiskAttempts}</p>
        </Glass>
        <Glass className="p-6">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Users className="h-5 w-5 text-amber-400" />
            <h3 className="font-medium text-sm">Students Flagged</h3>
          </div>
          <p className="text-3xl font-semibold text-white">{loading ? '-' : summary.studentsFlagged}</p>
        </Glass>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by student, email, ID, or assessment..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-10 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-teal-500/50 focus:outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select 
            value={riskFilter} 
            onChange={e => setRiskFilter(e.target.value)}
            className="h-full rounded-xl border border-white/10 bg-slate-900/50 pl-10 pr-8 py-2.5 text-sm text-white focus:border-teal-500/50 focus:outline-none appearance-none"
          >
            <option value="All">All Risk Levels</option>
            <option value="Low">Low Risk (Clean)</option>
            <option value="Medium">Medium Risk (Review)</option>
            <option value="High">High Risk</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <Glass className="overflow-hidden pb-16">
        <div className="w-full">
          <table className="w-full text-left text-sm table-fixed">
            <thead className="border-b border-white/5 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-slate-500 bg-black/20">
              <tr>
                <th className="p-4 sm:p-5 w-[22%] font-medium">Student</th>
                <th className="p-4 sm:p-5 w-[22%] font-medium">Assessment</th>
                <th className="p-4 sm:p-5 w-[14%] font-medium text-center">Score</th>
                <th className="p-4 sm:p-5 w-[10%] font-medium text-center">Risk Level</th>
                <th className="p-4 sm:p-5 w-[10%] font-medium text-center">Violations</th>
                <th className="p-4 sm:p-5 w-[10%] font-medium text-center">Date</th>
                <th className="p-4 sm:p-5 w-[12%] font-medium text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center">
                    <div className="flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" /></div>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-slate-400 text-sm">
                    No integrity reports found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  let scoreColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  if (report.integrityScore >= 90) scoreColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  else if (report.integrityScore >= 70) scoreColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
                  else if (report.integrityScore >= 50) scoreColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                  return (
                    <tr key={report._id} className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors duration-200">
                      <td className="p-4 sm:p-5 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xs font-bold text-slate-300 overflow-hidden shrink-0 ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                            {report.student?.avatar ? (
                              <img src={report.student.avatar} alt="avatar" className="w-full h-full object-cover"/>
                            ) : (
                              report.student?.name?.substring(0, 2).toUpperCase() || 'NA'
                            )}
                          </div>
                          <div className="min-w-0 flex-1 truncate">
                            <p className="font-semibold text-slate-200 text-sm truncate">{report.student?.name || 'Unknown'}</p>
                            <div className="flex items-center gap-2 mt-0.5 truncate">
                              <p className="text-[11px] text-slate-500 truncate hidden sm:block">{report.student?.email || 'N/A'}</p>
                              <span className="text-slate-700 text-[10px] hidden sm:block">•</span>
                              <p className="text-[11px] text-slate-400 font-mono truncate">{report.student?.candidateId || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 align-middle">
                        <div className="truncate" title={report.exam?.title}>
                          <p className="text-slate-300 font-medium text-sm truncate">{report.exam?.title || 'Deleted Assessment'}</p>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 align-middle text-center">
                        <div className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md border font-mono font-medium text-[13px] ${scoreColor}`}>
                          {report.integrityScore}%
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 align-middle text-center">
                        <StatusPill tone={report.riskLevel === 'High' ? 'rose' : report.riskLevel === 'Medium' ? 'amber' : 'emerald'} className="mx-auto flex justify-center w-max text-[11px]">
                          {report.riskLevel}
                        </StatusPill>
                      </td>
                      <td className="p-4 sm:p-5 align-middle text-center">
                        <div className={`inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded text-[11px] font-bold ${
                          report.totalViolations > 5 ? 'bg-rose-500/10 text-rose-400' : 
                          report.totalViolations > 0 ? 'bg-amber-500/10 text-amber-400' : 
                          'bg-slate-800/50 text-slate-400'
                        }`}>
                          {report.totalViolations || 0}
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 align-middle text-center">
                        <p className="text-slate-400 text-xs whitespace-nowrap">{new Date(report.updatedAt || report.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="p-4 sm:p-5 align-middle text-right pr-6">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/integrity/${report._id}`)} className="h-8 px-3 text-xs text-teal-400 hover:bg-teal-500/10 hover:text-teal-300 border border-transparent hover:border-teal-500/20 transition-all opacity-80 group-hover:opacity-100 whitespace-nowrap">
                          View Report
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Glass>
    </Page>
  );
}
