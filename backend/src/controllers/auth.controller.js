// import UAParser from 'ua-parser-js';
import { UAParser } from 'ua-parser-js';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { User } from '../models/User.js';
import { generateCandidateId } from '../utils/generateCandidateId.js';
import { signToken } from '../utils/token.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const authSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  fingerprint: z.string().optional(),
});

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function serializeUser(user) {
  return {
    id: user._id,
    candidateId: user.candidateId,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    department: user.department,
    riskScore: user.riskScore,
    authProvider: user.authProvider,
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

  const candidateId = await generateCandidateId();

  const user = await User.create({
    candidateId,
    name: data.name || data.email.split('@')[0],
    email: data.email,
    password: data.password,
    role: 'student',
    department: 'Computer Science',
    devices: [deviceFromRequest(req, data.fingerprint)],
    authProvider: 'local',
  });

  res.status(201).json({ token: signToken(user), user: serializeUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const data = authSchema.pick({ email: true, password: true, fingerprint: true }).parse(req.body);
  const user = await User.findOne({ email: data.email }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  if (user.authProvider === 'google' && !user.password) {
    return res.status(401).json({ message: 'This account uses Google Sign-In. Please use the "Continue with Google" button.' });
  }
  if (!(await user.comparePassword(data.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  user.devices.push(deviceFromRequest(req, data.fingerprint));
  await user.save();
  res.json({ token: signToken(user), user: serializeUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { credential, token } = req.body;
  const googleToken = credential || token;
  if (!googleToken) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  // Verify Google ID token
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch {
    return res.status(401).json({ message: 'Invalid Google token' });
  }

  const payload = ticket.getPayload();
  const { sub: googleId, name, email, picture } = payload;

  // 1. Check if a user with this googleId already exists
  let user = await User.findOne({ googleId });
  if (user) {
    // Update avatar if it changed
    if (picture && user.avatar !== picture) {
      user.avatar = picture;
      await user.save();
    }
    return res.json({ token: signToken(user), user: serializeUser(user) });
  }

  // 2. Check if a user with this email already exists (account linking)
  user = await User.findOne({ email });
  if (user) {
    user.googleId = googleId;
    user.authProvider = user.authProvider === 'local' ? 'local' : 'google';
    if (picture && !user.avatar) user.avatar = picture;
    await user.save();
    return res.json({ token: signToken(user), user: serializeUser(user) });
  }

  // 3. Create a new user
  const candidateId = await generateCandidateId();
  user = await User.create({
    candidateId,
    name: name || email.split('@')[0],
    email,
    googleId,
    avatar: picture,
    role: 'student',
    department: 'Computer Science',
    authProvider: 'google',
  });

  res.status(201).json({ token: signToken(user), user: serializeUser(user) });
});

