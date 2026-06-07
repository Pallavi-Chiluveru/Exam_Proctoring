import mongoose from 'mongoose';

const violationSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'ProctorSession', required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'no_face',
        'multiple_faces',
        'phone_detected',
        'eye_movement',
        'head_pose',
        'audio_anomaly',
        'tab_switch',
        'fullscreen_exit',
        'copy_paste',
        'devtools',
        'screen_share_lost',
      ],
      required: true,
    },
    message: String,
    severity: { type: Number, min: 1, max: 10, default: 3 },
    screenshot: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

export const Violation = mongoose.model('Violation', violationSchema);
