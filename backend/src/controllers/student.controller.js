import { ProctorSession } from '../models/ProctorSession.js';
import { Violation } from '../models/Violation.js';
import { User } from '../models/User.js';
import { Exam } from '../models/Exam.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const sessions = await ProctorSession.find({ student: studentId, status: { $in: ['submitted', 'terminated', 'disqualified'] } })
    .populate('exam', 'title category')
    .sort({ submittedAt: 1 }) // Sort chronological to calculate trends
    .lean();

  const totalExams = sessions.length;
  
  // Basic stats
  const allScores = sessions.map(s => s.score || 0);
  const avgScore = totalExams > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / totalExams) : 0;
  
  const allIntegrity = sessions.map(s => Math.max(0, 100 - (s.finalRiskScore || s.proctor?.riskScore || 0)));
  const avgIntegrity = totalExams > 0 ? Math.round(allIntegrity.reduce((a, b) => a + b, 0) / totalExams) : null;
  
  const highestScore = totalExams > 0 ? Math.max(...allScores) : 0;
  const lowestScore = totalExams > 0 ? Math.min(...allScores) : 0;
  
  // Trend calculations (compare last exam against the average of all previous exams)
  let scoreTrend = 0;
  let integrityTrend = 0;
  if (totalExams > 1) {
    const previousSessions = sessions.slice(0, totalExams - 1);
    const prevAvgScore = previousSessions.reduce((a, s) => a + (s.score || 0), 0) / previousSessions.length;
    const currentScore = sessions[totalExams - 1].score || 0;
    scoreTrend = prevAvgScore > 0 ? Math.round(((currentScore - prevAvgScore) / prevAvgScore) * 100) : 0;

    const prevAvgIntegrity = previousSessions.reduce((a, s) => a + Math.max(0, 100 - (s.finalRiskScore || s.proctor?.riskScore || 0)), 0) / previousSessions.length;
    const currentIntegrity = Math.max(0, 100 - (sessions[totalExams - 1].finalRiskScore || sessions[totalExams - 1].proctor?.riskScore || 0));
    integrityTrend = prevAvgIntegrity > 0 ? Math.round(((currentIntegrity - prevAvgIntegrity) / prevAvgIntegrity) * 100) : 0;
  }

  // Rank mocked
  const rank = totalExams > 0 ? 18 : null;
  const rankTrend = totalExams > 0 ? 2 : 0; // +2 rank improvement

  // Subject Performance Breakdown
  const subjectMap = {};
  sessions.forEach(s => {
    const category = s.exam?.category || 'General';
    if (!subjectMap[category]) subjectMap[category] = { totalScore: 0, count: 0 };
    subjectMap[category].totalScore += (s.score || 0);
    subjectMap[category].count += 1;
  });
  
  const subjectPerformance = Object.keys(subjectMap).map(sub => ({
    subject: sub,
    average: Math.round(subjectMap[sub].totalScore / subjectMap[sub].count)
  })).sort((a, b) => b.average - a.average);

  // AI Insights
  let strongestSubject = subjectPerformance.length > 0 ? subjectPerformance[0].subject : 'N/A';
  let weakestSubject = subjectPerformance.length > 0 ? subjectPerformance[subjectPerformance.length - 1].subject : 'N/A';
  
  let averageImprovement = scoreTrend > 0 ? `+${scoreTrend}%` : `${scoreTrend}%`;
  let integrityRating = avgIntegrity === null ? 'N/A' : avgIntegrity >= 90 ? 'Excellent' : avgIntegrity >= 75 ? 'Good' : 'Needs Work';
  
  const avgRisk = avgIntegrity !== null ? 100 - avgIntegrity : null;
  let riskBehaviour = avgRisk === null ? 'N/A' : avgRisk <= 10 ? 'Low' : avgRisk <= 30 ? 'Moderate' : 'High';

  const aiInsights = {
    strongestSubject,
    weakestSubject,
    averageImprovement,
    integrityRating,
    riskBehaviour
  };

  // Performance Chart Data
  const performanceChart = sessions.map(s => {
    const timeTakenMinutes = s.submittedAt && s.startedAt ? Math.round((new Date(s.submittedAt).getTime() - new Date(s.startedAt).getTime()) / 60000) : 0;
    const dateObj = new Date(s.submittedAt || s.createdAt);
    return {
      assessmentName: s.exam?.title || 'Unknown',
      date: dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      score: s.score || 0,
      integrity: Math.max(0, 100 - (s.finalRiskScore || s.proctor?.riskScore || 0)),
      riskScore: s.finalRiskScore || s.proctor?.riskScore || 0,
      timeTaken: timeTakenMinutes,
      id: s._id
    };
  });

  // Recent Assessments (reversed to show latest first)
  const recentAssessments = [...sessions].reverse().slice(0, 5).map(s => ({
    _id: s._id,
    assessmentName: s.exam?.title || 'Unknown',
    date: s.submittedAt || s.createdAt,
    score: s.score || 0,
    integrityScore: Math.max(0, 100 - (s.finalRiskScore || s.proctor?.riskScore || 0)),
    status: s.status === 'disqualified' ? 'Disqualified' : (s.score || 0) >= 50 ? 'Passed' : 'Failed',
  }));

  // Risk Analytics History
  // To avoid an N+1 query issue for violations, we'll fetch violations for these sessions in one go.
  const sessionIds = sessions.map(s => s._id);
  const allViolations = await Violation.find({ session: { $in: sessionIds } }).lean();
  
  const riskHistory = [...sessions].reverse().map(s => {
    const violationsCount = allViolations.filter(v => v.session.toString() === s._id.toString()).length;
    return {
      _id: s._id,
      assessmentName: s.exam?.title || 'Unknown',
      date: s.submittedAt || s.createdAt,
      riskScore: s.finalRiskScore || s.proctor?.riskScore || 0,
      violationsCount
    };
  });

  res.json({
    stats: {
      highestScore,
      lowestScore,
      averageScore: avgScore,
      totalExams,
      integrityScore: avgIntegrity,
      currentRank: rank,
      trends: {
        score: scoreTrend,
        integrity: integrityTrend,
        rank: rankTrend,
      }
    },
    performanceChart,
    subjectPerformance,
    aiInsights,
    recentAssessments,
    riskHistory
  });
});

export const getResults = asyncHandler(async (req, res) => {
  const sessions = await ProctorSession.find({ student: req.user._id, status: { $in: ['submitted', 'terminated', 'disqualified'] } })
    .populate('exam', 'title category')
    .sort({ submittedAt: -1 })
    .lean();

  const results = sessions.map(s => ({
    _id: s._id,
    assessmentName: s.exam?.title || 'Unknown Assessment',
    subject: s.exam?.category || 'General',
    date: s.submittedAt || s.createdAt,
    score: s.percentage || s.score || 0,
    percentage: s.percentage || s.score || 0,
    integrityScore: Math.max(0, 100 - (s.finalRiskScore || s.proctor?.riskScore || 0)),
    status: s.status === 'disqualified' ? 'Disqualified' : s.result || ((s.score || 0) >= 50 ? 'Passed' : 'Failed'),
  }));

  res.json({ results });
});

export const getResultDetails = asyncHandler(async (req, res) => {
  const session = await ProctorSession.findOne({ _id: req.params.sessionId, student: req.user._id })
    .populate('exam')
    .lean();
  
  if (!session) return res.status(404).json({ message: 'Result not found' });

  const totalQuestions = session.exam?.questions?.length || session.answers?.length || 0;
  const answeredCount = session.answers?.filter(a => a.value != null).length || 0;
  const skippedCount = totalQuestions - answeredCount;

  // Use precise backend values if available, otherwise fallback
  const percentage = session.percentage || session.score || 0;
  
  // For precise answers count, since we don't store correct/wrong counts, we can estimate from marksObtained 
  // or just use exact marks. The frontend expects correctAnswers/wrongAnswers counts.
  // We'll calculate it based on marksObtained / average points per question, or fallback to percentage-based.
  const avgPoints = session.exam?.questions?.length > 0 
      ? session.exam.questions.reduce((sum, q) => sum + (q.points || 10), 0) / session.exam.questions.length 
      : 10;
  
  const correctCount = session.marksObtained != null 
      ? Math.round(session.marksObtained / avgPoints)
      : Math.round(answeredCount * (percentage / 100));
  const wrongCount = answeredCount - correctCount;

  const timeTakenMinutes = session.submittedAt && session.startedAt 
    ? Math.round((new Date(session.submittedAt).getTime() - new Date(session.startedAt).getTime()) / 60000) 
    : 0;

  res.json({
    assessmentName: session.exam?.title || 'Assessment',
    attemptDate: session.submittedAt || session.createdAt,
    duration: session.exam?.durationMinutes || 0,
    timeTaken: timeTakenMinutes,
    analysis: {
      totalQuestions,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      skippedQuestions: skippedCount,
      finalScore: session.marksObtained || session.score || 0,
      totalMarks: session.totalMarks || (totalQuestions * 10),
      percentage: percentage,
      result: session.result || (percentage >= 50 ? 'Passed' : 'Failed')
    },
    topics: session.exam?.category ? [{ name: session.exam.category, score: percentage }] : []
  });
});

export const getIntegrityReports = asyncHandler(async (req, res) => {
  const sessions = await ProctorSession.find({ student: req.user._id })
    .populate('exam', 'title')
    .sort({ createdAt: -1 })
    .lean();

  const reports = sessions.map(s => ({
    _id: s._id,
    assessmentName: s.exam?.title || 'Unknown',
    date: s.startedAt || s.createdAt,
    riskScore: s.finalRiskScore || s.proctor?.riskScore || 0,
    integrityScore: Math.max(0, 100 - (s.finalRiskScore || s.proctor?.riskScore || 0)),
    status: s.status === 'disqualified' ? 'Disqualified' : s.status === 'waiting' ? 'Waiting' : s.status === 'active' ? 'Active' : 'Passed',
  }));

  res.json({ reports });
});

export const getIntegrityDetails = asyncHandler(async (req, res) => {
  const session = await ProctorSession.findOne({ _id: req.params.sessionId, student: req.user._id })
    .populate('exam', 'title')
    .lean();

  if (!session) return res.status(404).json({ message: 'Session not found' });

  const violations = await Violation.find({ session: session._id }).sort({ createdAt: 1 }).lean();

  const violationCounts = {};
  violations.forEach(v => {
    violationCounts[v.type] = (violationCounts[v.type] || 0) + 1;
  });

  const timeline = violations.map(v => ({
    time: v.createdAt,
    violation: v.message || v.type,
    riskAdded: v.riskAdded || 0,
  }));

  res.json({
    summary: {
      assessmentName: session.exam?.title || 'Assessment',
      riskScore: session.finalRiskScore || session.proctor?.riskScore || 0,
      integrityScore: Math.max(0, 100 - (session.finalRiskScore || session.proctor?.riskScore || 0)),
      status: session.status === 'disqualified' ? 'Disqualified' : session.status === 'active' ? 'Active' : 'Passed',
    },
    violationCounts,
    timeline,
    disqualificationReport: session.status === 'disqualified' ? {
      reason: session.disqualificationReason,
      finalRiskScore: session.finalRiskScore,
      timestamp: session.submittedAt || session.updatedAt,
    } : null,
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').lean();
  
  const sessions = await ProctorSession.find({ student: req.user._id, status: { $in: ['submitted', 'terminated', 'disqualified'] } }).lean();
  const totalExams = sessions.length;
  const passedExams = sessions.filter(s => (s.score || 0) >= 50 && s.status !== 'disqualified').length;
  const failedExams = sessions.filter(s => (s.score || 0) < 50 && s.status !== 'disqualified').length;
  const disqualifiedExams = sessions.filter(s => s.status === 'disqualified').length;
  
  const avgScore = totalExams > 0 ? Math.round(sessions.reduce((acc, s) => acc + (s.score || 0), 0) / totalExams) : 0;
  const avgIntegrity = totalExams > 0 ? Math.round(sessions.reduce((acc, s) => acc + Math.max(0, 100 - (s.finalRiskScore || s.proctor?.riskScore || 0)), 0) / totalExams) : null;
  
  const highestScore = totalExams > 0 ? Math.max(...sessions.map(s => s.score || 0)) : 0;
  const lowestScore = totalExams > 0 ? Math.min(...sessions.map(s => s.score || 0)) : 0;

  res.json({
    user,
    stats: {
      totalExams,
      passedExams,
      failedExams,
      disqualifiedExams,
      averageScore: avgScore,
      averageIntegrityScore: avgIntegrity,
      highestScore,
      lowestScore,
    }
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.avatar) updates.avatar = req.body.avatar;
  
  if (req.body.password) {
    const user = await User.findById(req.user._id);
    user.password = req.body.password;
    if (updates.name) user.name = updates.name;
    if (updates.avatar) user.avatar = updates.avatar;
    await user.save();
  } else if (Object.keys(updates).length > 0) {
    await User.findByIdAndUpdate(req.user._id, updates);
  }

  const updatedUser = await User.findById(req.user._id).select('-password').lean();
  res.json({ user: updatedUser });
});
