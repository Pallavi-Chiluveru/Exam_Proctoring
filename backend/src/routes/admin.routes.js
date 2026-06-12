import { Router } from 'express';
import { analytics, liveSessions, recentViolations, sendWarning, students, allStudents, integrityReports, integrityReportDetail, getAllResults, getResultDetail, updateAdminProfile, changeAdminPassword, uploadAvatar } from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));
router.get('/analytics', analytics);
router.get('/live-sessions', liveSessions);
router.get('/students', students);
router.get('/all-students', allStudents);
router.get('/violations', recentViolations);
router.get('/integrity-reports', integrityReports);
router.get('/integrity-reports/:id', integrityReportDetail);
router.get('/results', getAllResults);
router.get('/results/:id', getResultDetail);
router.post('/warning', sendWarning);

// Profile & Settings
router.put('/profile', updateAdminProfile);
router.put('/password', changeAdminPassword);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

export default router;
