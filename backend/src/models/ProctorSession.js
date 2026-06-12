import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId: mongoose.Schema.Types.ObjectId,
    value: mongoose.Schema.Types.Mixed,
    language: String,
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const proctorSignalSchema = new mongoose.Schema(
  {
    camera: { type: String, enum: ['active', 'blocked', 'lost'], default: 'active' },
    microphone: { type: String, enum: ['active', 'blocked', 'noisy'], default: 'active' },
    screen: { type: String, enum: ['shared', 'blocked', 'lost'], default: 'shared' },
    faceCount: { type: Number, default: 1 },
    gaze: { type: String, default: 'center' },
    headPose: { type: String, default: 'neutral' },
    audioLevel: { type: Number, default: 0 },
    suspicionScore: { type: Number, default: 0 },
    riskScore: { type: Number, default: 0 },
  },
  { _id: false },
);

const sessionSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['waiting', 'active', 'submitted', 'terminated', 'disqualified'], default: 'waiting' },
    startedAt: Date,
    submittedAt: Date,
    ip: String,
    fingerprint: String,
    browser: String,
    score: { type: Number, default: 0 }, // Backwards compatibility (percentage)
    marksObtained: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    result: { type: String, enum: ['Passed', 'Failed', 'Pending'], default: 'Pending' },
    progress: { type: Number, default: 0 },
    answers: [answerSchema],
    proctor: { type: proctorSignalSchema, default: () => ({}) },
    finalRiskScore: { type: Number, default: 0 },
    disqualificationReason: String,
    violationReport: mongoose.Schema.Types.Mixed,
    violationCounts: { type: Map, of: Number, default: () => new Map() },
    snapshots: [
      {
        type: { type: String, enum: ['webcam', 'screen'] },
        dataUrl: String,
        capturedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export const ProctorSession = mongoose.model('ProctorSession', sessionSchema);
