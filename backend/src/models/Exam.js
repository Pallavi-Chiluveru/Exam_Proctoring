import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['mcq', 'coding', 'descriptive'], required: true },
    title: { type: String, required: true },
    prompt: { type: String, required: true },
    points: { type: Number, default: 10 },
    options: [String],
    answer: String,
    language: { type: String, default: 'javascript' },
    starterCode: String,
    testCases: [
      {
        input: String,
        output: String,
        hidden: { type: Boolean, default: false },
      },
    ],
  },
  { _id: true },
);

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: String,
    durationMinutes: { type: Number, required: true },
    startsAt: Date,
    endsAt: Date,
    status: { type: String, enum: ['draft', 'scheduled', 'live', 'completed'], default: 'scheduled' },
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
  },
  { timestamps: true },
);

export const Exam = mongoose.model('Exam', examSchema);
