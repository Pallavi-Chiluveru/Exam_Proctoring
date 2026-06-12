import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  getDashboardStats,
  getIntegrityDetails,
  getIntegrityReports,
  getProfile,
  getResultDetails,
  getResults,
  updateProfile,
} from '../controllers/student.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/dashboard', getDashboardStats);
router.get('/results', getResults);
router.get('/results/:sessionId', getResultDetails);
router.get('/integrity', getIntegrityReports);
router.get('/integrity/:sessionId', getIntegrityDetails);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
