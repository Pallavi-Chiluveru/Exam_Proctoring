import { Router } from 'express';
import { createExam, deleteExam, getExam, listExams, updateExam } from '../controllers/exam.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.get('/', listExams);
router.get('/:id', getExam);
router.post('/', requireRole('admin'), createExam);
router.patch('/:id', requireRole('admin'), updateExam);
router.delete('/:id', requireRole('admin'), deleteExam);

export default router;
