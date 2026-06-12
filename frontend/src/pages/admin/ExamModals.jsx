import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Glass, StatusPill } from '../../components/ui';
import { api } from '../../services/api';

export function ModalOverlay({ isOpen, onClose, title, children, className = 'max-w-2xl' }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl ${className}`}>
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function DeleteAssessmentModal({ isOpen, onClose, onConfirm, examName, isDeleting }) {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title="Delete Assessment" className="max-w-md">
      <div className="text-slate-300">
        <p>Are you absolutely sure you want to permanently delete the assessment <strong>"{examName}"</strong>?</p>
        <p className="mt-2 text-sm text-rose-400">This action cannot be undone. All associated results, integrity logs, and assigned students will also be deleted.</p>
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isDeleting}>Cancel</Button>
          <Button className="bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
}

export function PreviewAssessmentModal({ isOpen, onClose, examId }) {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && examId) {
      setLoading(true);
      api.get(`/exams/${examId}`).then(res => {
        setExam(res.data.exam);
      }).catch(() => toast.error('Failed to load preview')).finally(() => setLoading(false));
    }
  }, [isOpen, examId]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex flex-col bg-slate-950 p-0 sm:p-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900 px-4 py-3 sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="rounded border border-teal-500/30 bg-teal-500/10 px-2 py-1 text-xs text-teal-400 uppercase tracking-widest font-semibold">PREVIEW MODE</div>
            <h2 className="text-sm font-medium text-slate-200">Student Experience Preview</h2>
          </div>
          <button onClick={onClose} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" /> Exit Preview
          </button>
        </div>
        
        {/* Main Content mimicking ExamRoom */}
        <div className="flex-1 overflow-y-auto bg-black sm:rounded-b-2xl p-4 sm:p-8 custom-scrollbar">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
            </div>
          ) : !exam ? (
            <p className="text-center mt-20 text-slate-500">Could not load assessment details.</p>
          ) : (
            <div className="mx-auto max-w-5xl space-y-8 pointer-events-none opacity-90">
              {/* Fake Header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h1 className="text-2xl font-semibold text-white">{exam.title}</h1>
                  <p className="text-slate-400 mt-1">{exam.durationMinutes} Minutes • {exam.totalMarks} Marks</p>
                </div>
                <div className="text-xl font-mono text-teal-400">{exam.durationMinutes}:00</div>
              </div>
              
              {/* Questions List Preview */}
              <div className="space-y-6">
                {exam.questions?.map((q, idx) => (
                  <Glass key={q._id || idx} className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-slate-300">{idx + 1}</span>
                      <h3 className="font-medium text-lg">{q.title || `Question ${idx + 1}`}</h3>
                      <StatusPill tone="slate">{q.type.toUpperCase()}</StatusPill>
                      <span className="ml-auto text-sm text-slate-400">{q.points} marks</span>
                    </div>
                    
                    <p className="text-slate-300 mb-6">{q.prompt}</p>
                    
                    {q.type === 'mcq' || q.type === 'msq' ? (
                      <div className="space-y-3">
                        {q.options?.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                            <div className="h-4 w-4 rounded-full border border-white/20 bg-black" />
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    ) : q.type === 'descriptive' ? (
                      <div className="h-32 w-full rounded-xl border border-white/10 bg-black/50 p-4 text-slate-500">
                        Text editor will appear here...
                      </div>
                    ) : q.type === 'coding' ? (
                      <div className="h-64 w-full rounded-xl border border-white/10 bg-[#1e1e1e] p-4 text-slate-500 font-mono text-sm">
                        {q.starterCode || '// Code editor will appear here...'}
                      </div>
                    ) : null}
                  </Glass>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
}
