import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import examRoutes from './routes/exam.routes.js';
import sessionRoutes from './routes/session.routes.js';
import adminRoutes from './routes/admin.routes.js';
import codeRoutes from './routes/code.routes.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
  app.use(express.json({ limit: '8mb' }));
  app.use(morgan('dev'));
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 700,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'aegis-proctor' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/exams', examRoutes);
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/code', codeRoutes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
