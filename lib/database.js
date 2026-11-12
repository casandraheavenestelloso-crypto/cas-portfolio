import { neon } from '@neondatabase/serverless';
export function database() { return neon(process.env.DATABASE_URL); }
