import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['mcq', 'msq', 'coding', 'descriptive'], required: true },
    title: { type: String }, // Optional for MCQ/MSQ/Descriptive, kept for Coding
    prompt: { type: String, required: true },
    points: { type: Number, default: 10 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    explanation: String,
    
    // MCQ & MSQ Specific
    options: [String],
    answer: String, // Deprecated in favor of correctAnswers for both MCQ/MSQ for uniformity, but kept for backwards compatibility.
    correctAnswers: [String],

    // Descriptive Specific
    expectedAnswer: String,
    keywords: [String],

    // Coding Specific
    language: { type: String, default: 'javascript' },
    supportedLanguages: [String],
    starterCode: String,
    constraints: String,
    sampleInput: String,
    sampleOutput: String,
    testCases: [
      {
        input: String,
        output: String,
        hidden: { type: Boolean, default: false },
        explanation: String,
      },
    ],
  },
  { _id: true },
);

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: String,
    assessmentType: { type: String, default: 'Mixed' },
    durationMinutes: { type: Number, required: true },
    passingMarks: { type: Number, default: 50 },
    startsAt: Date,
    endsAt: Date,
    status: { type: String, enum: ['draft', 'scheduled', 'live', 'completed'], default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rules: {
      fullscreenRequired: { type: Boolean, default: true },
      screenShareRequired: { type: Boolean, default: true },
      webcamRequired: { type: Boolean, default: true },
      maxViolations: { type: Number, default: 5 },
      antiCopyPaste: { type: Boolean, default: true },
    },
    questions: [questionSchema],
    
    // Auto-calculated fields
    totalQuestions: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    questionTypeCounts: {
      mcq: { type: Number, default: 0 },
      msq: { type: Number, default: 0 },
      coding: { type: Number, default: 0 },
      descriptive: { type: Number, default: 0 }
    },
    difficultyCounts: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 }
    }
  },
  { timestamps: true },
);

examSchema.index({ startsAt: 1 });
examSchema.index({ status: 1 });

export const Exam = mongoose.model('Exam', examSchema);
