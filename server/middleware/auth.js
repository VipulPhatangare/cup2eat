import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const COOKIE = 'c2e_admin';
const MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error('JWT_SECRET is missing or too short (use at least 32 characters). See server/.env.example');
  return s;
}

// call at startup so a missing secret stops the server instead of failing at the first login
export const assertAuthConfig = () => { secret(); };

export function setSession(res, admin) {
  const token = jwt.sign({ sub: String(admin._id), role: admin.role }, secret(), { expiresIn: '8h' });
  res.cookie(COOKIE, token, {
    httpOnly: true, // not readable by page scripts
    sameSite: 'strict', // never sent from other sites (blocks cross-site request forgery)
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE_MS,
    path: '/',
  });
}

export const clearSession = (res) => res.clearCookie(COOKIE, { path: '/' });

// every /api/admin route (except login) goes through this
export async function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE];
    if (!token) return res.status(401).json({ message: 'Please log in.' });
    let payload;
    try {
      payload = jwt.verify(token, secret());
    } catch {
      return res.status(401).json({ message: 'Your session has ended. Please log in again.' });
    }
    const admin = await Admin.findById(payload.sub);
    if (!admin) return res.status(401).json({ message: 'Please log in.' });
    // a password change logs out every older session
    if (admin.passwordChangedAt && payload.iat * 1000 < admin.passwordChangedAt.getTime() - 1000) {
      return res.status(401).json({ message: 'Your password was changed. Please log in again.' });
    }
    req.admin = admin;
    req.tokenIssuedAt = payload.iat * 1000;
    next();
  } catch (err) {
    next(err);
  }
}

export const requireOwner = (req, res, next) =>
  req.admin?.role === 'owner' ? next() : res.status(403).json({ message: 'Only the owner can do this.' });
