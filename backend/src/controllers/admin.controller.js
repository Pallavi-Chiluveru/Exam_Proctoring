import { Exam } from '../models/Exam.js';
import { ProctorSession } from '../models/ProctorSession.js';
import { User } from '../models/User.js';
import { Violation } from '../models/Violation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getIo } from '../sockets/index.js';

export const analytics = asyncHandler(async (req, res) => {
  const adminId = req.user._id;

  // 1. Get all exams created by this admin
  const adminExams = await Exam.find({ createdBy: adminId }).select('_id title status');
  const adminExamIds = adminExams.map(e => e._id);

  if (adminExamIds.length === 0) {
    return res.json({
      metrics: {
        totalExams: 0,
        activeStudents: 0,
        suspiciousActivities: 0,
        liveSessions: 0,
        averageIntegrityScore: 100,
      },
      activeAssessments: [],
      highRiskStudents: [],
      recentAlerts: [],
    });
  }

  // 2. Compute Top Level Metrics
  const activeStudentsList = await ProctorSession.distinct('student', { exam: { $in: adminExamIds } });
  
  const [totalExams, activeStudents, suspiciousActivities, liveSessions, integrityAggr] = await Promise.all([
    Exam.countDocuments({ createdBy: adminId }),
    activeStudentsList.length,
    Violation.countDocuments({ exam: { $in: adminExamIds } }),
    ProctorSession.countDocuments({ exam: { $in: adminExamIds }, status: 'active' }),
    ProctorSession.aggregate([
      { $match: { exam: { $in: adminExamIds }, status: { $in: ['submitted', 'disqualified', 'active'] } } },
      { $group: { _id: null, avgRisk: { $avg: '$finalRiskScore' } } }
    ]),
  ]);

  const averageIntegrityScore = integrityAggr.length > 0 ? Math.max(0, Math.round(100 - integrityAggr[0].avgRisk)) : 100;

  // 3. Active Assessments Panel
  const activeAssessmentsAggr = await ProctorSession.aggregate([
    { $match: { exam: { $in: adminExamIds } } },
    { $group: { _id: '$exam', studentCount: { $sum: 1 } } }
  ]);

  const activeAssessments = adminExams.map(exam => {
    const found = activeAssessmentsAggr.find(a => String(a._id) === String(exam._id));
    return {
      _id: exam._id,
      title: exam.title,
      status: exam.status,
      studentCount: found ? found.studentCount : 0
    };
  }).sort((a, b) => b.studentCount - a.studentCount).slice(0, 5);

  // 4. High Risk Students Panel
  const highRiskStudents = await ProctorSession.find({
    exam: { $in: adminExamIds },
    finalRiskScore: { $gt: 35 } // Arbitrary threshold for high risk/review
  })
    .populate('student', 'name email avatar')
    .populate('exam', 'title')
    .sort({ finalRiskScore: -1, updatedAt: -1 })
    .limit(5)
    .lean();

  const formattedHighRiskStudents = highRiskStudents.map(session => ({
    _id: session._id,
    student: session.student,
    examTitle: session.exam?.title,
    integrityScore: Math.max(0, 100 - (session.finalRiskScore || 0))
  }));

  // 5. Recent Alerts Feed
  const recentAlerts = await Violation.find({ exam: { $in: adminExamIds } })
    .populate('student', 'name avatar')
    .populate('exam', 'title')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  res.json({
    metrics: {
      totalExams,
      activeStudents,
      suspiciousActivities,
      liveSessions,
      averageIntegrityScore,
    },
    activeAssessments,
    highRiskStudents: formattedHighRiskStudents,
    recentAlerts,
  });
});

export const liveSessions = asyncHandler(async (req, res) => {
  const adminExams = await Exam.find({ createdBy: req.user._id }).select('_id');
  const adminExamIds = adminExams.map(e => e._id);

  console.log(`[MONITORING AUDIT] Fetching sessions for ${adminExamIds.length} exams.`);

  const sessions = await ProctorSession.find({ 
    status: { $ne: 'scheduled' }, // Return all attempted candidates
    exam: { $in: adminExamIds }
  })
    .populate('student', 'name email candidateId avatar riskScore')
    .populate('exam', 'title category durationMinutes')
    .sort({ updatedAt: -1 });
  
  console.log(`[MONITORING AUDIT] Fetched ${sessions.length} sessions from MongoDB.`);
  
  res.json({ sessions });
});

export const students = asyncHandler(async (req, res) => {
  const adminExams = await Exam.find({ createdBy: req.user._id }).select('_id');
  const adminExamIds = adminExams.map(e => e._id);

  const studentsAggr = await ProctorSession.aggregate([
    { $match: { exam: { $in: adminExamIds } } },
    { $sort: { updatedAt: -1 } },
    { 
      $group: { 
        _id: '$student', 
        examsAttempted: { $addToSet: '$exam' }, 
        latestRiskScore: { $first: '$finalRiskScore' },
        camera: { $first: '$proctor.camera' },
        microphone: { $first: '$proctor.microphone' },
        screen: { $first: '$proctor.screen' }
      } 
    }
  ]);

  const studentDataMap = {};
  studentsAggr.forEach(s => {
    studentDataMap[s._id.toString()] = {
      examsAttempted: s.examsAttempted.length,
      latestRiskScore: s.latestRiskScore || 0,
      camera: s.camera || 'active',
      microphone: s.microphone || 'active',
      screen: s.screen || 'shared'
    };
  });

  const activeStudentIds = studentsAggr.map(s => s._id);
  const users = await User.find({ _id: { $in: activeStudentIds }, role: 'student' })
    .select('name email candidateId avatar')
    .sort({ createdAt: -1 })
    .lean();
  
  const enrichedUsers = users.map(u => ({
    ...u,
    examsAttempted: studentDataMap[u._id.toString()]?.examsAttempted || 0,
    riskScore: studentDataMap[u._id.toString()]?.latestRiskScore || 0,
    devicePosture: {
      camera: studentDataMap[u._id.toString()]?.camera,
      microphone: studentDataMap[u._id.toString()]?.microphone,
      screen: studentDataMap[u._id.toString()]?.screen
    }
  }));

  res.json({ students: enrichedUsers });
});

export const allStudents = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'student' }).select('name email avatar candidateId _id').sort({ createdAt: -1 });
  res.json({ students: users });
});

export const recentViolations = asyncHandler(async (req, res) => {
  const adminExams = await Exam.find({ createdBy: req.user._id }).select('_id');
  const adminExamIds = adminExams.map(e => e._id);

  const violations = await Violation.find({ exam: { $in: adminExamIds } })
    .populate('student', 'name email candidateId')
    .populate('exam', 'title')
    .populate('session', 'finalRiskScore status disqualificationReason snapshots violationReport')
    .sort({ createdAt: -1 })
    .limit(60);
    
  res.json({ violations });
});

export const sendWarning = asyncHandler(async (req, res) => {
  const { sessionId, message } = req.body;
  
  // Verify session belongs to admin's exam
  const session = await ProctorSession.findById(sessionId).populate('exam');
  if (!session || String(session.exam.createdBy) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  getIo()?.to(`session:${sessionId}`).emit('warning:manual', {
    message: message || 'Please keep your eyes on screen and remain in frame.',
    createdAt: new Date(),
  });
  
  res.json({ ok: true });
});

export const integrityReports = asyncHandler(async (req, res) => {
  const adminExams = await Exam.find({ createdBy: req.user._id }).select('_id');
  const adminExamIds = adminExams.map(e => e._id);

  // Get all submitted or disqualified sessions
  const sessions = await ProctorSession.find({
    exam: { $in: adminExamIds },
    status: { $in: ['submitted', 'disqualified', 'terminated', 'active'] }
  })
    .populate('student', 'name email candidateId avatar')
    .populate('exam', 'title')
    .sort({ updatedAt: -1 });

  let totalRisk = 0;
  let highRiskCount = 0;
  const flaggedStudents = new Set();

  const formattedSessions = sessions.map(session => {
    const risk = session.finalRiskScore || 0;
    const integrityScore = Math.max(0, 100 - risk);
    let riskLevel = 'Low';
    if (integrityScore < 65) riskLevel = 'High';
    else if (integrityScore < 85) riskLevel = 'Medium';

    totalRisk += risk;
    if (riskLevel === 'High' || riskLevel === 'Medium') {
      highRiskCount++;
      flaggedStudents.add(session.student._id.toString());
    }

    // Compute total violations from the violationCounts map if available
    let totalViolations = 0;
    if (session.violationCounts && session.violationCounts instanceof Map) {
      for (const count of session.violationCounts.values()) {
        totalViolations += count;
      }
    } else if (session.violationCounts) {
      totalViolations = Object.values(session.violationCounts).reduce((a, b) => a + b, 0);
    }

    return {
      ...session.toObject(),
      integrityScore,
      riskLevel,
      totalViolations
    };
  });

  const averageIntegrity = sessions.length > 0 ? Math.max(0, Math.round(100 - (totalRisk / sessions.length))) : 100;

  res.json({
    summary: {
      totalAttempts: sessions.length,
      averageIntegrity,
      highRiskAttempts: highRiskCount,
      studentsFlagged: flaggedStudents.size
    },
    reports: formattedSessions
  });
});

export const integrityReportDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
    const session = await ProctorSession.findById(id)
    .populate('student', 'name email candidateId avatar')
    .populate('exam', 'title durationMinutes category createdBy');

  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  // Ensure admin owns the exam
  if (String(session.exam.createdBy) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const violations = await Violation.find({ session: id }).sort({ createdAt: 1 });

  const risk = session.finalRiskScore || 0;
  const integrityScore = Math.max(0, 100 - risk);
  let riskLevel = 'Low';
  if (integrityScore < 65) riskLevel = 'High';
  else if (integrityScore < 85) riskLevel = 'Medium';

  let totalViolations = 0;
  const breakdown = {};
  
  if (session.violationCounts && session.violationCounts instanceof Map) {
    for (const [key, val] of session.violationCounts.entries()) {
      breakdown[key] = val;
      totalViolations += val;
    }
  } else if (session.violationCounts) {
    for (const [key, val] of Object.entries(session.violationCounts)) {
      breakdown[key] = val;
      totalViolations += val;
    }
  } else {
    // Fallback: calculate from violations list
    violations.forEach(v => {
      breakdown[v.type] = (breakdown[v.type] || 0) + 1;
      totalViolations++;
    });
  }

  res.json({
    report: {
      ...session.toObject(),
      integrityScore,
      riskLevel,
      totalViolations,
      breakdown
    },
    timeline: violations
  });
});

// --- RESULTS MODULE ---

export const getAllResults = asyncHandler(async (req, res) => {
  const adminId = req.user._id;

  // Get all exams owned by admin
  const adminExams = await Exam.find({ createdBy: adminId }).select('_id');
  const adminExamIds = adminExams.map(e => e._id);

  // Fetch all submitted/disqualified sessions
  const sessions = await ProctorSession.find({
    exam: { $in: adminExamIds },
    status: { $in: ['submitted', 'disqualified'] }
  })
    .populate('student', 'name email candidateId avatar')
    .populate('exam', 'title totalMarks')
    .sort({ updatedAt: -1 })
    .lean();

  // Calculate summary metrics
  const uniqueExams = new Set(sessions.map(s => String(s.exam?._id)));
  const uniqueStudents = new Set(sessions.map(s => String(s.student?._id)));
  
  let totalScore = 0;
  let highestScore = 0;
  let totalIntegrity = 0;

  sessions.forEach(s => {
    const score = s.score || 0;
    const integrity = Math.max(0, 100 - (s.finalRiskScore || 0));
    
    totalScore += score;
    highestScore = Math.max(highestScore, score);
    totalIntegrity += integrity;
  });

  const count = sessions.length;
  const summary = {
    totalAssessments: uniqueExams.size,
    totalStudents: uniqueStudents.size,
    averageScore: count > 0 ? Math.round(totalScore / count) : 0,
    highestScore,
    averageIntegrity: count > 0 ? Math.round(totalIntegrity / count) : 100
  };

  res.json({
    summary,
    results: sessions
  });
});

export const getResultDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user._id;

  const session = await ProctorSession.findById(id)
    .populate('student', 'name email candidateId avatar')
    .populate('exam', 'title durationMinutes passingMarks totalMarks')
    .lean();

  if (!session) {
    res.status(404);
    throw new Error('Result not found');
  }

  // Verify the exam belongs to this admin
  const exam = await Exam.findOne({ _id: session.exam._id, createdBy: adminId });
  if (!exam) {
    res.status(403);
    throw new Error('Not authorized to view this result');
  }

  // Fetch violations to provide context if needed, though mostly we just need score
  const violationsCount = await Violation.countDocuments({ session: id });

  res.json({
    result: {
      ...session,
      integrityScore: Math.max(0, 100 - (session.finalRiskScore || 0)),
      totalViolations: violationsCount
    }
  });
});

import { v2 as cloudinary } from 'cloudinary';

export const updateAdminProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('Admin not found');
  }

  if (name) user.name = name;
  if (email) user.email = email;

  const updatedUser = await user.save();
  
  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    avatar: updatedUser.avatar,
    role: updatedUser.role
  });
});

export const changeAdminPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    res.status(404);
    throw new Error('Admin not found');
  }

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid current password');
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password updated successfully' });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  console.log('[UPLOAD] /api/admin/avatar endpoint hit');
  
  let dataURI;
  let originalName = 'avatar.png';

  if (req.body.avatarBase64) {
    console.log('[UPLOAD] Received avatarBase64 from JSON payload.');
    dataURI = req.body.avatarBase64;
  } else if (req.file) {
    console.log('[UPLOAD] req.file details:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    console.log('[UPLOAD] Converting buffer to Base64...');
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    dataURI = `data:${req.file.mimetype};base64,${b64}`;
    originalName = req.file.originalname;
  } else {
    console.error('[UPLOAD] Failed: No req.file object AND no avatarBase64 found.');
    res.status(400);
    throw new Error('No image file provided. Please check the payload.');
  }

  const cloudName = process.env.CLOUDINARY_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  console.log('[UPLOAD] Cloudinary credentials presence:', {
    cloud_name: !!cloudName,
    api_key: !!apiKey,
    api_secret: !!apiSecret
  });

  // Configure Cloudinary using env variables at runtime
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });

  try {
    console.log(`[UPLOAD] Starting Cloudinary uploader.upload() for ${originalName}...`);
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'proctorx/avatars',
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' } // Optional: force square avatars
      ]
    });
    
    console.log('[UPLOAD] Cloudinary upload successful!', result.secure_url);

    const user = await User.findById(req.user._id);
    user.avatar = result.secure_url;
    const updatedUser = await user.save();
    
    console.log('[UPLOAD] Database updated successfully.');

    res.json({ 
      message: 'Avatar updated successfully', 
      avatarUrl: updatedUser.avatar,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error('[UPLOAD] Cloudinary upload error FULL TRACE:', error);
    res.status(500).json({
      message: 'Image upload to Cloudinary failed.',
      errorDetail: error.message || error.toString()
    });
  }
});
