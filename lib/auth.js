import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';

export function configured() {
  return Boolean(process.env.ADMIN_USERNAME && /^[a-f0-9]{32}:[a-f0-9]{128}$/.test(process.env.ADMIN_PASSWORD_HASH || '') && process.env.SESSION_SECRET?.length >= 32 && process.env.DATABASE_URL && process.env.BLOB_READ_WRITE_TOKEN);
}
const sign = (value) => createHmac('sha256', process.env.SESSION_SECRET).update(value).digest('base64url');
export function credentialsMatch(username, password) {
  const [salt, hash] = (process.env.ADMIN_PASSWORD_HASH || '').split(':');
  if (!salt || !hash || typeof password !== 'string' || password.length > 1024) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual) && username === process.env.ADMIN_USERNAME;
}
export function sessionToken(now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ expires: now + 8 * 60 * 60 * 1000, user: process.env.ADMIN_USERNAME })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}
export function authenticated(req, now = Date.now()) {
  if (!configured()) return false;
  try {
    const token = (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith('cas_admin='))?.slice(10);
    const [payload, signature] = token.split('.');
    const actual = Buffer.from(signature);
    const expected = Buffer.from(sign(payload));
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.expires > now && data.user === process.env.ADMIN_USERNAME;
  } catch { return false; }
}
export function cookie(req, token, maxAge = 28800) {
  const secure = process.env.VERCEL || req.headers['x-forwarded-proto'] === 'https';
  return `cas_admin=${token}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}
export function sameOrigin(req) {
  try {
    const origin = new URL(req.headers.origin);
    return origin.host === req.headers.host && ['https:', ...(process.env.VERCEL ? [] : ['http:'])].includes(origin.protocol);
  } catch { return false; }
}
export function protect(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!configured()) { res.status(503).json({ error: 'Admin setup is incomplete. Follow ADMIN_SETUP.md to configure Vercel.' }); return false; }
  if (!authenticated(req)) { res.status(401).json({ error: 'Please sign in again. Your unsaved form is still here.' }); return false; }
  if (!sameOrigin(req)) { res.status(403).json({ error: 'Request origin is not allowed.' }); return false; }
  return true;
}
