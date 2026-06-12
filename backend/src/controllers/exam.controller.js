import { z } from 'zod';
import { Exam } from '../models/Exam.js';
import { ProctorSession } from '../models/ProctorSession.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const examSchema = z.object({
  title: z.string().min(3),
  category: z.string().optional(),
  assessmentType: z.string().optional(),
  durationMinutes: z.number().min(5),
  passingMarks: z.number().min(0).optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  status: z.enum(['draft', 'scheduled', 'live', 'completed']).optional(),
  questions: z.array(z.any()).default([]),
});

const calculateSummary = (data) => {
  const summary = {
    totalQuestions: data.questions?.length || 0,
    totalMarks: data.questions?.reduce((acc, q) => acc + (q.points || 0), 0) || 0,
    questionTypeCounts: { mcq: 0, msq: 0, coding: 0, descriptive: 0 },
    difficultyCounts: { easy: 0, medium: 0, hard: 0 }
  };
  
  if (data.questions) {
    data.questions.forEach(q => {
      if (q.type && summary.questionTypeCounts[q.type] !== undefined) {
        summary.questionTypeCounts[q.type]++;
      }
      if (q.difficulty && summary.difficultyCounts[q.difficulty] !== undefined) {
        summary.difficultyCounts[q.difficulty]++;
      }
    });
  }
  
  return summary;
};

export const listExams = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' 
    ? {} 
    : { status: { $ne: 'draft' } };
  
  // Select out the questions array which can be huge. We only need summary data.
  const exams = await Exam.find(filter).select('-questions').sort({ startsAt: 1 }).lean();
  
  let sessionByExam = new Map();
  if (req.user.role === 'student') {
    const sessions = await ProctorSession.find({ student: req.user._id }).lean();
    sessionByExam = new Map(sessions.map((session) => [String(session.exam), session]));
  }

  res.json({
    exams: exams.map((exam) => ({
      ...exam,
      session: sessionByExam.get(String(exam._id)) || null,
    })),
  });
});

export const getExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id).lean();
  if (!exam) return res.status(404).json({ message: 'Exam not found' });
  res.json({ exam });
});

export const createExam = asyncHandler(async (req, res) => {
  const data = examSchema.parse(req.body);
  const summary = calculateSummary(data);
  
  if (data.passingMarks && data.passingMarks > summary.totalMarks) {
    return res.status(400).json({ message: 'Passing Marks cannot exceed Total Marks' });
  }

  const exam = await Exam.create({
    ...data,
    ...summary,
    startsAt: data.startsAt ? new Date(data.startsAt) : new Date(Date.now() + 60 * 60 * 1000),
    endsAt: data.endsAt ? new Date(data.endsAt) : new Date(Date.now() + 3 * 60 * 60 * 1000),
    createdBy: req.user._id,
  });
  res.status(201).json({ exam });
});

export const updateExam = asyncHandler(async (req, res) => {
  const data = examSchema.partial().parse(req.body);
  const summary = calculateSummary(data);
  
  if (data.passingMarks && data.passingMarks > summary.totalMarks) {
    return res.status(400).json({ message: 'Passing Marks cannot exceed Total Marks' });
  }

  const exam = await Exam.findByIdAndUpdate(req.params.id, { ...data, ...summary }, { new: true });
  if (!exam) return res.status(404).json({ message: 'Exam not found' });
  res.json({ exam });
});

export const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndDelete(req.params.id);
  if (!exam) return res.status(404).json({ message: 'Exam not found' });
  res.status(204).send();
});

export const assignStudents = asyncHandler(async (req, res) => {
  const { studentIds } = req.body;
  if (!Array.isArray(studentIds)) {
    return res.status(400).json({ message: 'studentIds must be an array' });
  }

  const exam = await Exam.findByIdAndUpdate(
    req.params.id,
    { assignedStudents: studentIds },
    { new: true }
  ).populate('assignedStudents', 'name email candidateId');

  if (!exam) return res.status(404).json({ message: 'Exam not found' });
  res.json({ exam });
});

export const getExamResults = asyncHandler(async (req, res) => {
  const sessions = await ProctorSession.find({
    exam: req.params.id,
    status: { $in: ['active', 'submitted', 'terminated', 'disqualified'] }
  })
    .populate('student', 'name email candidateId')
    .sort({ updatedAt: -1 });

  res.json({ results: sessions });
});

