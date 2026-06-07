import { Router } from 'express';
import {
  getSession,
  reportViolation,
  saveAnswer,
  startSession,
  submitSession,
  updateSignals,
} from '../controllers/session.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.post('/start/:examId', startSession);
router.get('/:id', getSession);
router.patch('/:id/answer', saveAnswer);
router.post('/:id/violations', reportViolation);
router.patch('/:id/signals', updateSignals);
router.post('/:id/submit', submitSession);

export default router;
