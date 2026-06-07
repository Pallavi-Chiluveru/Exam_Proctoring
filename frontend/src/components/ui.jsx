import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Activity, Loader2 } from 'lucide-react';

export function Page({ children, className }) {
  return <main className={clsx('min-h-screen bg-mesh text-slate-100', className)}>{children}</main>;
}

export function Glass({ children, className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={clsx('glass rounded-2xl border border-white/10 shadow-glass', className)}
    >
      {children}
    </motion.div>
  );
}

export function Button({ children, className, variant = 'primary', loading, ...props }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-300 disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-white text-slate-950 shadow-glow hover:bg-teal-100',
        variant === 'ghost' && 'border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10',
        variant === 'danger' && 'bg-rose-500/90 text-white hover:bg-rose-400',
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function MetricCard({ icon: Icon = Activity, label, value, trend, tone = 'teal' }) {
  return (
    <Glass className="relative overflow-hidden p-5">
      <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-${tone}-400/10 blur-2xl`} />
      <div className="flex items-center justify-between">
        <div className="rounded-xl border border-white/10 bg-white/8 p-2.5">
          <Icon className="h-5 w-5 text-teal-200" />
        </div>
        <span className="text-xs font-medium text-emerald-200">{trend}</span>
      </div>
      <div className="mt-6 text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-sm text-slate-400">{label}</div>
    </Glass>
  );
}

export function StatusPill({ children, tone = 'teal' }) {
  const tones = {
    teal: 'border-teal-300/30 bg-teal-300/10 text-teal-100',
    rose: 'border-rose-300/30 bg-rose-300/10 text-rose-100',
    amber: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
    sky: 'border-sky-300/30 bg-sky-300/10 text-sky-100',
  };
  return <span className={clsx('rounded-full border px-2.5 py-1 text-xs font-semibold', tones[tone])}>{children}</span>;
}

export function Skeleton({ className }) {
  return <div className={clsx('animate-pulse rounded-xl bg-white/8', className)} />;
}

export function LoadingScreen() {
  return (
    <Page className="grid place-items-center">
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-white/10 bg-white/8">
          <Loader2 className="h-7 w-7 animate-spin text-teal-200" />
        </div>
        <p className="mt-4 text-sm text-slate-400">Calibrating secure exam workspace...</p>
      </div>
    </Page>
  );
}

export function SectionTitle({ eyebrow, title, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200/80">{eyebrow}</p> : null}
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}
