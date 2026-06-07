import { z } from 'zod';
import { Exam } from '../models/Exam.js';
import { ProctorSession } from '../models/ProctorSession.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const examSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.string().optional(),
  durationMinutes: z.number().min(5),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  status: z.enum(['draft', 'scheduled', 'live', 'completed']).optional(),
  questions: z.array(z.any()).default([]),
});

export const listExams = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { $or: [{ assignedStudents: req.user._id }, { assignedStudents: { $size: 0 } }] };
  const exams = await Exam.find(filter).sort({ startsAt: 1 }).lean();
  const sessions = await ProctorSession.find({ student: req.user._id }).lean();
  const sessionByExam = new Map(sessions.map((session) => [String(session.exam), session]));

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
  const exam = await Exam.create({
    ...data,
    startsAt: data.startsAt ? new Date(data.startsAt) : new Date(Date.now() + 60 * 60 * 1000),
    endsAt: data.endsAt ? new Date(data.endsAt) : new Date(Date.now() + 3 * 60 * 60 * 1000),
    createdBy: req.user._id,
  });
  res.status(201).json({ exam });
});

export const updateExam = asyncHandler(async (req, res) => {
  const data = examSchema.partial().parse(req.body);
  const exam = await Exam.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!exam) return res.status(404).json({ message: 'Exam not found' });
  res.json({ exam });
});

export const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndDelete(req.params.id);
  if (!exam) return res.status(404).json({ message: 'Exam not found' });
  res.status(204).send();
});
