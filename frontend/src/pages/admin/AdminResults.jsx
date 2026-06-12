import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, GraduationCap, CheckCircle2, TrendingUp, Trophy, ShieldAlert, ChevronRight, Filter } from 'lucide-react';
import { Page, SectionTitle, Glass, StatusPill, Button } from '../../components/ui';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminResults() {
  const navigate = useNavigate();
  const [data, setData] = useState({ summary: {}, results: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [examFilter, setExamFilter] = useState('All');

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/results');
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load performance results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Extract unique assessments for the filter dropdown
  const assessments = useMemo(() => {
    const exams = new Map();
    data.results.forEach(r => {
      if (r.exam && r.exam._id) {
        exams.set(r.exam._id, r.exam.title);
      }
    });
    return Array.from(exams.entries());
  }, [data.results]);

  const filteredResults = useMemo(() => {
    return data.results.filter(r => {
      const s = search.toLowerCase();
      const matchesSearch = 
        r.student?.name?.toLowerCase().includes(s) || 
        r.student?.email?.toLowerCase().includes(s) || 
        r.student?.candidateId?.toLowerCase().includes(s) ||
        r.exam?.title?.toLowerCase().includes(s);
      
      const matchesExam = examFilter === 'All' || r.exam?._id === examFilter;

      return matchesSearch && matchesExam;
    });
  }, [data.results, search, examFilter]);

  const { summary } = data;

  return (
    <Page>
      <SectionTitle eyebrow="Performance Analytics" title="Assessment Results" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Glass className="p-5">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <h3 className="font-medium text-xs uppercase tracking-wider">Completed Assessments</h3>
          </div>
          <p className="text-2xl font-semibold text-white">{loading ? '-' : summary.totalAssessments}</p>
        </Glass>
        <Glass className="p-5">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <GraduationCap className="h-4 w-4 text-blue-400" />
            <h3 className="font-medium text-xs uppercase tracking-wider">Students Attempted</h3>
          </div>
          <p className="text-2xl font-semibold text-white">{loading ? '-' : summary.totalStudents}</p>
        </Glass>
        <Glass className="p-5">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            <h3 className="font-medium text-xs uppercase tracking-wider">Average Score</h3>
          </div>
          <p className="text-2xl font-semibold text-white">{loading ? '-' : summary.averageScore}</p>
        </Glass>
        <Glass className="p-5">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            <h3 className="font-medium text-xs uppercase tracking-wider">Highest Score</h3>
          </div>
          <p className="text-2xl font-semibold text-white">{loading ? '-' : summary.highestScore}</p>
        </Glass>
        <Glass className="p-5">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <ShieldAlert className="h-4 w-4 text-teal-400" />
            <h3 className="font-medium text-xs uppercase tracking-wider">Avg Integrity</h3>
          </div>
          <p className="text-2xl font-semibold text-white">{loading ? '-' : `${summary.averageIntegrity}%`}</p>
        </Glass>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by student name, email, ID, or assessment title..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-10 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-teal-500/50 focus:outline-none"
          />
        </div>
        <div className="relative min-w-[250px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select 
            value={examFilter} 
            onChange={e => setExamFilter(e.target.value)}
            className="w-full h-full rounded-xl border border-white/10 bg-slate-900/50 pl-10 pr-8 py-2.5 text-sm text-white focus:border-teal-500/50 focus:outline-none appearance-none"
          >
            <option value="All">All Assessments</option>
            {assessments.map(([id, title]) => (
              <option key={id} value={id}>{title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Table */}
      <Glass className="overflow-hidden pb-32">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm whitespace-nowrap">
            <thead className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-slate-500 bg-black/20">
              <tr>
                <th className="p-5 w-[25%]">Student Name</th>
                <th className="p-5 w-[25%]">Assessment Name</th>
                <th className="p-5 w-[15%] text-center">Marks Obtained</th>
                <th className="p-5 w-[15%] text-center">Status</th>
                <th className="p-5 w-[10%]">Date</th>
                <th className="p-5 w-[10%] text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" /></div>
                  </td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    No results found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredResults.map((result) => {
                  const percentage = result.percentage != null ? result.percentage : (result.score || 0);

                  return (
                    <tr key={result._id} className="border-b border-white/6 hover:bg-white/5 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white overflow-hidden shrink-0 shadow-inner">
                            {result.student?.avatar ? (
                              <img src={result.student.avatar} alt="avatar" className="w-full h-full object-cover"/>
                            ) : (
                              result.student?.name?.substring(0, 2).toUpperCase() || 'NA'
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-200 text-base">{result.student?.name || 'Unknown'}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-slate-500">{result.student?.email || 'N/A'}</p>
                              <span className="text-slate-700 text-xs">•</span>
                              <p className="text-xs text-slate-400 font-mono">{result.student?.candidateId || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 whitespace-normal break-words">
                        <div className="max-w-[250px]" title={result.exam?.title}>
                          <p className="text-slate-300 font-medium leading-snug">{result.exam?.title || 'Deleted Assessment'}</p>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex flex-col items-center">
                          <p className="text-lg font-bold text-white">
                            <span className="text-indigo-400">{result.score || 0}</span>
                            <span className="text-slate-500 text-sm font-normal ml-1">/ {result.exam?.totalMarks || 0}</span>
                          </p>
                          <p className="text-xs font-mono text-slate-500 mt-1">{percentage}%</p>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <StatusPill tone={result.status === 'submitted' ? 'teal' : 'rose'} className="mx-auto block w-max">
                          {result.status}
                        </StatusPill>
                      </td>
                      <td className="p-5">
                        <p className="text-slate-400 text-sm">{new Date(result.updatedAt || result.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="p-5 text-right pr-6">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/results/${result._id}`)} className="text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 border border-transparent hover:border-indigo-500/30 transition-all">
                          View Details <ChevronRight className="ml-1 h-4 w-4" />
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
