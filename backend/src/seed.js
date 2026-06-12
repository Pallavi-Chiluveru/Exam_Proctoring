import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import { User } from './models/User.js';
import { Exam } from './models/Exam.js';
import { ProctorSession } from './models/ProctorSession.js';
import { Violation } from './models/Violation.js';

dotenv.config();

const now = Date.now();

async function seed() {
  await connectDatabase();
  await Promise.all([User.deleteMany({}), Exam.deleteMany({}), ProctorSession.deleteMany({}), Violation.deleteMany({})]);

  const admin = await User.create({
    candidateId: 'PXADMIN01',
    name: 'Ava Sterling',
    email: 'admin@proctorx.com',
    password: 'password123',
    role: 'admin',
    department: 'Exam Operations',
    avatar: 'AS',
  });

  const student1 = await User.create({
    candidateId: '26PX001',
    name: 'Arjun Rao',
    email: 'student@proctorx.com',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    avatar: 'AR',
    riskScore: 18,
  });

  const student2 = await User.create({
    candidateId: '26PX002',
    name: 'Maya Chen',
    email: 'maya@proctorx.com',
    password: 'password123',
    role: 'student',
    department: 'Data Science',
    avatar: 'MC',
    riskScore: 42,
  });

  const student3 = await User.create({
    candidateId: '26PX003',
    name: 'Ishan Mehta',
    email: 'ishan@proctorx.com',
    password: 'password123',
    role: 'student',
    department: 'Software Engineering',
    avatar: 'IM',
    riskScore: 27,
  });

  const exam = await Exam.create({
    title: 'Advanced Algorithms and Systems Design',
    description: 'Enterprise coding and reasoning assessment with AI proctoring.',
    category: 'Coding Round',
    durationMinutes: 120,
    startsAt: new Date(now - 20 * 60 * 1000),
    endsAt: new Date(now + 100 * 60 * 1000),
    status: 'live',
    createdBy: admin._id,
    assignedStudents: [student1._id, student2._id, student3._id],
    questions: [
      {
        type: 'mcq',
        title: 'Distributed cache invalidation',
        prompt: 'Which strategy best minimizes stale reads in a globally distributed cache?',
        points: 10,
        options: ['Client-side TTL only', 'Write-through with versioned keys', 'Manual purge windows', 'Randomized eviction'],
        answer: 'Write-through with versioned keys',
      },
      {
        type: 'coding',
        title: 'Detect anomalous windows',
        prompt: 'Given an array of suspicion scores, return the longest contiguous window whose average is below threshold.',
        points: 40,
        language: 'javascript',
        starterCode:
          'function longestCleanWindow(scores, threshold) {\n  // Return the length of the longest valid window\n}\n\nconsole.log(longestCleanWindow([12, 20, 61, 18, 19], 30));',
        testCases: [
          { input: '[12,20,61,18,19], 30', output: '2' },
          { input: '[5,8,7,6], 10', output: '4', hidden: true },
        ],
      },
      {
        type: 'descriptive',
        title: 'Incident response design',
        prompt: 'Design a low-latency alerting pipeline for live online exam monitoring.',
        points: 25,
      },
    ],
  });

  const sessions = await ProctorSession.create([
    {
      exam: exam._id,
      student: student1._id,
      status: 'active',
      startedAt: new Date(now - 18 * 60 * 1000),
      progress: 58,
      score: 76,
      proctor: { camera: 'active', microphone: 'active', screen: 'shared', faceCount: 1, gaze: 'center', headPose: 'neutral', audioLevel: 22, suspicionScore: 18 },
    },
    {
      exam: exam._id,
      student: student2._id,
      status: 'active',
      startedAt: new Date(now - 26 * 60 * 1000),
      progress: 72,
      score: 89,
      proctor: { camera: 'active', microphone: 'noisy', screen: 'shared', faceCount: 1, gaze: 'left', headPose: 'tilted', audioLevel: 61, suspicionScore: 64 },
    },
    {
      exam: exam._id,
      student: student3._id,
      status: 'submitted',
      startedAt: new Date(now - 160 * 60 * 1000),
      submittedAt: new Date(now - 38 * 60 * 1000),
      progress: 100,
      score: 91,
      proctor: { camera: 'active', microphone: 'active', screen: 'shared', faceCount: 1, gaze: 'center', headPose: 'neutral', audioLevel: 12, suspicionScore: 10 },
    },
  ]);

  await Violation.create([
    {
      session: sessions[1]._id,
      exam: exam._id,
      student: student2._id,
      type: 'eye_movement',
      message: 'Sustained off-screen gaze pattern detected.',
      severity: 5,
      metadata: { confidence: 0.81 },
      createdAt: new Date(now - 7 * 60 * 1000),
    },
    {
      session: sessions[1]._id,
      exam: exam._id,
      student: student2._id,
      type: 'audio_anomaly',
      message: 'Audio anomaly exceeded room baseline.',
      severity: 6,
      metadata: { decibels: 68 },
      createdAt: new Date(now - 3 * 60 * 1000),
    },
    {
      session: sessions[0]._id,
      exam: exam._id,
      student: student1._id,
      type: 'tab_switch',
      message: 'Candidate moved away from the secure exam tab.',
      severity: 7,
      metadata: { durationMs: 1400 },
      createdAt: new Date(now - 12 * 60 * 1000),
    },
  ]);

  console.log('--- Demo Accounts ---');
  console.log('Admin: admin@proctorx.com / password123');
  console.log('Student: student@proctorx.com / password123');
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
