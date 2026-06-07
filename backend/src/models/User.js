import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const deviceSchema = new mongoose.Schema(
  {
    fingerprint: String,
    ip: String,
    browser: String,
    os: String,
    lastSeenAt: Date,
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    avatar: String,
    department: String,
    riskScore: { type: Number, default: 0 },
    devices: [deviceSchema],
  },
  { timestamps: true },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);
