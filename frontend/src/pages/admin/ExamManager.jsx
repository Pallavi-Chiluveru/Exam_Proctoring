import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { CalendarPlus, MoreVertical, Edit2, Eye, Copy, Trash2, BarChart2 } from 'lucide-react';
import { Button, Glass, SectionTitle, StatusPill, Skeleton } from '../../components/ui';
import { api, demo } from '../../services/api';
import { useApiResource } from '../../hooks/useApiResource';
import { DeleteAssessmentModal, PreviewAssessmentModal } from './ExamModals';

function ActionMenu({ exam, onDelete, onDuplicate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [modals, setModals] = useState({
    delete: false,
    preview: false
  });

  const [coords, setCoords] = useState({ top: 0, left: 0, openUpward: false });

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const dropdownHeight = 340; 
      const spaceBelow = window.innerHeight - rect.bottom;
      
      const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
      
      setCoords({
        left: rect.right - 224, // 224px (w-56)
        top: openUpward ? rect.top - 8 : rect.bottom + 8,
        openUpward
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(event.target))
      ) {
        setIsOpen(false);
      }
    }
    
    // Close dropdown on scroll/resize so it doesn't float disconnected
    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleScrollOrResize);
    // Use capture phase for scroll to catch any scrollable container
    window.addEventListener('scroll', handleScrollOrResize, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  const handleAction = async (action) => {
    setIsOpen(false);
    
    switch (action) {
      case 'edit':
        navigate(`/admin/exams/builder/${exam._id}`);
        break;
      case 'preview':
        setModals(m => ({ ...m, preview: true }));
        break;
      case 'results':
        navigate(`/admin/results/${exam._id}`);
        break;
      case 'duplicate':
        setProcessing(true);
        await onDuplicate(exam);
        setProcessing(false);
        break;
      case 'delete':
        setModals(m => ({ ...m, delete: true }));
        break;
      default:
        break;
    }
  };

  const executeDelete = async () => {
    setProcessing(true);
    await onDelete(exam._id);
    setProcessing(false);
    setModals(m => ({ ...m, delete: false }));
  };

  const dropdownMenu = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, scale: 0.95, y: coords.openUpward ? 10 : -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: coords.openUpward ? 10 : -10 }}
          transition={{ duration: 0.15 }}
          style={{ 
            position: 'fixed', 
            top: coords.openUpward ? 'auto' : coords.top, 
            bottom: coords.openUpward ? window.innerHeight - coords.top : 'auto', 
            left: coords.left 
          }}
          className="z-[100] w-56 rounded-xl border border-white/10 bg-slate-900 py-1 shadow-2xl ring-1 ring-black ring-opacity-5"
        >
          <button onClick={() => handleAction('edit')} title="Edit this assessment" className="flex w-full items-center px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white">
            <Edit2 className="mr-3 h-4 w-4" /> Edit Assessment
          </button>
          <button onClick={() => handleAction('preview')} title="Preview exactly as students see it" className="flex w-full items-center px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white">
            <Eye className="mr-3 h-4 w-4" /> Preview Assessment
          </button>
          <button onClick={() => handleAction('results')} title="View assessment results and integrity reports" className="flex w-full items-center px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white">
            <BarChart2 className="mr-3 h-4 w-4" /> View Results
          </button>
          
          <div className="my-1 border-t border-white/10" />
          
          <button onClick={() => handleAction('duplicate')} title="Create an exact copy of this assessment" className="flex w-full items-center px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white">
            <Copy className="mr-3 h-4 w-4" /> Duplicate
          </button>
          <button onClick={() => handleAction('delete')} title="Permanently delete this assessment" className="flex w-full items-center px-4 py-2.5 text-sm text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300">
            <Trash2 className="mr-3 h-4 w-4" /> Delete Assessment
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div className="relative inline-block text-left" ref={menuRef}>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} 
          disabled={processing}
          className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition focus:outline-none disabled:opacity-50"
          title="Assessment Actions"
        >
          {processing ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" /> : <MoreVertical className="h-5 w-5" />}
        </button>
        {createPortal(dropdownMenu, document.body)}
      </div>

      <DeleteAssessmentModal 
        isOpen={modals.delete} 
        onClose={() => setModals(m => ({ ...m, delete: false }))} 
        onConfirm={executeDelete} 
        examName={exam.title}
        isDeleting={processing}
      />
      <PreviewAssessmentModal 
        isOpen={modals.preview} 
        onClose={() => setModals(m => ({ ...m, preview: false }))} 
        examId={exam._id} 
      />
    </>
  );
}

export default function ExamManager() {
  const examsResource = useApiResource(async () => (await api.get('/exams')).data.exams, [], [], 'cache:admin:exams');

  const deleteExam = async (id) => {
    try {
      await api.delete(`/exams/${id}`);
      examsResource.setData((items) => items.filter((e) => e._id !== id));
      toast.success('Assessment deleted permanently');
    } catch {
      toast.error('Failed to delete assessment');
    }
  };

  const duplicateExam = async (exam) => {
    try {
      const res = await api.get(`/exams/${exam._id}`);
      const duplicateData = { ...res.data.exam, title: `${res.data.exam.title} (Copy)`, status: 'draft' };
      delete duplicateData._id;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;
      
      await api.post('/exams', duplicateData);
      toast.success('Assessment duplicated successfully');
      examsResource.refetch();
    } catch (error) {
      toast.error('Failed to duplicate assessment');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <SectionTitle eyebrow="Assessment studio" title="Manage Assessments" className="mb-0" />
        <Link to="/admin/exams/builder">
          <Button className="shrink-0">
            <CalendarPlus className="h-4 w-4 mr-2" /> Create Assessment
          </Button>
        </Link>
      </div>
      
      <Glass className="overflow-hidden pb-32">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="p-4">Assessment Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Questions</th>
                <th className="text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {examsResource.loading && (!examsResource.data || examsResource.data.length === 0) ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="border-b border-white/6">
                    <td className="p-4"><Skeleton className="h-10 w-48" /></td>
                    <td><Skeleton className="h-5 w-24" /></td>
                    <td><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td><Skeleton className="h-5 w-16" /></td>
                    <td><Skeleton className="h-5 w-12" /></td>
                    <td className="pr-4 text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></td>
                  </tr>
                ))
              ) : (examsResource.data || []).map((exam) => (
                <tr key={exam._id} className="border-b border-white/6 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-slate-200">{exam.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{exam.assessmentType || 'Mixed'} Assessment</p>
                  </td>
                  <td>{exam.category || 'General'}</td>
                  <td>
                    <StatusPill tone={exam.status === 'live' ? 'teal' : exam.status === 'draft' ? 'slate' : 'sky'}>
                      {exam.status || 'scheduled'}
                    </StatusPill>
                  </td>
                  <td>{exam.durationMinutes} min</td>
                  <td>{exam.questions?.length || exam.totalQuestions || 0}</td>
                  <td className="pr-4 text-right">
                    <ActionMenu exam={exam} onDelete={deleteExam} onDuplicate={duplicateExam} />
                  </td>
                </tr>
              ))}
              {!examsResource.loading && (!examsResource.data || examsResource.data.length === 0) && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No assessments found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Glass>
    </div>
  );
}
