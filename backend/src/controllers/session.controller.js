import { nanoid } from 'nanoid';
import { Exam } from '../models/Exam.js';
import { ProctorSession } from '../models/ProctorSession.js';
import { Violation } from '../models/Violation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { computeRiskEvent, createViolationNarrative, getViolationLabel } from '../services/proctor.service.js';
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
  if (['disqualified', 'terminated', 'submitted'].includes(session.status)) {
    return res.status(409).json({ message: 'Session is locked' });
  }

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
  if (['disqualified', 'terminated', 'submitted'].includes(session.status)) {
    return res.status(409).json({ message: 'Session is locked', session });
  }

  const riskEvent = computeRiskEvent(session, req.body.type, req.body.metadata);
  const violation = await Violation.create({
    session: session._id,
    exam: session.exam,
    student: session.student,
    type: req.body.type,
    message: req.body.message || createViolationNarrative(req.body.type),
    severity: riskEvent.severity,
    riskAdded: riskEvent.riskAdded,
    occurrence: riskEvent.occurrence,
    riskScoreAfter: riskEvent.riskScoreAfter,
    disqualifying: riskEvent.disqualifying,
    disqualificationReason: riskEvent.disqualificationReason,
    screenshot: req.body.screenshot,
    webcamEvidence: req.body.webcamEvidence,
    metadata: req.body.metadata,
  });

  session.violationCounts.set(req.body.type, riskEvent.occurrence);
  session.finalRiskScore = riskEvent.riskScoreAfter;
  session.proctor.suspicionScore = riskEvent.riskScoreAfter;
  session.proctor.riskScore = riskEvent.riskScoreAfter;
  if (riskEvent.disqualifying) {
    session.status = 'disqualified';
    session.submittedAt = new Date();
    session.score = 0;
    session.disqualificationReason = riskEvent.disqualificationReason;
    session.violationReport = {
      finalRiskScore: riskEvent.riskScoreAfter,
      reason: riskEvent.disqualificationReason,
      trigger: getViolationLabel(req.body.type),
      violationId: violation._id,
      generatedAt: new Date(),
    };
  }
  await session.save();

  const payload = {
    violation,
    sessionId: session._id,
    riskScore: session.finalRiskScore,
    suspicionScore: session.proctor.suspicionScore,
    disqualified: riskEvent.disqualifying,
    disqualificationReason: riskEvent.disqualificationReason,
  };
  getIo()?.to('admins').emit('violation:new', payload);
  getIo()?.to(`session:${session._id}`).emit('warning:new', payload);
  if (riskEvent.disqualifying) {
    getIo()?.to('admins').emit('session:disqualified', payload);
    getIo()?.to(`session:${session._id}`).emit('exam:disqualified', payload);
  }
  res.status(201).json(payload);
});

export const updateSignals = asyncHandler(async (req, res) => {
  const session = await ProctorSession.findById(req.params.id);
  if (!session) return res.status(404).json({ message: 'Session not found' });
  const serverRisk = Number(session.finalRiskScore || session.proctor?.riskScore || session.proctor?.suspicionScore || 0);
  session.proctor = {
    ...session.proctor,
    camera: req.body.camera ?? session.proctor.camera,
    microphone: req.body.microphone ?? session.proctor.microphone,
    screen: req.body.screen ?? session.proctor.screen,
    faceCount: req.body.faceCount ?? session.proctor.faceCount,
    gaze: req.body.gaze ?? session.proctor.gaze,
    headPose: req.body.headPose ?? session.proctor.headPose,
    audioLevel: req.body.audioLevel ?? session.proctor.audioLevel,
    suspicionScore: serverRisk,
    riskScore: serverRisk,
  };
  await session.save();
  getIo()?.to('admins').emit('session:signals', { sessionId: session._id, proctor: session.proctor });
  res.json({ session });
});

export const submitSession = asyncHandler(async (req, res) => {
  const session = await ProctorSession.findById(req.params.id).populate('exam');
  if (!session) return res.status(404).json({ message: 'Session not found' });
  if (session.status === 'disqualified') {
    return res.status(409).json({ message: 'Session was disqualified', session });
  }

  // Calculate score securely on backend
  let marksObtained = 0;
  let totalMarks = 0;

  if (session.exam && session.exam.questions) {
    for (const question of session.exam.questions) {
      const points = question.points || 10;
      totalMarks += points;
      
      const answerRecord = session.answers.find(a => String(a.questionId) === String(question._id));
      if (!answerRecord || answerRecord.value == null) continue;

      let isCorrect = false;

      if (question.type === 'mcq') {
         const correctAnswers = question.correctAnswers && question.correctAnswers.length > 0 ? question.correctAnswers : (question.answer ? [question.answer] : []);
         if (correctAnswers.includes(answerRecord.value)) {
           isCorrect = true;
         }
      } else if (question.type === 'msq') {
         const correctAnswers = question.correctAnswers || [];
         const studentAnswers = Array.isArray(answerRecord.value) ? answerRecord.value : [];
         if (correctAnswers.length === studentAnswers.length && correctAnswers.every(ans => studentAnswers.includes(ans))) {
           isCorrect = true;
         }
      } else if (question.type === 'descriptive') {
         if (question.expectedAnswer && typeof answerRecord.value === 'string' && answerRecord.value.trim().toLowerCase() === question.expectedAnswer.trim().toLowerCase()) {
            isCorrect = true;
         }
      }
      
      if (isCorrect) {
        marksObtained += points;
      }
    }
  }

  const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;
  const passed = percentage >= (session.exam?.passingMarks || 50);

  session.status = req.body.force ? 'terminated' : 'submitted';
  session.submittedAt = new Date();
  
  session.marksObtained = marksObtained;
  session.totalMarks = totalMarks;
  session.percentage = percentage;
  session.result = passed ? 'Passed' : 'Failed';
  session.score = percentage; // Backwards compatibility
  
  await session.save();
  getIo()?.to('admins').emit('session:submitted', { sessionId: session._id, status: session.status });
  getIo()?.to(`session:${session._id}`).emit('exam:submitted', { status: session.status });
  res.json({ session });
});
