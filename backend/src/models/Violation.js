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
        'multiple_voices',
        'tab_switch',
        'fullscreen_exit',
        'copy_paste',
        'right_click',
        'devtools',
        'screen_share_lost',
        'window_blur',
        'gaze_tracking',
      ],
      required: true,
    },
    message: String,
    severity: { type: Number, min: 1, max: 10, default: 3 },
    riskAdded: { type: Number, min: 0, max: 100, default: 0 },
    occurrence: { type: Number, default: 1 },
    riskScoreAfter: { type: Number, min: 0, max: 100, default: 0 },
    disqualifying: { type: Boolean, default: false },
    disqualificationReason: String,
    screenshot: String,
    webcamEvidence: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

violationSchema.index({ session: 1 });

export const Violation = mongoose.model('Violation', violationSchema);
