# Activate Project Studio on Vercel

The portfolio stays plain HTML/CSS/JavaScript. `/admin` adds a single-owner editor backed by Vercel Functions, Neon Postgres, and a **public** Vercel Blob store. Project changes appear without rebuilding the website. Existing projects remain in `js/projects-data.js`; database records override them, including deletion records.

## 1. Connect storage

In your existing Vercel project's **Storage** tab:

1. Connect a Neon Postgres database through the marketplace. Ensure its connection string is available as `DATABASE_URL` in the desired deployment environments.
2. Create/connect a **public** Vercel Blob store. Vercel supplies `BLOB_READ_WRITE_TOKEN`.
3. Open Neon's SQL editor for the connected database and execute each `CREATE TABLE` statement from [scripts/schema.sql](scripts/schema.sql) separately, with Read-only disabled. This creates project records and persistent login attempt limits. Do this before signing in.

Database and Blob accounts have separate usage limits. No credentials belong in browser JavaScript or Git.

## 2. Set the admin login

With Node.js 22 or newer installed, run:

```sh
npm install
npm run admin:password
```

Enter a strong password at the hidden prompt. Save it in your password manager. The command prints a salted password hash and a random session secret; copy those values into Vercel's **Settings → Environment Variables**, along with your chosen `ADMIN_USERNAME`:

- `DATABASE_URL`
- `BLOB_READ_WRITE_TOKEN`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`

The password itself is never stored in the project or environment variables. Do not send credentials in chat. Re-running the generator gives a new hash/secret for password resets; changing the session secret invalidates previous sessions.

## 3. Deploy the existing project

Use Vercel's **Other** framework preset, no build command, and the repository root (`.`) as the output directory. Keep dependency installation enabled (`npm install`). Node.js functions live in `api/`; `vercel.json` routes `/admin` to the editor. Redeploy after environment variables are saved.

Visit `https://YOUR-PORTFOLIO-DOMAIN/admin` and sign in. The form supports:

- Add/edit/delete projects, descriptions, tags, and website links.
- Feature projects on the homepage.
- Cover images and up to 30 screenshots, with captions, alternative text, and ordering.
- PNG/JPEG/WebP/GIF uploads, up to 3 MB per file. Larger screenshots must be compressed first.
- A Google Drive video share link such as `https://drive.google.com/file/d/FILE_ID/view`. The server converts it to Google's `/preview` embed URL. In Drive, set General access to **Anyone with the link → Viewer** and allow playback/embedding. Private or restricted videos will request permission or fail for visitors. Folder links aren't supported.
- An optional directly hosted video URL for existing video demos.

All project fields are published when you click **Publish project**. Uploads become publicly accessible immediately, before publishing. Removing an image/project removes its portfolio reference; it does **not** delete the underlying Blob, to avoid breaking reused images. Unused uploads can be removed manually from Vercel Storage after checking references. There is no draft workflow.

Existing slugs are fixed to preserve project links. Simultaneous edits are rejected rather than silently overwriting newer changes; reload before retrying. A deleted slug stays reserved in the database. To restore an original project, remove its deletion record in Neon; to restore a custom project, restore it from your database backup.

## Security and local verification

Login uses a salted scrypt hash, an eight-hour signed HttpOnly/SameSite cookie, same-origin checks for writes, and ten login attempts per 15 minutes for the account. A shared account limit applies across serverless instances; an attacker can temporarily exhaust it. Use a strong unique password. The admin HTML is publicly accessible, but project writes and uploads require a valid session. There is no public registration.

For local development, copy `.env.example` to `.env.local`, fill it with development credentials, and run `npm run dev:vercel` (Vercel CLI may ask you to link the existing project). Run `npm test` for authentication, URL validation, and project merge tests. Static previews and opening `index.html` directly still show the original projects; backend editing requires Vercel Functions.

After deployment, check incorrect/correct login, publish a test project, upload an image, embed a publicly shared Drive video, check the homepage/projects/detail pages, edit/delete the test project, and sign out. No live database or Blob connection is tested by the unit suite.

If Vercel reports `DEV_RECURSIVE_INVOCATION`, confirm there is no `dev` script calling `vercel dev` and the project Development Command override is disabled. Use `npm run dev:vercel`; Vercel can then serve the static files and API functions directly.
