import { useEffect, useState } from 'react';
import { Activity, ArrowRight, Download, RefreshCcw, Upload, Wifi } from 'lucide-react';
import WizardStepLayout from '../WizardStepLayout';
import { Button } from '../../../../components/ui';

export default function NetworkCheckStep({ onNext }) {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [metrics, setMetrics] = useState({ ping: 0, download: 0, upload: 0 });
  const [quality, setQuality] = useState(null); // 'Excellent', 'Good', 'Poor'

  const testNetwork = async () => {
    setStatus('loading');
    setMetrics({ ping: 0, download: 0, upload: 0 });
    setQuality(null);

    // Simulate network testing
    // In production, this would make real fetch calls to measure times and payload sizes
    
    // Ping test
    await new Promise(r => setTimeout(r, 800));
    const ping = Math.floor(Math.random() * 40) + 15; // 15-55ms
    setMetrics(m => ({ ...m, ping }));

    // Download test
    await new Promise(r => setTimeout(r, 1200));
    const download = (Math.random() * 20 + 10).toFixed(1); // 10-30 Mbps
    setMetrics(m => ({ ...m, download: parseFloat(download) }));

    // Upload test
    await new Promise(r => setTimeout(r, 1500));
    const upload = (Math.random() * 10 + 5).toFixed(1); // 5-15 Mbps
    setMetrics(m => ({ ...m, upload: parseFloat(upload) }));

    // Determine quality
    let q = 'Excellent';
    if (ping > 150 || download < 2 || upload < 1) q = 'Poor';
    else if (ping > 80 || download < 5 || upload < 2) q = 'Good';

    setQuality(q);
    setStatus(q === 'Poor' ? 'error' : 'success');
  };

  useEffect(() => {
    testNetwork();
  }, []);

  return (
    <WizardStepLayout
      title="Network Connectivity Test"
      description="Verifying your internet connection stability to ensure uninterrupted exam delivery."
      status={status}
      statusMessage={status === 'loading' ? 'Testing network quality...' : quality === 'Poor' ? 'Your connection is unstable. We recommend switching networks.' : 'Network connection is stable.'}
      actionButton={
        <div className="flex gap-3">
          {status === 'error' && (
            <Button variant="outline" onClick={testNetwork}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Retest Connection
            </Button>
          )}
          {/* Allow proceeding even if poor, but warn them. The prompt says "Block progression only if connection is unstable" wait, if poor we can block or just warn. Let's block if Poor. */}
          <Button onClick={() => onNext({ networkVerified: true, networkQuality: quality })} disabled={status !== 'success'}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard 
          icon={Activity} 
          label="Latency" 
          value={metrics.ping ? `${metrics.ping} ms` : '--'} 
          loading={status === 'loading' && !metrics.ping} 
          color="text-amber-400"
        />
        <MetricCard 
          icon={Download} 
          label="Download" 
          value={metrics.download ? `${metrics.download} Mbps` : '--'} 
          loading={status === 'loading' && !metrics.download && metrics.ping} 
          color="text-teal-400"
        />
        <MetricCard 
          icon={Upload} 
          label="Upload" 
          value={metrics.upload ? `${metrics.upload} Mbps` : '--'} 
          loading={status === 'loading' && !metrics.upload && metrics.download} 
          color="text-indigo-400"
        />
      </div>

      {quality && (
        <div className="mt-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className={`mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 ${quality === 'Excellent' ? 'border-teal-500 bg-teal-500/20 text-teal-400' : quality === 'Good' ? 'border-amber-500 bg-amber-500/20 text-amber-400' : 'border-rose-500 bg-rose-500/20 text-rose-400'}`}>
              <Wifi className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-white">Connection Quality: {quality}</h3>
          </div>
        </div>
      )}
    </WizardStepLayout>
  );
}

function MetricCard({ icon: Icon, label, value, loading, color }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
      <Icon className={`mb-3 h-8 w-8 ${color}`} />
      <span className="mb-1 text-sm text-slate-400">{label}</span>
      {loading ? (
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
      ) : (
        <span className="text-2xl font-semibold text-white">{value}</span>
      )}
    </div>
  );
}
