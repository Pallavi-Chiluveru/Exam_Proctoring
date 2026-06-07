// import UAParser from 'ua-parser-js';
import { UAParser } from 'ua-parser-js';
import { z } from 'zod';
import { User } from '../models/User.js';
import { signToken } from '../utils/token.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const authSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['student', 'admin']).optional(),
  fingerprint: z.string().optional(),
});

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    department: user.department,
    riskScore: user.riskScore,
  };
}

function deviceFromRequest(req, fingerprint) {
  const parser = new UAParser(req.headers['user-agent']);
  const result = parser.getResult();
  return {
    fingerprint,
    ip: req.ip,
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
    lastSeenAt: new Date(),
  };
}

export const register = asyncHandler(async (req, res) => {
  const data = authSchema.parse(req.body);
  const exists = await User.findOne({ email: data.email });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  const user = await User.create({
    name: data.name || data.email.split('@')[0],
    email: data.email,
    password: data.password,
    role: data.role || 'student',
    department: data.role === 'admin' ? 'Exam Operations' : 'Computer Science',
    devices: [deviceFromRequest(req, data.fingerprint)],
  });

  res.status(201).json({ token: signToken(user), user: serializeUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const data = authSchema.pick({ email: true, password: true, fingerprint: true }).parse(req.body);
  const user = await User.findOne({ email: data.email }).select('+password');
  if (!user || !(await user.comparePassword(data.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  user.devices.push(deviceFromRequest(req, data.fingerprint));
  await user.save();
  res.json({ token: signToken(user), user: serializeUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: serializeUser(req.user) });
});
