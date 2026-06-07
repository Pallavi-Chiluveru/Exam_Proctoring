import { Exam } from '../models/Exam.js';
import { ProctorSession } from '../models/ProctorSession.js';
import { User } from '../models/User.js';
import { Violation } from '../models/Violation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getIo } from '../sockets/index.js';

export const analytics = asyncHandler(async (_req, res) => {
  const [totalExams, activeStudents, violations, liveSessions, average] = await Promise.all([
    Exam.countDocuments(),
    User.countDocuments({ role: 'student' }),
    Violation.countDocuments(),
    ProctorSession.countDocuments({ status: 'active' }),
    ProctorSession.aggregate([{ $group: { _id: null, averageScore: { $avg: '$score' } } }]),
  ]);

  const severity = await Violation.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 }, avgSeverity: { $avg: '$severity' } } },
    { $sort: { count: -1 } },
  ]);

  const completion = await ProctorSession.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({
    metrics: {
      totalExams,
      activeStudents,
      suspiciousActivities: violations,
      liveSessions,
      averageScore: Math.round(average[0]?.averageScore || 0),
    },
    severity,
    completion,
    heatmap: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      risk: Math.round(18 + Math.sin(hour / 2.8) * 16 + (hour % 5) * 6),
    })),
    performance: Array.from({ length: 8 }, (_, index) => ({
      name: `W${index + 1}`,
      score: 68 + index * 3 + (index % 2 ? 8 : 0),
      integrity: 94 - index * 2,
    })),
  });
});

export const liveSessions = asyncHandler(async (_req, res) => {
  const sessions = await ProctorSession.find({ status: { $in: ['active', 'waiting'] } })
    .populate('student', 'name email avatar department riskScore')
    .populate('exam', 'title category durationMinutes')
    .sort({ updatedAt: -1 });
  res.json({ sessions });
});

export const students = asyncHandler(async (_req, res) => {
  const users = await User.find({ role: 'student' }).sort({ createdAt: -1 });
  res.json({ students: users });
});

export const recentViolations = asyncHandler(async (_req, res) => {
  const violations = await Violation.find()
    .populate('student', 'name email')
    .populate('exam', 'title')
    .sort({ createdAt: -1 })
    .limit(60);
  res.json({ violations });
});

export const sendWarning = asyncHandler(async (req, res) => {
  const { sessionId, message } = req.body;
  getIo()?.to(`session:${sessionId}`).emit('warning:manual', {
    message: message || 'Please keep your eyes on screen and remain in frame.',
    createdAt: new Date(),
  });
  res.json({ ok: true });
});
