import test from 'node:test';
import assert from 'node:assert/strict';
import { scryptSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { authenticated, cookie, credentialsMatch, sameOrigin, sessionToken, protect } from '../lib/auth.js';
import { driveEmbed, safeUrl, validateProject } from '../lib/projects.js';

const salt = 'a'.repeat(32);
Object.assign(process.env, { ADMIN_USERNAME: 'owner', ADMIN_PASSWORD_HASH: `${salt}:${scryptSync('test-password-only', salt, 64).toString('hex')}`, SESSION_SECRET: 'b'.repeat(64), DATABASE_URL: 'test', BLOB_READ_WRITE_TOKEN: 'test' });
const originalVercel = process.env.VERCEL;
const request = token => ({ headers: { cookie: `cas_admin=${token}`, host: 'portfolio.example', origin: 'https://portfolio.example' } });

test('password hashing rejects incorrect credentials', () => {
  assert.equal(credentialsMatch('owner', 'test-password-only'), true);
  assert.equal(credentialsMatch('owner', 'incorrect'), false);
  assert.equal(credentialsMatch('someone', 'test-password-only'), false);
  assert.equal(credentialsMatch('owner', null), false);
});
test('sessions reject expired and tampered tokens', () => {
  const now = Date.now(); const token = sessionToken(now);
  assert.equal(authenticated(request(token), now), true);
  assert.equal(authenticated(request(token), now + 8 * 3600 * 1000), false);
  assert.equal(authenticated(request(token + 'x'), now), false);
  assert.equal(authenticated({ headers: {} }), false);
  const [payload, signature] = token.split('.');
  const forged = Buffer.from(JSON.stringify({ user: 'owner', expires: now + 1e12 })).toString('base64url');
  assert.equal(authenticated(request(`${forged}.${signature}`)), false);
});
test('writes require both login and same origin', () => {
  assert.equal(sameOrigin(request('')), true);
  assert.equal(sameOrigin({ headers: { host: 'portfolio.example', origin: 'https://attacker.example' } }), false);
  assert.equal(sameOrigin({ headers: { host: 'portfolio.example' } }), false);
  let status;
  const res = { setHeader() {}, status(value) { status = value; return this; }, json() {} };
  assert.equal(protect({ headers: {} }, res), false); assert.equal(status, 401);
  const crossSite = request(sessionToken()); crossSite.headers.origin = 'https://attacker.example';
  assert.equal(protect(crossSite, res), false); assert.equal(status, 403);
  assert.equal(protect(request(sessionToken()), res), true);
});
test('production cookies are secure and inaccessible to JavaScript', () => {
  process.env.VERCEL = '1';
  const value = cookie(request(''), 'token');
  for (const flag of ['HttpOnly', 'SameSite=Strict', 'Secure', 'Path=/api']) assert.ok(value.includes(flag));
  if (originalVercel === undefined) delete process.env.VERCEL; else process.env.VERCEL = originalVercel;
});
test('Google Drive share and open links become restricted-host embeds', () => {
  const id = 'abcdefghij_1234567890';
  for (const link of [`https://drive.google.com/file/d/${id}/view?usp=sharing`, `https://drive.google.com/open?id=${id}`, `https://drive.google.com/file/d/${id}/preview`]) assert.equal(driveEmbed(link), `https://drive.google.com/file/d/${id}/preview`);
  for (const link of ['https://attacker.example/file/d/abcdefghijk/view', 'javascript:alert(1)', 'https://drive.google.com/drive/folders/abcdefghijk', 'https://drive.google.com/open?id=abc%22%3E']) assert.throws(() => driveEmbed(link));
  assert.equal(driveEmbed(''), '');
});
test('project URL validation rejects active content and malformed records', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,bad', '//evil.example', 'assets/../admin.html', 'https://user:pass@example.com']) assert.throws(() => safeUrl(url));
  assert.equal(safeUrl('assets/images/cover%20image.png'), 'assets/images/cover%20image.png');
  const base = { slug: 'new-project', title: 'Project', category: 'Web', description: 'Example', tags: ['JS'], gallery: [], driveVideoUrl: 'https://drive.google.com/file/d/abcdefghijk/view' };
  assert.equal(validateProject(base).driveVideoUrl, 'https://drive.google.com/file/d/abcdefghijk/preview');
  assert.throws(() => validateProject({ ...base, slug: '../bad' }));
  assert.throws(() => validateProject({ ...base, title: '' }));
  assert.throws(() => validateProject({ ...base, gallery: [{ src: 'javascript:alert(1)' }] }));
  assert.deepEqual(validateProject({ slug: 'new-project', deleted: true }), { slug: 'new-project', deleted: true });
});
test('saved changes override originals and deletions stay removed', () => {
  const context = { window: {} }; vm.runInNewContext(readFileSync(new URL('../js/project-store.js', import.meta.url), 'utf8'), context);
  const original = [{ slug: 'first', title: 'First' }, { slug: 'second', title: 'Second' }];
  const result = context.window.ProjectStore.merge(original, [{ slug: 'third', title: 'Third' }, { slug: 'first', title: 'Edited', version: 2 }, { slug: 'second', deleted: true }]);
  assert.equal(JSON.stringify(result), JSON.stringify([{ slug: 'third', title: 'Third' }, { slug: 'first', title: 'Edited', version: 2 }]));
  assert.equal(original[0].title, 'First');
});

test('upload checks actual file signatures rather than trusting file extensions', async () => {
  const { imageType } = await import('../api/upload.js');
  assert.equal(imageType(Buffer.from([137,80,78,71,13,10,26,10])), 'image/png');
  assert.equal(imageType(Buffer.from([255,216,255,224])), 'image/jpeg');
  assert.equal(imageType(Buffer.from('GIF89a')), 'image/gif');
  assert.equal(imageType(Buffer.from('RIFFxxxxWEBP')), 'image/webp');
  assert.equal(imageType(Buffer.from('<svg onload="alert(1)">')), null);
  assert.equal(imageType(Buffer.alloc(0)), null);
});

test('API handlers reject unauthenticated writes before touching storage', async () => {
  const { default: projects } = await import('../api/projects.js');
  const { default: upload } = await import('../api/upload.js');
  for (const [handler, method] of [[projects, 'PUT'], [upload, 'POST']]) {
    let status, body;
    const res = { setHeader() {}, status(value) { status = value; return this; }, json(value) { body = value; } };
    await handler({ method, headers: {} }, res);
    assert.equal(status, 401);
    assert.match(body.error, /sign in/i);
  }
});

test('unconfigured deployment reports setup status without exposing secrets', async () => {
  const { default: session } = await import('../api/session.js');
  const secret = process.env.SESSION_SECRET; delete process.env.SESSION_SECRET;
  try {
    let status, body;
    const res = { setHeader() {}, status(value) { status = value; return this; }, json(value) { body = value; } };
    await session({ method: 'GET', headers: {} }, res);
    assert.equal(status, 503); assert.match(body.error, /setup is incomplete/);
    assert.equal(JSON.stringify(body).includes(process.env.ADMIN_PASSWORD_HASH), false);
  } finally { process.env.SESSION_SECRET = secret; }
});
