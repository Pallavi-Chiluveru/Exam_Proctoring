import { Router } from 'express';
import { leaderboard, runCode } from '../controllers/code.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.post('/run', runCode);
router.get('/leaderboard', leaderboard);

export default router;
