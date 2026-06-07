import { nanoid } from 'nanoid';
import { Exam } from '../models/Exam.js';
import { ProctorSession } from '../models/ProctorSession.js';
import { Violation } from '../models/Violation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildSuspicionScore, createViolationNarrative, scoreViolation } from '../services/proctor.service.js';
import { getIo } from '../sockets/index.js';

export const startSession = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.examId);
  if (!exam) return res.status(404).json({ message: 'Exam not found' });

  let session = await ProctorSession.findOne({ exam: exam._id, student: req.user._id, status: { $in: ['waiting', 'active'] } });
  if (!session) {
    session = await ProctorSession.create({
      exam: exam._id,
      student: req.user._id,
      status: 'active',
      startedAt: new Date(),
      ip: req.ip,
      fingerprint: req.body.fingerprint || nanoid(14),
      browser: req.headers['user-agent'],
    });
  } else {
    session.status = 'active';
    session.startedAt ||= new Date();
    await session.save();
  }

  getIo()?.to('admins').emit('session:started', { sessionId: session._id, examId: exam._id, studentId: req.user._id });
  res.status(201).json({ session });
});

export const getSession = asyncHandler(async (req, res) => {
  const session = await ProctorSession.findById(req.params.id).populate('exam student');
  if (!session) return res.status(404).json({ message: 'Session not found' });
  if (req.user.role !== 'admin' && String(session.student._id) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  const violations = await Violation.find({ session: session._id }).sort({ createdAt: -1 }).limit(100);
  res.json({ session, violations });
});

export const saveAnswer = asyncHandler(async (req, res) => {
  const { questionId, value, language } = req.body;
  const session = await ProctorSession.findById(req.params.id);
  if (!session) return res.status(404).json({ message: 'Session not found' });

  const existing = session.answers.find((answer) => String(answer.questionId) === String(questionId));
  if (existing) {
    existing.value = value;
    existing.language = language;
    existing.updatedAt = new Date();
  } else {
    session.answers.push({ questionId, value, language });
  }
  session.progress = Math.min(100, Math.round((session.answers.length / Math.max(1, req.body.totalQuestions || session.answers.length)) * 100));
  await session.save();
  getIo()?.to(`session:${session._id}`).emit('answer:saved', { questionId, progress: session.progress });
  res.json({ session });
});

export const reportViolation = asyncHandler(async (req, res) => {
  const session = await ProctorSession.findById(req.params.id);
  if (!session) return res.status(404).json({ message: 'Session not found' });

  const severity = scoreViolation(req.body.type, req.body.metadata);
  const violation = await Violation.create({
    session: session._id,
    exam: session.exam,
    student: session.student,
    type: req.body.type,
    message: req.body.message || createViolationNarrative(req.body.type),
    severity,
    screenshot: req.body.screenshot,
    metadata: req.body.metadata,
  });

  session.proctor.suspicionScore = buildSuspicionScore(session.proctor.suspicionScore, violation);
  if (session.proctor.suspicionScore >= 92) {
    session.status = 'terminated';
    session.submittedAt = new Date();
  }
  await session.save();

  const payload = { violation, sessionId: session._id, suspicionScore: session.proctor.suspicionScore };
  getIo()?.to('admins').emit('violation:new', payload);
  getIo()?.to(`session:${session._id}`).emit('warning:new', payload);
  res.status(201).json(payload);
});

export const updateSignals = asyncHandler(async (req, res) => {
  const session = await ProctorSession.findByIdAndUpdate(
    req.params.id,
    { $set: { proctor: { ...req.body, suspicionScore: req.body.suspicionScore ?? 0 } } },
    { new: true },
  );
  if (!session) return res.status(404).json({ message: 'Session not found' });
  getIo()?.to('admins').emit('session:signals', { sessionId: session._id, proctor: session.proctor });
  res.json({ session });
});

export const submitSession = asyncHandler(async (req, res) => {
  const session = await ProctorSession.findById(req.params.id);
  if (!session) return res.status(404).json({ message: 'Session not found' });
  session.status = req.body.force ? 'terminated' : 'submitted';
  session.submittedAt = new Date();
  session.score = req.body.score ?? session.score;
  await session.save();
  getIo()?.to('admins').emit('session:submitted', { sessionId: session._id, status: session.status });
  getIo()?.to(`session:${session._id}`).emit('exam:submitted', { status: session.status });
  res.json({ session });
});
