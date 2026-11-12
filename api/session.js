import { createHmac } from 'node:crypto';
import { authenticated, configured, cookie, credentialsMatch, sameOrigin, sessionToken } from '../lib/auth.js';
import { database } from '../lib/database.js';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!configured()) return res.status(503).json({ error: 'Admin setup is incomplete. Follow ADMIN_SETUP.md to configure Vercel.' });
  if (req.method === 'GET') return res.json({ authenticated: authenticated(req) });
  if (!['POST', 'DELETE'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed.' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Request origin is not allowed.' });
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', cookie(req, '', 0));
    return res.json({ ok: true });
  }
  try {
    const sql = database();
    // A shared account bucket persists across serverless instances and spoofed IPs.
    const key = createHmac('sha256', process.env.SESSION_SECRET).update('admin-login').digest('hex');
    const [attempt] = await sql`INSERT INTO portfolio_login_attempts (key) VALUES (${key}) ON CONFLICT (key) DO UPDATE SET attempts = CASE WHEN portfolio_login_attempts.window_start < now() - interval '15 minutes' THEN 1 ELSE portfolio_login_attempts.attempts + 1 END, window_start = CASE WHEN portfolio_login_attempts.window_start < now() - interval '15 minutes' THEN now() ELSE portfolio_login_attempts.window_start END RETURNING attempts`;
    if (attempt.attempts > 10) { res.setHeader('Retry-After', '900'); return res.status(429).json({ error: 'Too many login attempts. Try again in 15 minutes.' }); }
    if (!credentialsMatch(req.body?.username, req.body?.password)) return res.status(401).json({ error: 'Incorrect username or password.' });
    await sql`DELETE FROM portfolio_login_attempts WHERE key = ${key}`;
    res.setHeader('Set-Cookie', cookie(req, sessionToken()));
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin login failed:', error.name);
    return res.status(503).json({ error: 'Login is unavailable. Check the database connection and schema setup.' });
  }
}
