import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, FileText, AlertOctagon, CheckCircle2, ShieldAlert, Clock, Image as ImageIcon, Video, AlertTriangle } from 'lucide-react';
import { Page, SectionTitle, Glass, StatusPill, Button } from '../../components/ui';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminIntegrityReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ report: null, timeline: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/integrity-reports/${id}`);
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load integrity report details');
      navigate('/admin/integrity');
    } finally {
      setLoading(false);
    }
  };

  const formatViolationType = (type) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getStatusBanner = (riskLevel) => {
    if (riskLevel === 'High') return { text: 'High Risk Attempt', color: 'bg-rose-500/10 border-rose-500/30 text-rose-400', icon: AlertOctagon };
    if (riskLevel === 'Medium') return { text: 'Review Required', color: 'bg-amber-500/10 border-amber-500/30 text-amber-400', icon: AlertTriangle };
    return { text: 'Clean Attempt', color: 'bg-teal-500/10 border-teal-500/30 text-teal-400', icon: CheckCircle2 };
  };

  if (loading) {
    return (
      <Page>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" className="px-2" onClick={() => navigate('/admin/integrity')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <SectionTitle eyebrow="Loading..." title="Report Details" className="mb-0" />
        </div>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
        </div>
      </Page>
    );
  }

  const { report, timeline } = data;
  if (!report) return null;

  const StatusIcon = getStatusBanner(report.riskLevel).icon;
  const statusConfig = getStatusBanner(report.riskLevel);

  return (
    <Page>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="px-2" onClick={() => navigate('/admin/integrity')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <SectionTitle eyebrow="Integrity Analysis" title="Assessment Report" className="mb-0" />
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${statusConfig.color} font-medium tracking-wide text-sm uppercase`}>
          <StatusIcon className="h-4 w-4" />
          {statusConfig.text}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Student Info */}
        <Glass className="p-6 col-span-1">
          <div className="flex items-center gap-2 text-slate-400 mb-6 border-b border-white/10 pb-3">
            <User className="h-4 w-4" />
            <h3 className="font-semibold text-sm uppercase tracking-widest">Student Details</h3>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-white/10 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xl text-white">
              {report.student?.avatar ? <img src={report.student.avatar} alt="Avatar" className="w-full h-full object-cover" /> : report.student?.name?.slice(0,2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{report.student?.name}</h2>
              <p className="text-slate-400 text-sm truncate">{report.student?.email}</p>
              <p className="text-slate-500 font-mono text-xs mt-1">{report.student?.candidateId || 'No ID'}</p>
            </div>
          </div>
        </Glass>

        {/* Assessment Info */}
        <Glass className="p-6 col-span-1">
          <div className="flex items-center gap-2 text-slate-400 mb-6 border-b border-white/10 pb-3">
            <FileText className="h-4 w-4" />
            <h3 className="font-semibold text-sm uppercase tracking-widest">Assessment Info</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Assessment Name</p>
              <p className="text-white font-medium">{report.exam?.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Duration</p>
                <p className="text-slate-300">{report.exam?.durationMinutes} Mins</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Attempt Date</p>
                <p className="text-slate-300">{new Date(report.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </Glass>

        {/* Integrity Summary */}
        <Glass className="p-6 col-span-1 bg-gradient-to-br from-white/5 to-transparent border-white/10">
          <div className="flex items-center gap-2 text-slate-400 mb-6 border-b border-white/10 pb-3">
            <ShieldAlert className="h-4 w-4" />
            <h3 className="font-semibold text-sm uppercase tracking-widest">Integrity Metrics</h3>
          </div>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Integrity Score</p>
              <p className="text-5xl font-bold text-white flex items-baseline gap-1">
                {report.integrityScore}<span className="text-2xl text-slate-500">%</span>
              </p>
            </div>
            <div className="pb-1 text-center">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Total Violations</p>
              <StatusPill tone={report.totalViolations > 5 ? 'rose' : report.totalViolations > 0 ? 'amber' : 'teal'}>
                {report.totalViolations} Detected
              </StatusPill>
            </div>
          </div>
        </Glass>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Breakdown & Evidence Column */}
        <div className="lg:col-span-1 space-y-6">
          <Glass className="p-6">
            <h3 className="font-semibold text-sm uppercase tracking-widest text-slate-400 mb-4">Violation Breakdown</h3>
            {Object.keys(report.breakdown || {}).length === 0 ? (
              <div className="py-8 text-center text-slate-500 bg-white/5 rounded-xl border border-white/5">
                <CheckCircle2 className="h-8 w-8 mx-auto text-teal-500/50 mb-2" />
                <p>No violations recorded.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(report.breakdown).sort((a,b) => b[1] - a[1]).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                    <span className="text-slate-300 text-sm">{formatViolationType(type)}</span>
                    <span className="bg-white/10 text-white font-mono text-xs py-1 px-2 rounded">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </Glass>

          {/* Evidence Section */}
          <Glass className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm uppercase tracking-widest text-slate-400">Evidence Library</h3>
              <div className="flex gap-2">
                <ImageIcon className="h-4 w-4 text-slate-500" />
                <Video className="h-4 w-4 text-slate-500" />
              </div>
            </div>
            
            {report.snapshots && report.snapshots.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {report.snapshots.slice(0, 4).map((snap, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-white/10 group cursor-zoom-in">
                    <img src={snap.dataUrl} alt="Evidence" className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-2">
                      <p className="text-[10px] text-white font-mono">{new Date(snap.capturedAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 bg-white/5 rounded-xl border border-white/5 border-dashed">
                <p className="text-sm">No evidence captured.</p>
              </div>
            )}
          </Glass>
        </div>

        {/* Timeline Column */}
        <div className="lg:col-span-2">
          <Glass className="p-6 h-full">
            <div className="flex items-center gap-2 text-slate-400 mb-8 border-b border-white/10 pb-3">
              <Clock className="h-4 w-4" />
              <h3 className="font-semibold text-sm uppercase tracking-widest">Incident Timeline</h3>
            </div>
            
            {timeline.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                <ShieldAlert className="h-12 w-12 text-slate-700 mb-4" />
                <p>No incidents reported during this session.</p>
              </div>
            ) : (
              <div className="relative border-l border-white/10 ml-4 space-y-8 pb-4">
                {timeline.map((event, idx) => (
                  <div key={event._id || idx} className="relative pl-6 group">
                    <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] group-hover:scale-125 transition" />
                    
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 transition group-hover:bg-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-slate-200">{formatViolationType(event.type)}</h4>
                          <StatusPill tone="rose" className="!text-[10px] !py-0.5">-{event.riskAdded}% Risk</StatusPill>
                        </div>
                        <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(event.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{event.message || 'Suspicious activity detected.'}</p>
                      
                      {event.screenshot && (
                        <div className="mt-3 relative w-48 aspect-video rounded-lg overflow-hidden border border-white/20">
                           <img src={event.screenshot} alt="Event Snapshot" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Glass>
        </div>
      </div>
    </Page>
  );
}
