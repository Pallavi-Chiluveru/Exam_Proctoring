import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Glass } from '../../../components/ui';

export default function WizardStepLayout({
  title,
  description,
  status, // 'idle', 'loading', 'success', 'error'
  statusMessage,
  children,
  actionButton
}) {
  return (
    <Glass className="flex min-h-[450px] flex-col overflow-hidden">
      <div className="flex-1 p-6 sm:p-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
          {description && <p className="mt-2 text-slate-400">{description}</p>}
        </div>
        
        <div className="mb-8">
          {children}
        </div>

        {status && status !== 'idle' && (
          <div className={`mt-6 flex items-center gap-3 rounded-2xl p-4 border ${status === 'success' ? 'border-teal-500/30 bg-teal-500/10 text-teal-300' : status === 'error' ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-slate-500/30 bg-slate-500/10 text-slate-300'}`}>
            {status === 'success' && <CheckCircle2 className="h-5 w-5" />}
            {status === 'error' && <AlertCircle className="h-5 w-5" />}
            {status === 'loading' && <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />}
            <span className="font-medium">{statusMessage}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end border-t border-white/10 bg-black/20 p-6">
        {actionButton}
      </div>
    </Glass>
  );
}
