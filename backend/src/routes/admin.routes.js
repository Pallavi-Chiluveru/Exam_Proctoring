import { Router } from 'express';
import { analytics, liveSessions, recentViolations, sendWarning, students } from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));
router.get('/analytics', analytics);
router.get('/live-sessions', liveSessions);
router.get('/students', students);
router.get('/violations', recentViolations);
router.post('/warning', sendWarning);

export default router;
