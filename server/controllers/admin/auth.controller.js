import bcrypt from 'bcryptjs';
import { z } from 'zod';
import Admin from '../../models/Admin.js';
import { setSession, clearSession } from '../../middleware/auth.js';
import { audit, httpError } from '../../lib/helpers.js';

const COST = 12;
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
// compared against when the email is unknown, so "no such user" takes as long as "wrong password"
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', COST);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const loginBody = z.object({
  email: z.string().trim().toLowerCase().email('Enter your email'),
  password: z.string().min(1, 'Enter your password').max(200),
});

export const passwordBody = z.object({
  current: z.string().min(1, 'Enter your current password').max(200),
  next: z.string().min(10, 'Use at least 10 characters').max(200),
});

const publicAdmin = (a) => ({ id: a._id, email: a.email, name: a.name, role: a.role, lastLoginAt: a.lastLoginAt });

export async function login(req, res) {
  const { email, password } = req.valid;
  const admin = await Admin.findOne({ email }).select('+passwordHash');
  const reject = async () => {
    await sleep(350);
    throw httpError(401, 'Wrong email or password.');
  };

  if (!admin) {
    await bcrypt.compare(password, DUMMY_HASH);
    return reject();
  }
  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    throw httpError(429, 'Too many wrong attempts. Please try again in 15 minutes.');
  }
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    admin.failedAttempts += 1;
    if (admin.failedAttempts >= MAX_FAILS) {
      admin.failedAttempts = 0;
      admin.lockedUntil = new Date(Date.now() + LOCK_MS);
    }
    await admin.save();
    return reject();
  }

  admin.failedAttempts = 0;
  admin.lockedUntil = undefined;
  admin.lastLoginAt = new Date();
  await admin.save();
  setSession(res, admin);
  req.admin = admin;
  await audit(req, 'auth.login', admin.email);
  res.json({ admin: publicAdmin(admin) });
}

export async function logout(req, res) {
  clearSession(res);
  res.json({ ok: true });
}

export async function me(req, res) {
  // sliding session: hand out a fresh cookie once the current one is over 1 hour old
  if (Date.now() - req.tokenIssuedAt > 60 * 60 * 1000) setSession(res, req.admin);
  res.json({ admin: publicAdmin(req.admin) });
}

export async function changePassword(req, res) {
  const { current, next } = req.valid;
  const admin = await Admin.findById(req.admin._id).select('+passwordHash');
  if (!(await bcrypt.compare(current, admin.passwordHash))) throw httpError(400, 'Your current password is wrong.');
  admin.passwordHash = await bcrypt.hash(next, COST);
  admin.passwordChangedAt = new Date();
  await admin.save();
  setSession(res, admin); // keep this browser logged in; every other session is now invalid
  req.admin = admin;
  await audit(req, 'auth.password', admin.email);
  res.json({ message: 'Password changed.' });
}
