CREATE TABLE IF NOT EXISTS portfolio_projects (
  slug text PRIMARY KEY,
  project jsonb NOT NULL,
  version integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS portfolio_login_attempts (
  key text PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now()
);
