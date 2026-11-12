import { database } from '../lib/database.js';
import { protect } from '../lib/auth.js';
import { validateProject } from '../lib/projects.js';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'PUT'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed.' });
  if (req.method === 'PUT' && !protect(req, res)) return;
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Project database is not configured.' });
  try {
    const sql = database();
    if (req.method === 'GET') {
      const rows = await sql`SELECT project, version FROM portfolio_projects ORDER BY updated_at DESC`;
      return res.json({ projects: rows.map(row => ({ ...row.project, version: row.version })) });
    }
    let project;
    try { project = validateProject(req.body?.project); }
    catch (error) { return res.status(400).json({ error: error.message }); }
    const version = req.body?.version;
    if (!Number.isInteger(version) || version < 0) return res.status(400).json({ error: 'Invalid project version.' });
    const data = JSON.stringify(project);
    const rows = version === 0
      ? await sql`INSERT INTO portfolio_projects (slug, project) VALUES (${project.slug}, ${data}::jsonb) ON CONFLICT (slug) DO NOTHING RETURNING version`
      : await sql`UPDATE portfolio_projects SET project = ${data}::jsonb, version = version + 1, updated_at = now() WHERE slug = ${project.slug} AND version = ${version} RETURNING version`;
    if (!rows.length) return res.status(409).json({ error: 'This project changed in another tab. Reload before editing it again.' });
    return res.json({ project: { ...project, version: rows[0].version } });
  } catch (error) {
    console.error('Project storage failed:', error.name);
    return res.status(503).json({ error: 'Project storage is unavailable. Check the database connection and schema setup.' });
  }
}
